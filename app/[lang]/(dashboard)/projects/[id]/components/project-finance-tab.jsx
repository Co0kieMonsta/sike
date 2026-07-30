"use client";

import { useEffect, useState } from "react";
import { getTransacciones, createTransaccion } from "@/config/finanzas.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { ReceiptPrint } from "@/components/shop/receipt-print";
import React, { useRef } from "react";

const ProjectFinanceTab = ({ project }) => {
  const projectId = project?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newTrans, setNewTrans] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: "egreso",
    monto: "",
    descripcion: "",
    metodoPago: "efectivo",
    estado: "completado"
  });

  const receiptRef = useRef();
  const [selectedTx, setSelectedTx] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Recibo_${project?.carName || 'Auto'}`,
  });

  const openPrintReceipt = (tx) => {
    setSelectedTx(tx);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransacciones({ proyecto_id: projectId });
      if (response.status === "success") {
        setTransactions(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar finanzas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [projectId]);

  const handleAddTrans = async () => {
    if (!newTrans.monto || !newTrans.descripcion) {
      return toast.error("El monto y descripción son obligatorios");
    }
    
    try {
      const res = await createTransaccion({
        ...newTrans,
        monto: parseFloat(newTrans.monto),
        proyecto_id: projectId
      });
      if (res.status === "success") {
        toast.success("Transacción registrada");
        setIsAddModalOpen(false);
        setNewTrans({ ...newTrans, monto: "", descripcion: "" });
        fetchTransactions();
      }
    } catch (e) {
      toast.error("Error al guardar transacción");
    }
  };

  const totalPaid = transactions
    .filter(t => t.tipo === "ingreso" && t.estado === "completado")
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const totalExpenses = transactions
    .filter(t => t.tipo === "egreso" && t.estado === "completado")
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const budget = Number(project?.budget || 0);
  const remaining = budget - totalPaid;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground font-medium">Presupuesto Total</p>
            <p className="text-2xl font-bold text-primary">${budget.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground font-medium">Total Cobrado (Abonos)</p>
            <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className={remaining > 0 ? "bg-orange-500/5 border-orange-500/20" : "bg-muted/30 border-muted"}>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground font-medium">Saldo Pendiente</p>
            <p className={`text-2xl font-bold ${remaining > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
              ${remaining > 0 ? remaining.toFixed(2) : "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground font-medium">Gastos del Proyecto</p>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-6">
        <h3 className="text-lg font-medium">Historial de Transacciones</h3>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/en/transactions">
              <ExternalLink className="h-4 w-4 mr-2" /> Ir a Finanzas
            </Link>
          </Button>
          <Button onClick={() => {
            setNewTrans({ ...newTrans, tipo: "ingreso", descripcion: "Abono al proyecto" });
            setIsAddModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Registrar Abono / Gasto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando transacciones...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay transacciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Recibo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(t.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={t.tipo === "ingreso" ? "text-green-600" : "text-red-600"}>
                          {t.tipo === "ingreso" ? <ArrowUpCircle className="h-3 w-3 mr-1" /> : <ArrowDownCircle className="h-3 w-3 mr-1" />}
                          {t.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{t.descripcion}</TableCell>
                      <TableCell className={`text-right font-semibold ${t.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                        {t.tipo === "ingreso" ? "+" : "-"}${Number(t.monto).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="soft" color={t.estado === "completado" ? "success" : "warning"}>
                          {t.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.tipo === "ingreso" && t.estado === "completado" && (
                          <Button variant="ghost" size="sm" onClick={() => openPrintReceipt(t)} className="h-8 px-2 text-primary">
                            <Printer className="h-4 w-4 mr-1" /> Imprimir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Transacción</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={newTrans.tipo} onValueChange={v => setNewTrans({...newTrans, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="egreso">Gasto (Egreso)</SelectItem>
                    <SelectItem value="ingreso">Ingreso (Abono)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto ($)</label>
                <Input type="number" step="0.01" value={newTrans.monto} onChange={e => setNewTrans({...newTrans, monto: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input placeholder="Ej. Pago de anticipo" value={newTrans.descripcion} onChange={e => setNewTrans({...newTrans, descripcion: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Método</label>
                 <Select value={newTrans.metodoPago} onValueChange={v => setNewTrans({...newTrans, metodoPago: v})}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="efectivo">Efectivo</SelectItem>
                     <SelectItem value="transferencia">Transferencia</SelectItem>
                     <SelectItem value="tarjeta">Tarjeta</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Estado</label>
                 <Select value={newTrans.estado} onValueChange={v => setNewTrans({...newTrans, estado: v})}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="completado">Completado</SelectItem>
                     <SelectItem value="pendiente">Pendiente</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTrans}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        <ReceiptPrint ref={receiptRef} project={project} transaction={selectedTx} />
      </div>
    </div>
  );
};

export default ProjectFinanceTab;
