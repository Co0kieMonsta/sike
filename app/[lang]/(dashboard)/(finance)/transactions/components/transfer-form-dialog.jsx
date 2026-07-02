"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Loader2 } from "lucide-react";

const transferSchema = z.object({
  origen_id: z.string().min(1, "Seleccione cuenta de origen"),
  destino_id: z.string().min(1, "Seleccione cuenta de destino"),
  monto: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es requerida"),
  descripcion: z.string().min(1, "La descripción es requerida"),
}).refine(data => data.origen_id !== data.destino_id, {
  message: "La cuenta origen y destino deben ser distintas",
  path: ["destino_id"]
});

export function TransferFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  isLoading, 
  cuentas 
}) {
  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      origen_id: "",
      destino_id: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      descripcion: "Transferencia entre cuentas",
    },
  });

  const handleSubmit = (data) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Nueva Transferencia
          </DialogTitle>
          <DialogDescription>
            Mueve fondos de una cuenta a otra. Se registrará un egreso y un ingreso.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origen_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-600">Cuenta Origen (Egreso)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuentas.map((cuenta) => (
                          <SelectItem key={cuenta.id} value={cuenta.id}>
                            {cuenta.nombre} (${cuenta.saldo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destino_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-600">Cuenta Destino (Ingreso)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuentas.map((cuenta) => (
                          <SelectItem key={cuenta.id} value={cuenta.id}>
                            {cuenta.nombre} (${cuenta.saldo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto a Transferir</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Traspaso mensual para caja chica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Transferir Fondos
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
