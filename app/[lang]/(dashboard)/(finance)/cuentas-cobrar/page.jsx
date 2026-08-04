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
  updateTransaccion, 
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
import { DollarSign, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";

const CuentasCobrarPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [transactionToApprove, setTransactionToApprove] = useState(null);
  
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTransacciones({ tipo: "ingreso" });
      if (response.status === "success") {
        setTransacciones(response.data);
      } else {
        toast.error(response.message || "Error al cargar datos");
      }
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveClick = (t) => {
    setTransactionToApprove(t);
    setConfirmDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!transactionToApprove) return;
    try {
      const response = await updateTransaccion(transactionToApprove.id, { estado: "completado" });
      if (response.status === "success") {
        toast.success("Cuenta marcada como cobrada (completada)");
        await fetchData();
      } else {
        toast.error(response.message || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    } finally {
      setConfirmDialogOpen(false);
      setTransactionToApprove(null);
    }
  };

  const filteredTransacciones = transacciones.filter((t) => {
    const matchesSearch = 
      t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cuenta?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransacciones.length / itemsPerPage);
  const paginatedTransacciones = filteredTransacciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalPendiente = transacciones
    .filter(t => t.estado === "pendiente")
    .reduce((sum, t) => sum + Number(t.monto), 0);
    
  const totalCobrado = transacciones
    .filter(t => t.estado === "completado")
    .reduce((sum, t) => sum + Number(t.monto), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Cargando cuentas por cobrar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-8 w-8 text-primary" />
                Cuentas por Cobrar
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Administra los ingresos pendientes y haz seguimiento de las cuentas por cobrar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente por Cobrar</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos registrados con estado pendiente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado (Histórico)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCobrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos registrados completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0 sm:p-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 px-4 sm:px-0 pt-4 sm:pt-0">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cuenta Destino</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransacciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No se encontraron cuentas por cobrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransacciones.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(t.fecha).toLocaleDateString('es-ES', { 
                            day: '2-digit', month: 'short', year: 'numeric' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-medium">{t.categoria}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {t.cuenta || 'Sin asignar'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={t.descripcion}>
                          {t.descripcion}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap text-green-600">
                         + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PEN' }).format(t.monto)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="soft" color={t.estado === "completado" ? "success" : t.estado === "pendiente" ? "warning" : "secondary"} className="capitalize whitespace-nowrap">
                          {t.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.estado === "pendiente" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleApproveClick(t)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar Pagado
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground mr-2">Pagado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTransacciones.length)} de {filteredTransacciones.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium w-16 text-center">
                  {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              ¿Confirmar Pago?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de marcar esta cuenta por cobrar como "Completada/Pagada". 
              El monto se reflejará permanentemente en tu balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToApprove(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default CuentasCobrarPage;
