"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  getTransacciones, 
  createTransaccion, 
  updateTransaccion, 
  deleteTransaccion,
  getCuentas,
  getCategorias
} from "@/config/finanzas.config";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Trash2, Plus, ArrowUpCircle, ArrowDownCircle, Search, Pencil, ArrowRightLeft, Calendar as CalendarIcon } from "lucide-react";
import { TransactionFormDialog } from "./components/transaction-form-dialog";
import { TransferFormDialog } from "./components/transfer-form-dialog";

const TransactionsPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleAddTransaction = (tipo = null) => {
    setSelectedTransaction(tipo ? { tipo } : null);
    setFormDialogOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setFormDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await deleteTransaccion(transactionToDelete.id);
      if (response.status === "success") {
        toast.success("Transacción eliminada exitosamente");
        await fetchData();
      } else {
        toast.error(response.message || "Error al eliminar transacción");
      }
    } catch (error) {
      toast.error("Error al eliminar transacción");
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      let response;
      if (selectedTransaction) {
        response = await updateTransaccion(selectedTransaction.id, data);
      } else {
        response = await createTransaccion(data);
      }

      if (response.status === "success") {
        toast.success(
          selectedTransaction
            ? "Transacción actualizada exitosamente"
            : "Transacción creada exitosamente"
        );
        setFormDialogOpen(false);
        await fetchData();
      } else {
        toast.error(response.message || "Error al guardar transacción");
      }
    } catch (error) {
      toast.error("Error al guardar transacción");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTransferSubmit = async (data) => {
    setFormLoading(true);
    try {
      const origen = cuentas.find(c => c.id === data.origen_id);
      const destino = cuentas.find(c => c.id === data.destino_id);
      
      const egresoData = {
        tipo: "egreso",
        monto: data.monto,
        fecha: data.fecha,
        descripcion: `[Transferencia a ${destino?.nombre || 'Destino'}] ${data.descripcion}`,
        categoria_id: "TRANSFERENCIA",
        cuenta_id: data.origen_id,
        estado: "completado"
      };

      const ingresoData = {
        tipo: "ingreso",
        monto: data.monto,
        fecha: data.fecha,
        descripcion: `[Transferencia desde ${origen?.nombre || 'Origen'}] ${data.descripcion}`,
        categoria_id: "TRANSFERENCIA",
        cuenta_id: data.destino_id,
        estado: "completado"
      };

      // In a real app this should be a backend transaction
      await Promise.all([
        createTransaccion(egresoData),
        createTransaccion(ingresoData)
      ]);

      toast.success("Transferencia realizada exitosamente");
      setTransferDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error("Error al realizar transferencia");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredTransacciones = transacciones.filter((t) => {
    const matchesSearch = 
      t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cuenta?.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const tDate = new Date(t.fecha).getTime();
      const fromDate = new Date(dateRange.from).getTime();
      // Add 24h to 'to' date to include the whole day
      const toDate = new Date(dateRange.to).getTime() + 86400000;
      matchesDate = tDate >= fromDate && tDate <= toDate;
    }

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transacciones.length}</div>
            <p className="text-xs text-muted-foreground">
              Transacciones registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ingresos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de egresos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance neto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gestión de Transacciones
              </CardTitle>
              <CardDescription>
                Administra todas las transacciones financieras. Registra ingresos y egresos.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setTransferDialogOpen(true)}
                size="lg"
                className="gap-2 text-blue-600 hover:text-blue-700 px-3 sm:px-8"
              >
                <ArrowRightLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Transferir</span>
              </Button>
              <Button
                onClick={() => handleAddTransaction()}
                size="lg"
                className="gap-2 px-3 sm:px-8"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Nueva Transacción</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 px-4 sm:px-0 pt-4 sm:pt-0">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-0">Desde:</span>
                <Input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  removeWrapper={true}
                  className="w-full min-w-0 flex items-center appearance-none text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-0">Hasta:</span>
                <Input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  removeWrapper={true}
                  className="w-full min-w-0 flex items-center appearance-none text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
              {(dateRange.from || dateRange.to) && (
                <Button 
                  variant="ghost" 
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="col-span-2 sm:col-span-1 px-2 text-muted-foreground hover:text-destructive h-9 sm:h-10 mt-1 sm:mt-0"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransacciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No se encontraron transacciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransacciones.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(t.fecha).toLocaleDateString('es-ES', { 
                            day: '2-digit', month: 'short', year: 'numeric' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {t.tipo === "ingreso" ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant="outline" color={t.tipo === "ingreso" ? "success" : "destructive"}>
                            {t.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-medium">{t.categoria}</span>
                          {t.subcategoria && (
                            <span className="text-xs text-muted-foreground">{t.subcategoria}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {t.cuenta}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={t.descripcion}>
                          {t.descripcion}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        <span className={t.tipo === "ingreso" ? "text-green-600" : "text-red-600"}>
                          {t.tipo === "ingreso" ? "+" : "-"} {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PEN' }).format(t.monto)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="soft" color={t.estado === "completado" ? "success" : t.estado === "pendiente" ? "warning" : "secondary"} className="capitalize whitespace-nowrap">
                          {t.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTransaction(t)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        transaction={selectedTransaction}
        isLoading={formLoading}
        cuentas={cuentas}
        categorias={categorias}
      />

      {/* Transfer Form Dialog */}
      <TransferFormDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onSubmit={handleTransferSubmit}
        isLoading={formLoading}
        cuentas={cuentas}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción{" "}
              <span className="font-semibold">{transactionToDelete?.id}</span> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
};

export default TransactionsPage;
