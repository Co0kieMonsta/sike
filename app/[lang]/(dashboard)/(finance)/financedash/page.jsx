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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Balance neto actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total de ingresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total de egresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transacciones.length}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>
      </div>

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
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {transaction.tipo === "ingreso" ? (
                        <ArrowUpCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-8 w-8 text-red-600" />
                      )}
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
                <p className="text-center text-muted-foreground py-8">No hay transacciones</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Cuentas</CardTitle>
            <CardDescription>Balance por cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cuentas.map((cuenta) => (
                <div key={cuenta.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cuenta.tipo === "banco" && <CreditCard className="h-5 w-5 text-blue-600" />}
                    {cuenta.tipo === "efectivo" && <DollarSign className="h-5 w-5 text-green-600" />}
                    {cuenta.tipo === "tarjeta" && <CreditCard className="h-5 w-5 text-purple-600" />}
                    <div>
                      <p className="font-medium text-sm">{cuenta.nombre}</p>
                      <p className="text-xs text-muted-foreground">{cuenta.tipo}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${cuenta.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total en Cuentas</p>
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .filter(([_, totals]) => totals.ingreso > 0)
                .sort(([_, a], [__, b]) => b.ingreso - a.ingreso)
                .map(([categoria, totals]) => {
                  const percentage = (totals.ingreso / (summary.ingresos || 1)) * 100;
                  return (
                    <div key={categoria} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria}</span>
                        <span className="text-green-600 font-semibold">
                          ${totals.ingreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

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
                  const percentage = (totals.egreso / (summary.egresos || 1)) * 100;
                  return (
                    <div key={categoria} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria}</span>
                        <span className="text-red-600 font-semibold">
                          ${totals.egreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
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
            
            <Link href="/finance/cuentas">
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

            <Link href="/finance/categorias">
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

            <Link href="/finance/reportes">
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

