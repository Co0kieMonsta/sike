"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { TransactionFormDialog } from "./components/transaction-form-dialog";
import { DataTableRowActions } from "./components/data-table-row-actions";
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
import { DollarSign, TrendingUp, TrendingDown, Wallet, Trash2, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const TransactionsPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionsToDelete, setTransactionsToDelete] = useState([]);
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

  const handleBulkDelete = (selectedRows) => {
    setTransactionsToDelete(selectedRows.map(row => row.original));
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = transactionsToDelete.map(t => deleteTransaccion(t.id));
      await Promise.all(deletePromises);
      
      toast.success(`${transactionsToDelete.length} transacción(es) eliminada(s)`);
      await fetchData();
    } catch (error) {
      toast.error("Error al eliminar transacciones");
    } finally {
      setBulkDeleteDialogOpen(false);
      setTransactionsToDelete([]);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(transacciones, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transacciones_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Transacciones exportadas exitosamente");
    } catch (error) {
      toast.error("Error al exportar transacciones");
    }
  };

  const handleChangeStatus = async (transaction, newStatus) => {
    try {
      const response = await updateTransaccion(transaction.id, { ...transaction, estado: newStatus });
      if (response.status === "success") {
        toast.success("Estado actualizado exitosamente");
        await fetchData();
      } else {
        toast.error(response.message || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const enhancedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => (
          <DataTableRowActions
            row={row}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onChangeStatus={handleChangeStatus}
          />
        ),
      };
    }
    return col;
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
                onClick={() => handleAddTransaction()}
                size="lg"
                className="gap-2"
          >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Nueva Transacción</span>
                <span className="sm:hidden">Nuevo</span>
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={enhancedColumns}
            data={transacciones}
            onRefresh={fetchData}
            onAddTransaction={handleAddTransaction}
            onDeleteSelected={handleBulkDelete}
            onExport={handleExport}
            summary={summary}
          />
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Eliminar múltiples transacciones?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
              <span className="font-semibold">{transactionsToDelete.length} transacción(es)</span> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionsToDelete([])}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar {transactionsToDelete.length} transacción(es)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
