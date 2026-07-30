"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProject } from "@/config/projects.config";
import { getUsuarios } from "@/config/usuarios.config";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function AssignMechanicModal({ open, onClose, project, onAssignSuccess }) {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(project?.mechanic?.id || null);
  const [commission, setCommission] = useState(project?.mechanicCommission || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const loadMechanics = async () => {
        setLoading(true);
        try {
          const res = await getUsuarios();
          if (res.status === "success") {
            // Filtrar solo los que tienen rol de mecanico, o mostrarlos todos si quieres que cualquiera pueda ser asignado
            const mechs = res.data.filter(u => u.role?.toLowerCase() === 'mecanico' || u.role?.toLowerCase() === 'mechanic' || u.department?.toLowerCase() === 'taller');
            // Fallback: Si no hay mecanicos especificos, mostrar todos
            setMechanics(mechs.length > 0 ? mechs : res.data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadMechanics();
    }
  }, [open]);

  const handleSave = async () => {
    if (!selectedMechanic || !project) return;
    
    setIsSaving(true);
    try {
      const mechanicData = mechanics.find(m => m.id === selectedMechanic);
      
      const payload = {
        mechanic: mechanicData,
        mechanicCommission: commission ? parseFloat(commission) : 0
      };

      // Si el proyecto tenía un estado y estamos pasando a "En Reparación" o similar y queremos forzarlo:
      // if (project.status) payload.status = project.status; 
      // Pero esto ya lo manejamos en el onDragEnd del tablero.

      const response = await updateProject(project.id, payload);
      
      if (response.status === "success") {
        toast.success("Mecánico asignado con éxito");
        onAssignSuccess(mechanicData); // Update parent state
        onClose();
      } else {
        throw new Error(response.message || "Error");
      }
    } catch (error) {
      toast.error("Error al asignar el mecánico");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Técnico</DialogTitle>
          <DialogDescription>
            Selecciona quién se encargará del {project?.carName || "vehículo"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 py-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : mechanics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No se encontraron mecánicos registrados.</p>
          ) : (
            mechanics.map((mech) => (
              <div 
                key={mech.id}
                onClick={() => setSelectedMechanic(mech.id)}
                className={`flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedMechanic === mech.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
              >
                <Avatar>
                  <AvatarImage src={mech.image?.src || mech.image} />
                  <AvatarFallback>{mech.name?.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{mech.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mech.role || mech.department || "Técnico"}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                  {selectedMechanic === mech.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMechanic && (
          <div className="px-1 py-2 space-y-2">
            <label className="text-sm font-medium">Comisión Acordada (Monto Fijo $)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="pl-7"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Este monto se registrará en las cuentas por pagar al cerrar el proyecto.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedMechanic}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Asignar y Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
