"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  DollarSign,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  FileText,
  Tags,
  Wallet,
  CheckCircle
} from "lucide-react";

const transactionSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  tipo: z.enum(["ingreso", "egreso"], {
    required_error: "Por favor selecciona un tipo",
  }),
  categoria: z.string().min(2, "La categoría es requerida"),
  subcategoria: z.string().optional(),
  monto: z.string().min(1, "El monto es requerido"),
  metodoPago: z.enum(["efectivo", "transferencia", "cheque", "tarjeta"], {
    required_error: "Por favor selecciona un método de pago",
  }),
  cuenta: z.string().min(2, "La cuenta es requerida"),
  descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  referencia: z.string().optional(),
  estado: z.enum(["completado", "pendiente", "cancelado"], {
    required_error: "Por favor selecciona un estado",
  }),
});

export function TransactionFormDialog({ open, onClose, onSubmit, transaction, isLoading, cuentas, categorias }) {
  const isEditMode = !!transaction;

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      tipo: "ingreso",
      categoria: "",
      subcategoria: "",
      monto: "",
      metodoPago: "efectivo",
      cuenta: "",
      descripcion: "",
      referencia: "",
      estado: "completado",
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        fecha: transaction.fecha || new Date().toISOString().split('T')[0],
        tipo: transaction.tipo || "ingreso",
        categoria: transaction.categoria || "",
        subcategoria: transaction.subcategoria || "",
        monto: String(transaction.monto || ""),
        metodoPago: transaction.metodoPago || "efectivo",
        cuenta: transaction.cuenta || "",
        descripcion: transaction.descripcion || "",
        referencia: transaction.referencia || "",
        estado: transaction.estado || "completado",
      });
    } else {
      form.reset({
        fecha: new Date().toISOString().split('T')[0],
        tipo: "ingreso",
        categoria: "",
        subcategoria: "",
        monto: "",
        metodoPago: "efectivo",
        cuenta: "",
        descripcion: "",
        referencia: "",
        estado: "completado",
      });
    }
  }, [transaction, form]);

  const handleSubmit = (data) => {
    const formattedData = {
      ...data,
      monto: parseFloat(data.monto),
    };
    onSubmit(formattedData);
  };

  const tipo = form.watch("tipo");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <FileText className="h-5 w-5" />
                Editar Transacción
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                Nueva Transacción
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza los datos de la transacción"
              : "Completa el formulario para registrar una nueva transacción"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {tipo === "ingreso" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                      Tipo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ingreso">
                          <div className="flex items-center gap-2">
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                            Ingreso
                          </div>
                        </SelectItem>
                        <SelectItem value="egreso">
                          <div className="flex items-center gap-2">
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                            Egreso
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tags className="h-4 w-4" />
                      Categoría
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias?.filter(c => c.tipo === tipo).map((cat) => (
                          <SelectItem key={cat.id} value={cat.nombre}>
                            {cat.nombre}
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
                name="subcategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tags className="h-4 w-4" />
                      Subcategoría
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monto
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Método de Pago
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Cuenta
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una cuenta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuentas?.map((cuenta) => (
                          <SelectItem key={cuenta.id} value={cuenta.nombre}>
                            {cuenta.nombre}
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
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Estado
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completado">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Completado
                          </div>
                        </SelectItem>
                        <SelectItem value="pendiente">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-yellow-600" />
                            Pendiente
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelado">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                            Cancelado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Referencia
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Número de factura, orden, etc. (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe la transacción..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                ) : isEditMode ? (
                  <FileText className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                ) : (
                  <DollarSign className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                )}
                {isEditMode ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

