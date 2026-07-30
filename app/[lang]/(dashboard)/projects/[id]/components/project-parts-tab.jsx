"use client";

import { useEffect, useState } from "react";
import { getProjectParts, addProjectPart, deleteProjectPart } from "@/config/projects.config";
import { getProducts } from "@/config/inventory.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Wrench } from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProjectPartsTab = ({ projectId }) => {
  const [parts, setParts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPart, setNewPart] = useState({ productId: "", quantity: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partsRes, invRes] = await Promise.all([
        getProjectParts(projectId),
        getProducts()
      ]);
      if (partsRes.status === "success") setParts(partsRes.data);
      if (invRes.status === "success") setInventory(invRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleAddPart = async () => {
    if (!newPart.productId || newPart.quantity < 1) {
      return toast.error("Selecciona un producto y cantidad válida");
    }
    
    const product = inventory.find(p => p.id === newPart.productId);
    if (!product) return;
    
    if (product.stock < newPart.quantity) {
      return toast.error(`Stock insuficiente. Solo hay ${product.stock} disponibles.`);
    }

    try {
      const res = await addProjectPart({
        projectId,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: parseInt(newPart.quantity)
      });
      if (res.status === "success") {
        toast.success("Repuesto asignado");
        setIsAddModalOpen(false);
        setNewPart({ productId: "", quantity: 1 });
        fetchData();
      }
    } catch (e) {
      toast.error("Error al asignar repuesto");
    }
  };

  const handleDeletePart = async (part) => {
    try {
      await deleteProjectPart(part.id, part);
      toast.success("Repuesto retirado y devuelto a inventario");
      fetchData();
    } catch (e) {
      toast.error("Error al retirar repuesto");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Inventario Utilizado</h3>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Repuesto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando repuestos...</p>
          ) : parts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se han utilizado repuestos en este proyecto.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Costo Unit.</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map(part => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        {part.name}
                      </div>
                    </TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>${Number(part.price || 0).toFixed(2)}</TableCell>
                    <TableCell>${(Number(part.price || 0) * part.quantity).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePart(part)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Repuesto al Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Producto</label>
              <Select value={newPart.productId} onValueChange={v => setNewPart({...newPart, productId: v})}>
                <SelectTrigger><SelectValue placeholder="Elige un producto en stock" /></SelectTrigger>
                <SelectContent>
                  {inventory.filter(p => p.stock > 0).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock}) - ${p.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad a usar</label>
              <Input 
                type="number" 
                min="1" 
                value={newPart.quantity} 
                onChange={e => setNewPart({...newPart, quantity: parseInt(e.target.value) || 1})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddPart}>Asignar y Descontar Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPartsTab;
