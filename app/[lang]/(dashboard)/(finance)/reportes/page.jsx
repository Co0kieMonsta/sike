"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTransacciones, getCuentas, getCategorias } from "@/config/finanzas.config";
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
import { Badge } from "@/components/ui/badge";
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

const ReportesPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, categoriasRes] = await Promise.all([
        getTransacciones(),
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
  }, []);

  // Calculate statistics
  const categoryTotals = transacciones.reduce((acc, t) => {
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

  const metodoPagoTotals = transacciones.reduce((acc, t) => {
    if (!acc[t.metodoPago]) {
      acc[t.metodoPago] = 0;
    }
    acc[t.metodoPago] += t.monto;
    return acc;
  }, {});

  // Monthly trend (last 6 months simulation)
  const currentDate = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
    const monthName = month.toLocaleDateString('es-ES', { month: 'short' });
    
    // Simulate data - in real app, filter by month
    const randomIngresos = Math.random() * 30000 + 20000;
    const randomEgresos = Math.random() * 25000 + 15000;
    
    return {
      mes: monthName,
      ingresos: randomIngresos,
      egresos: randomEgresos,
      balance: randomIngresos - randomEgresos,
    };
  });

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text("Reporte Financiero", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Summary
      doc.setFontSize(12);
      doc.text("Resumen Ejecutivo", 14, 45);
      autoTable(doc, {
        startY: 50,
        head: [['Concepto', 'Monto']],
        body: [
          ['Total Ingresos', `$${summary.ingresos?.toLocaleString()}`],
          ['Total Egresos', `$${summary.egresos?.toLocaleString()}`],
          ['Balance Neto', `$${summary.balance?.toLocaleString()}`],
        ],
      });

      // Transactions
      doc.text("Transacciones", 14, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Fecha', 'Tipo', 'Categoría', 'Monto', 'Método']],
        body: transacciones.map(t => [
          new Date(t.fecha).toLocaleDateString(),
          t.tipo,
          t.categoria,
          `$${t.monto}`,
          t.metodoPago
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
        ["Concepto", "Monto"],
        ["Total Ingresos", summary.ingresos],
        ["Total Egresos", summary.egresos],
        ["Balance Neto", summary.balance],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

      // Transactions Sheet
      const transData = transacciones.map(t => ({
        Fecha: t.fecha,
        Tipo: t.tipo,
        Categoría: t.categoria,
        Subcategoría: t.subcategoria,
        Monto: t.monto,
        Método: t.metodoPago,
        Cuenta: t.cuenta,
        Estado: t.estado,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reportes Financieros
          </h1>
          <p className="text-muted-foreground">
            Análisis detallado de tus finanzas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
              <SelectItem value="ano">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Exportar Reporte
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToXLS}>
                <FileSpreadsheet className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
          <CardDescription>Balance general del periodo seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Ingresos
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Egresos
              </p>
              <p className="text-2xl font-bold text-red-600">
                ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Balance Neto
              </p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">


        {/* Monthly Trend */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tendencia Mensual
            </CardTitle>
            <CardDescription>Comparativa de Ingresos vs Egresos (Últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs text-muted-foreground" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground" 
                    tickFormatter={(value) => `$${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    name="Ingresos"
                    stroke="#16a34a" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="egresos" 
                    name="Egresos"
                    stroke="#dc2626" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Métodos de Pago
            </CardTitle>
            <CardDescription>Distribución por método</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metodoPagoTotals)
                .sort(([_, a], [__, b]) => b - a)
                .map(([metodo, total]) => {
                  const totalTransacciones = Object.values(metodoPagoTotals).reduce((a, b) => a + b, 0);
                  const percentage = (total / totalTransacciones) * 100;
                  return (
                    <div key={metodo} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{metodo}</span>
                        <span className="font-semibold">
                          ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Ingresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .filter(([_, totals]) => totals.ingreso > 0)
                .sort(([_, a], [__, b]) => b.ingreso - a.ingreso)
                .map(([categoria, totals]) => {
                  const percentage = (totals.ingreso / summary.ingresos) * 100;
                  return (
                    <div key={categoria} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria}</span>
                        <div className="text-right">
                          <span className="text-green-600 font-semibold">
                            ${totals.ingreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {totals.count} transacción(es)
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Egresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .filter(([_, totals]) => totals.egreso > 0)
                .sort(([_, a], [__, b]) => b.egreso - a.egreso)
                .map(([categoria, totals]) => {
                  const percentage = (totals.egreso / summary.egresos) * 100;
                  return (
                    <div key={categoria} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria}</span>
                        <div className="text-right">
                          <span className="text-red-600 font-semibold">
                            ${totals.egreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {totals.count} transacción(es)
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Categorías con Mayor Movimiento</CardTitle>
          <CardDescription>Categorías con más transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .sort(([_, a], [__, b]) => b.count - a.count)
              .slice(0, 5)
              .map(([categoria, totals], index) => (
                <div key={categoria} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{categoria}</p>
                      <p className="text-sm text-muted-foreground">
                        {totals.count} transacción(es)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {totals.ingreso > 0 && (
                      <p className="text-sm text-green-600">
                        +${totals.ingreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {totals.egreso > 0 && (
                      <p className="text-sm text-red-600">
                        -${totals.egreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumen del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Periodo</p>
              <p className="font-semibold capitalize">{periodo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Transacciones</p>
              <p className="font-semibold">{transacciones.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Promedio por Transacción</p>
              <p className="font-semibold">
                ${((summary.ingresos + summary.egresos) / transacciones.length).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Categorías Activas</p>
              <p className="font-semibold">{Object.keys(categoryTotals).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesPage;

