"use client";

import { useState, useEffect } from "react";
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

const FinanceDashboard = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, cuentasRes, categoriasRes] = await Promise.all([
        getTransacciones(),
        getCuentas(),
        getCategorias(),
      ]);

      if (transRes.status === "success") {
        setTransacciones(transRes.data);
        setSummary(transRes.summary);
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

  const categoryTotals = transacciones.reduce((acc, t) => {
    if (!acc[t.categoria]) {
      acc[t.categoria] = { ingreso: 0, egreso: 0 };
    }
    if (t.tipo === "ingreso") {
      acc[t.categoria].ingreso += t.monto;
    } else {
      acc[t.categoria].egreso += t.monto;
    }
    return acc;
  }, {});

  // Data for Recharts Pie
  const pieDataIngresos = Object.entries(categoryTotals)
    .filter(([_, totals]) => totals.ingreso > 0)
    .map(([name, totals]) => ({ name, value: totals.ingreso }))
    .sort((a, b) => b.value - a.value);

  const pieDataEgresos = Object.entries(categoryTotals)
    .filter(([_, totals]) => totals.egreso > 0)
    .map(([name, totals]) => ({ name, value: totals.egreso }))
    .sort((a, b) => b.value - a.value);

  // Data for Area Chart (Cashflow by month)
  // Get last 6 months
  const monthlyFlow = transacciones.reduce((acc, t) => {
    const d = new Date(t.fecha);
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-ES', { month: 'short' }); // ej. "ene"
    
    if (!acc[monthYear]) {
      acc[monthYear] = { name: label, sortKey: monthYear, ingresos: 0, egresos: 0 };
    }
    if (t.tipo === "ingreso") acc[monthYear].ingresos += t.monto;
    else acc[monthYear].egresos += t.monto;
    
    return acc;
  }, {});

  const areaChartData = Object.values(monthlyFlow)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6); // last 6 months

  const recentTransactions = transacciones
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Dashboard Financiero
          </h1>
          <p className="text-muted-foreground">Resumen general de tus finanzas</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions">
            <Button>
              <Receipt className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Ver Transacciones
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Balance Total</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600'}`}>
              ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Balance neto actual</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Ingresos</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Total acumulado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Egresos</CardTitle>
            <div className="p-2 bg-red-500/20 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Total gastado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Transacciones</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-full">
              <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{transacciones.length}</div>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Total registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Área (Flujo de Caja) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Flujo de Caja (Últimos 6 meses)
          </CardTitle>
          <CardDescription>Comparativa de ingresos y egresos en el tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {areaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} className="text-xs capitalize" />
                  <YAxis axisLine={false} tickLine={false} tickMargin={10} className="text-xs" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Ingresos" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" name="Egresos" dataKey="egresos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEgresos)" />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transacciones Recientes</CardTitle>
                <CardDescription>Últimas {recentTransactions.length} transacciones</CardDescription>
              </div>
              <Link href="/transactions">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.tipo === "ingreso" ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {transaction.tipo === "ingreso" ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.descripcion}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.categoria} • {new Date(transaction.fecha).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.tipo === "ingreso" ? "+" : "-"}${transaction.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="outline" className="text-xs">{transaction.estado}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <Receipt className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium text-lg">Sin transacciones recientes</p>
                  <p className="text-sm">Registra una nueva transacción para verla aquí</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Estado de Cuentas</CardTitle>
            <CardDescription>Balance disponible por cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cuentas.length > 0 ? cuentas.map((cuenta) => (
                <div key={cuenta.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      {cuenta.tipo === "banco" && <CreditCard className="h-4 w-4 text-blue-600" />}
                      {cuenta.tipo === "efectivo" && <DollarSign className="h-4 w-4 text-blue-600" />}
                      {cuenta.tipo === "tarjeta" && <CreditCard className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cuenta.nombre}</p>
                      <p className="text-xs text-muted-foreground capitalize">{cuenta.tipo}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${cuenta.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay cuentas registradas
                </div>
              )}
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                  <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Patrimonio Total</p>
                  <p className="font-bold text-lg">
                    ${cuentas.reduce((sum, c) => sum + c.saldo, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Ingresos por Categoría
            </CardTitle>
            <CardDescription>Distribución de ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              {pieDataIngresos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataIngresos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieDataIngresos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>Sin ingresos registrados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Egresos por Categoría
            </CardTitle>
            <CardDescription>Distribución de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              {pieDataEgresos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataEgresos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieDataEgresos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>Sin egresos registrados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/transactions">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Transacciones</p>
                    <p className="text-xs text-muted-foreground">Gestionar ingresos y egresos</p>
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link href="/cuentas">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Cuentas</p>
                    <p className="text-xs text-muted-foreground">Administrar cuentas</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/categorias">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Categorías</p>
                    <p className="text-xs text-muted-foreground">Gestionar categorías</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/reportes">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Reportes</p>
                    <p className="text-xs text-muted-foreground">Ver análisis detallado</p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;

