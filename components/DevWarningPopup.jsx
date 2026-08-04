"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function DevWarningPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if we already showed it in this session
    const hasSeenWarning = sessionStorage.getItem("dev_warning_shown");
    if (!hasSeenWarning) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("dev_warning_shown", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-xl">Aviso Importante</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Actualmente, la aplicación se encuentra en fase de desarrollo activo.
            <br /><br />
            Por el momento, <strong>SOLO el módulo de Finanzas</strong> (Dashboard, Transacciones, Cuentas, Categorías y Reportes) está <strong>completamente funcional</strong>. 
            <br /><br />
            Los demás módulos (Proyectos, Taller, CRM, Inventario, Soporte) están en construcción y podrían no guardar los datos correctamente o presentar errores.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          <Button onClick={handleClose} className="w-full sm:w-auto gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
