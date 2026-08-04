"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  getTransacciones, 
  getCuentas,
  getCategorias
} from "@/config/finanzas.config";
import { toast } from "react-hot-toast";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  PiggyBank,
  Receipt,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

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

const FinanceDashboard = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, cuentasRes, categoriasRes] = await Promise.all([
        getTransacciones(),
        getCuentas(),
        getCategorias(),
      ]);

      if (transRes.status === "success") {
        setTransacciones(transRes.data || []);
      }
      if (cuentasRes.status === "success") setCuentas(cuentasRes.data);
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

  // Compute period data
  const { currentSummary, growth, filteredTransacciones, areaChartData, pieDataIngresos, pieDataEgresos } = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    
    const isHistorico = periodo === "historico";
    const nonTransfers = transacciones.filter(t => t.categoria !== "TRANSFERENCIA");

    const filtered = nonTransfers.filter(t => {
      if (isHistorico) return true;
      const tTime = new Date(t.fecha).getTime();
      return tTime >= startOfThisMonth;
    });

    const current = { ingresos: 0, egresos: 0, balance: 0, count: filtered.length };
    filtered.forEach(t => {
      if (t.estado !== "completado") return;
      if (t.tipo === "ingreso") current.ingresos += t.monto;
      else current.egresos += t.monto;
    });
    current.balance = current.ingresos - current.egresos;

    const last = { ingresos: 0, egresos: 0, balance: 0 };
    if (!isHistorico) {
      nonTransfers.forEach(t => {
        const tTime = new Date(t.fecha).getTime();
        if (t.estado === "completado" && tTime >= startOfLastMonth && tTime < startOfThisMonth) {
          if (t.tipo === "ingreso") last.ingresos += t.monto;
          else last.egresos += t.monto;
        }
      });
      last.balance = last.ingresos - last.egresos;
    }

    const calcGrowth = (curr, prev) => {
      if (isHistorico) return null; // No growth for historical
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const growthStats = {
      ingresos: calcGrowth(current.ingresos, last.ingresos),
      egresos: calcGrowth(current.egresos, last.egresos),
      balance: calcGrowth(current.balance, last.balance)
    };

    // Category Pie Data
    const catTotals = filtered.reduce((acc, t) => {
      if (t.estado !== "completado") return acc;
      if (!acc[t.categoria]) acc[t.categoria] = { ingreso: 0, egreso: 0 };
      if (t.tipo === "ingreso") acc[t.categoria].ingreso += t.monto;
      else acc[t.categoria].egreso += t.monto;
      return acc;
    }, {});

    const pIngresos = Object.entries(catTotals)
      .filter(([_, totals]) => totals.ingreso > 0)
      .map(([name, totals]) => ({ name, value: totals.ingreso }))
      .sort((a, b) => b.value - a.value);

    const pEgresos = Object.entries(catTotals)
      .filter(([_, totals]) => totals.egreso > 0)
      .map(([name, totals]) => ({ name, value: totals.egreso }))
      .sort((a, b) => b.value - a.value);

    // Area Chart Data (Last 6 months regardless of current filter, as it's a trend chart)
    const monthlyFlow = nonTransfers.reduce((acc, t) => {
      if (t.estado !== "completado") return acc;
      const d = new Date(t.fecha);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-ES', { month: 'short' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: label, sortKey: monthYear, ingresos: 0, egresos: 0 };
      }
      if (t.tipo === "ingreso") acc[monthYear].ingresos += t.monto;
      else acc[monthYear].egresos += t.monto;
      
      return acc;
    }, {});
  
    const aData = Object.values(monthlyFlow)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);

    return { currentSummary: current, growth: growthStats, filteredTransacciones: filtered, areaChartData: aData, pieDataIngresos: pIngresos, pieDataEgresos: pEgresos };
  }, [transacciones, periodo]);

  const recentTransactions = transacciones
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const renderGrowthBadge = (value) => {
    if (value === null) return null;
    const isPositive = value >= 0;
    return (
      <Badge variant="soft" color={isPositive ? "success" : "destructive"} className="mt-2 w-fit">
        {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
        {Math.abs(value).toFixed(1)}% vs mes anterior
      </Badge>
    );
  };

  const renderGrowthBadgeReverse = (value) => { // for expenses, lower is better
    if (value === null) return null;
    const isPositive = value >= 0;
    return (
      <Badge variant="soft" color={isPositive ? "destructive" : "success"} className="mt-2 w-fit">
        {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
        {Math.abs(value).toFixed(1)}% vs mes anterior
      </Badge>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Cargando dashboard...</p>
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
      <motion.div variants={itemVariants}>
        <Card className="mb-5 overflow-visible z-10 relative">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Dashboard Financiero
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  Resumen y estado actual de tus finanzas
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Este Mes</SelectItem>
                    <SelectItem value="historico">Histórico Total</SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/transactions" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Receipt className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    Transacciones
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Balance Neto</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className={`text-2xl font-bold ${currentSummary.balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600'}`}>
                ${currentSummary.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              {renderGrowthBadge(growth.balance)}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Ingresos</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${currentSummary.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              {renderGrowthBadge(growth.ingresos)}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Egresos</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                ${currentSummary.egresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              {renderGrowthBadgeReverse(growth.egresos)}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Volumen</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{currentSummary.count}</div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-2">Transacciones en el periodo</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de Área (Flujo de Caja) */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tendencia Histórica de Flujo de Caja
            </CardTitle>
            <CardDescription>Ingresos vs Egresos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              {areaChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={12} className="text-xs capitalize font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={12} className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Area type="monotone" name="Ingresos" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area type="monotone" name="Egresos" dataKey="egresos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                  <p>No hay datos suficientes para el gráfico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
          <Card className="h-full shadow-sm flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>Últimos movimientos registrados</CardDescription>
                </div>
                <Link href="/transactions">
                  <Button variant="outline" size="sm" className="rounded-full px-4">Ver Todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 transition-all cursor-default">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full shadow-sm ${transaction.tipo === "ingreso" ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                          {transaction.tipo === "ingreso" ? (
                            <ArrowUpCircle className="h-5 w-5" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">{transaction.descripcion}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {transaction.categoria} • {new Date(transaction.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.tipo === "ingreso" ? "+" : "-"}${transaction.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="soft" color={transaction.estado === "completado" ? "success" : "warning"} className="text-[10px] px-1.5 py-0 h-4 mt-1 capitalize">{transaction.estado}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    <Receipt className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium">Sin transacciones recientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 h-full">
          <Card className="h-full shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle>Estado de Cuentas</CardTitle>
              <CardDescription>Patrimonio líquido actual</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {cuentas.length > 0 ? cuentas.map((cuenta) => (
                  <div key={cuenta.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shadow-sm">
                        {cuenta.tipo === "banco" && <CreditCard className="h-4 w-4" />}
                        {cuenta.tipo === "efectivo" && <DollarSign className="h-4 w-4" />}
                        {cuenta.tipo === "tarjeta" && <CreditCard className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{cuenta.nombre}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cuenta.tipo}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${cuenta.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    No hay cuentas registradas
                  </div>
                )}
              </div>
              <div className="pt-6 mt-6 border-t border-border/60">
                <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="font-semibold text-xs uppercase tracking-widest text-primary/80">Patrimonio Total</p>
                  <p className="font-black text-xl text-primary">
                    ${cuentas.reduce((sum, c) => sum + c.saldo, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Ingresos por Categoría
              </CardTitle>
              <CardDescription>Distribución en el periodo seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full mt-2">
                {pieDataIngresos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataIngresos}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieDataIngresos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-xl">
                    <p>Sin ingresos registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Egresos por Categoría
              </CardTitle>
              <CardDescription>Distribución en el periodo seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full mt-2">
                {pieDataEgresos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataEgresos}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieDataEgresos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-xl">
                    <p>Sin egresos registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default FinanceDashboard;
