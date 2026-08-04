"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTransacciones, getCategorias } from "@/config/finanzas.config";
import { toast } from "react-hot-toast";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Download,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border p-3 rounded-xl shadow-xl flex flex-col gap-2">
        <p className="font-semibold text-sm capitalize mb-1">{label}</p>
        {payload.map((p, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium">${p.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReportesPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  const [agrupacion, setAgrupacion] = useState("mensual");

  const getFechas = (per) => {
    const today = new Date();
    let start, end;
    
    // Configurar fechas sin time zone issues (local date strings)
    const formatDate = (date) => date.toISOString().split('T')[0];

    end = new Date();
    
    if (per === "semana") {
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
    } else if (per === "mes") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (per === "trimestre") {
      const quarter = Math.floor(today.getMonth() / 3);
      start = new Date(today.getFullYear(), quarter * 3, 1);
      end = new Date(today.getFullYear(), start.getMonth() + 3, 0);
    } else if (per === "ano") {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else {
      return { fechaInicio: null, fechaFin: null }; // historico
    }
    
    return { fechaInicio: formatDate(start), fechaFin: formatDate(end) };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { fechaInicio, fechaFin } = getFechas(periodo);
      const [transRes, categoriasRes] = await Promise.all([
        getTransacciones({ fechaInicio, fechaFin }),
        getCategorias(),
      ]);

      if (transRes.status === "success") {
        setTransacciones(transRes.data);
        setSummary(transRes.summary);
      }
      if (categoriasRes.status === "success") setCategorias(categoriasRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  // Calculate statistics (only completado are in summary, but transacciones might have pendientes. Let's filter completados for charts)
  const completadas = transacciones.filter(t => t.estado === "completado");

  const categoryTotals = completadas.reduce((acc, t) => {
    if (!acc[t.categoria]) {
      acc[t.categoria] = { ingreso: 0, egreso: 0, count: 0 };
    }
    if (t.tipo === "ingreso") {
      acc[t.categoria].ingreso += t.monto;
    } else {
      acc[t.categoria].egreso += t.monto;
    }
    acc[t.categoria].count++;
    return acc;
  }, {});

  const metodoPagoTotals = completadas.reduce((acc, t) => {
    if (!acc[t.metodoPago]) {
      acc[t.metodoPago] = 0;
    }
    acc[t.metodoPago] += t.monto;
    return acc;
  }, {});

  // Monthly trend (last 6 months real data OR just the period distribution depending on view... we will keep it as monthly flow over the filtered data)
  // If period is 'semana' or 'mes', it might make more sense to do daily. But to keep it simple, we use the existing grouping. If it's a single month, they will all group into one dot. Let's group by day if period is mes or semana, and month if ano or historico.
  const isDaily = agrupacion === "diario";
  
  const timeFlow = completadas.reduce((acc, t) => {
    const d = new Date(t.fecha);
    let key, label;
    
    if (isDaily) {
      key = t.fecha;
      label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      label = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
    
    if (!acc[key]) {
      acc[key] = { label, sortKey: key, ingresos: 0, egresos: 0, balance: 0 };
    }
    if (t.tipo === "ingreso") {
      acc[key].ingresos += t.monto;
      acc[key].balance += t.monto;
    } else {
      acc[key].egresos += t.monto;
      acc[key].balance -= t.monto;
    }
    
    return acc;
  }, {});

  const flowData = Object.values(timeFlow)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title & Styling
      doc.setFillColor(37, 99, 235); // Blue primary
      doc.rect(0, 0, 220, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Reporte Financiero", 14, 20);
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const filterLabel = periodo.toUpperCase();
      doc.text(`Generado: ${new Date().toLocaleDateString()} | Periodo: ${filterLabel}`, 14, 40);
      
      // Summary Cards (drawn manually)
      doc.setFillColor(240, 248, 255); // light blue
      doc.roundedRect(14, 45, 55, 25, 3, 3, 'F');
      doc.roundedRect(75, 45, 55, 25, 3, 3, 'F');
      doc.roundedRect(136, 45, 55, 25, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Total Ingresos", 20, 53);
      doc.text("Total Egresos", 81, 53);
      doc.text("Balance Neto", 142, 53);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74); // green
      doc.text(`$${summary.ingresos?.toLocaleString()}`, 20, 63);
      doc.setTextColor(220, 38, 38); // red
      doc.text(`$${summary.egresos?.toLocaleString()}`, 81, 63);
      doc.setTextColor(summary.balance >= 0 ? 22 : 220, summary.balance >= 0 ? 163 : 38, summary.balance >= 0 ? 74 : 38);
      doc.text(`$${summary.balance?.toLocaleString()}`, 142, 63);

      // Transactions Table
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text("Detalle de Transacciones (Completadas)", 14, 85);
      
      autoTable(doc, {
        startY: 90,
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'left' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        head: [['Fecha', 'Tipo', 'Categoría', 'Monto', 'Método']],
        body: completadas.map(t => [
          new Date(t.fecha).toLocaleDateString(),
          t.tipo.toUpperCase(),
          t.categoria || '-',
          `$${t.monto}`,
          t.metodoPago || '-'
        ]),
      });

      doc.save(`reporte_financiero_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar PDF");
    }
  };

  const exportToXLS = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ["Reporte Financiero"],
        ["Periodo:", periodo.toUpperCase()],
        ["Fecha de Emisión:", new Date().toLocaleDateString()],
        [],
        ["Concepto", "Monto"],
        ["Total Ingresos", summary.ingresos],
        ["Total Egresos", summary.egresos],
        ["Balance Neto", summary.balance],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

      // Transactions Sheet
      const transData = completadas.map(t => ({
        Fecha: t.fecha,
        Tipo: t.tipo.toUpperCase(),
        Categoría: t.categoria,
        Subcategoría: t.subcategoria,
        Monto: t.monto,
        Método: t.metodoPago,
        Cuenta: t.cuenta,
        Estado: t.estado.toUpperCase(),
        Descripción: t.descripcion
      }));
      const wsTrans = XLSX.utils.json_to_sheet(transData);
      XLSX.utils.book_append_sheet(wb, wsTrans, "Transacciones");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      saveAs(data, `reporte_financiero_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Excel exportado exitosamente");
    } catch (error) {
        console.error(error);
        toast.error("Error al exportar Excel");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="mb-5 overflow-visible z-10 relative">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Reportes Financieros
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  Análisis detallado filtrado por periodo
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="mes">Este Mes</SelectItem>
                    <SelectItem value="trimestre">Este Trimestre</SelectItem>
                    <SelectItem value="ano">Este Año</SelectItem>
                    <SelectItem value="historico">Todo el Histórico</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full sm:w-auto shadow-sm">
                      <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer py-2">
                      <FileText className="mr-2 h-4 w-4 text-red-500" />
                      <span>Documento PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToXLS} className="cursor-pointer py-2">
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                      <span>Hoja de Excel</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Summary Section */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-transparent bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle>Resumen del Periodo</CardTitle>
            <CardDescription>Totales consolidados de operaciones completadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Total Ingresos
                </p>
                <p className="text-3xl font-black text-green-600">
                  ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2 font-medium">
                  <TrendingDown className="h-4 w-4" />
                  Total Egresos
                </p>
                <p className="text-3xl font-black text-red-600">
                  ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2 font-medium">
                  <BarChart3 className="h-4 w-4" />
                  Balance Neto
                </p>
                <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Monthly Trend */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Flujo de Dinero
                </CardTitle>
                <CardDescription className="mt-1">Evolución en el tiempo del periodo seleccionado</CardDescription>
              </div>
              <Select value={agrupacion} onValueChange={setAgrupacion}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                {flowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="label" 
                        className="text-xs font-medium" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs font-medium" 
                        tickFormatter={(value) => `$${value}`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        name="Ingresos"
                        stroke="#16a34a" 
                        strokeWidth={3}
                        activeDot={{ r: 6, strokeWidth: 0 }} 
                        dot={{ r: 3, strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="egresos" 
                        name="Egresos"
                        stroke="#dc2626" 
                        strokeWidth={3} 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        dot={{ r: 3, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-xl">
                    <p>No hay datos en el periodo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-full shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Métodos de Pago
              </CardTitle>
              <CardDescription>Preferencias de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 mt-2">
                {Object.entries(metodoPagoTotals)
                  .sort(([_, a], [__, b]) => b - a)
                  .map(([metodo, total]) => {
                    const totalTransacciones = Object.values(metodoPagoTotals).reduce((a, b) => a + b, 0);
                    const percentage = (total / totalTransacciones) * 100;
                    return (
                      <div key={metodo} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold capitalize text-foreground/90">{metodo}</span>
                          <span className="font-bold text-primary">
                            ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-primary"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right font-medium">
                          {percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    );
                  })}
                {Object.keys(metodoPagoTotals).length === 0 && (
                  <p className="text-center text-muted-foreground py-10">Sin datos de métodos de pago</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Analysis - Resumen */}
        <motion.div variants={itemVariants}>
          <Card className="h-full shadow-sm">
            <CardHeader>
              <CardTitle>Top Categorías de Egresos</CardTitle>
              <CardDescription>Dónde se va el dinero</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 mt-2">
                {Object.entries(categoryTotals)
                  .filter(([_, totals]) => totals.egreso > 0)
                  .sort(([_, a], [__, b]) => b.egreso - a.egreso)
                  .slice(0, 5)
                  .map(([categoria, totals]) => {
                    const percentage = (totals.egreso / summary.egresos) * 100;
                    return (
                      <div key={categoria} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-foreground/90">{categoria}</span>
                          <div className="text-right">
                            <span className="text-red-600 font-bold">
                              ${totals.egreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-red-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(categoryTotals).filter(c => categoryTotals[c].egreso > 0).length === 0 && (
                  <p className="text-center text-muted-foreground py-10">Sin egresos en el periodo</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default ReportesPage;
