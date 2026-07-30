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

const ProjectFinanceTab = ({ projectId }) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transacciones del Proyecto</h3>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/en/transactions">
              <ExternalLink className="h-4 w-4 mr-2" /> Finanzas
            </Link>
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Gasto/Ingreso
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
    </div>
  );
};

export default ProjectFinanceTab;
