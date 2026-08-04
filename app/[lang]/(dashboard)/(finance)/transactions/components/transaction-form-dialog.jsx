"use client";

import { useEffect, useState } from "react";
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
  CheckCircle,
  Upload,
  Image as ImageIcon,
  History
} from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryTimeline from "@/components/history-timeline";

const transactionSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  tipo: z.enum(["ingreso", "egreso"], {
    required_error: "Por favor selecciona un tipo",
  }),
  categoria: z.string().min(2, "La categoría es requerida"),
  subcategoria: z.string().optional(),
  monto: z.string().min(1, "El monto es requerido"),
  metodoPago: z.enum(["efectivo", "transferencia", "yape", "tarjeta"], {
    required_error: "Por favor selecciona un método de pago",
  }),
  cuenta: z.string().min(2, "La cuenta es requerida"),
  descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  estado: z.enum(["completado", "pendiente", "cancelado"], {
    required_error: "Por favor selecciona un estado",
  }),
  proyecto_id: z.string().optional(),
});

export function TransactionFormDialog({ open, onClose, onSubmit, transaction, isLoading, cuentas, categorias, proyectos }) {
  const isEditMode = !!transaction;
  const [uploading, setUploading] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState("");

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
      estado: "completado",
      proyecto_id: "",
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
        estado: transaction.estado || "completado",
        proyecto_id: transaction.proyecto_id || "",
      });
      setComprobanteUrl(transaction.comprobante || "");
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
        estado: "completado",
        proyecto_id: "",
      });
      setComprobanteUrl("");
    }
  }, [transaction, form]);

  const handleSubmit = (data) => {
    const formattedData = {
      ...data,
      monto: parseFloat(data.monto),
      proyecto_id: data.proyecto_id === "ninguno" ? null : data.proyecto_id,
      comprobante: comprobanteUrl || null,
    };
    onSubmit(formattedData);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `comprobantes/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setComprobanteUrl(downloadURL);
      toast.success("Comprobante subido exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

  const tipo = form.watch("tipo");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
        <Tabs defaultValue="details" className="w-full">
          {isEditMode && (
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="details">
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
                          <Input type="date" removeWrapper={true} className="w-full min-w-0 flex items-center appearance-none" {...field} />
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
                            <SelectItem value="yape">YAPE</SelectItem>
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
                  name="proyecto_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Proyecto Vinculado (Opcional)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un proyecto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ninguno">-- Ninguno --</SelectItem>
                          {proyectos?.map((proyecto) => (
                            <SelectItem key={proyecto.id} value={proyecto.id}>
                              {proyecto.title}
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
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem className="mt-4">
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

                <div className="space-y-2 mt-4">
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Comprobante (Opcional)
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileChange} 
                      disabled={uploading}
                      className="w-full"
                    />
                    {uploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  {comprobanteUrl && (
                    <div className="mt-2 flex flex-col gap-2">
                      <a href={comprobanteUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                        Ver comprobante actual
                      </a>
                      {comprobanteUrl.includes(".pdf") ? (
                         <div className="bg-muted p-4 rounded-md flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <span className="ml-2 text-sm">Documento PDF Adjunto</span>
                         </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={comprobanteUrl} alt="Comprobante" className="max-h-40 rounded-md border object-contain" />
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-border">
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
                </div>
              </form>
            </Form>
          </TabsContent>
          
          {isEditMode && (
            <TabsContent value="history">
              <HistoryTimeline entityId={transaction.id} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

