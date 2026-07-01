"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCotizacion, updateCotizacion } from "@/config/cotizaciones.config";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { ProductSelector } from "./product-selector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getInventoryProducts } from "@/action/inventory";

const cotizacionSchema = z.object({
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_email: z.string().email("Email inválido").optional().or(z.literal("")),
  cliente_direccion: z.string().optional(),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  fecha_vencimiento: z.date().optional(),
  estado: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(z.object({
    producto_id: z.string().optional(),
    descripcion: z.string().min(1, "Descripción requerida"),
    cantidad: z.coerce.number().min(1, "Mínimo 1"),
    precio_unitario: z.coerce.number().min(0, "Mínimo 0"),
  })).min(1, "Debe agregar al menos un ítem"),
});

export function CotizacionForm({ initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const data = await getInventoryProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };
    fetchProducts();
  }, []);

  const form = useForm({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: initialData ? {
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : new Date(),
        fecha_vencimiento: initialData.fecha_vencimiento ? new Date(initialData.fecha_vencimiento) : undefined,
        items: initialData.detalles_cotizacion || [{ descripcion: "", cantidad: 1, precio_unitario: 0 }]
    } : {
      fecha: new Date(),
      items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
      estado: "pendiente"
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  
  const calculateTotal = () => {
      return watchItems.reduce((acc, item) => {
          const qty = parseFloat(item.cantidad) || 0;
          const price = parseFloat(item.precio_unitario) || 0;
          return acc + (qty * price);
      }, 0);
  };

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
        form.setValue(`items.${index}.producto_id`, productId);
        form.setValue(`items.${index}.descripcion`, product.name || product.descripcion || "");
        form.setValue(`items.${index}.precio_unitario`, product.price || 0);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      if (initialData) {
        response = await updateCotizacion(initialData.id, data);
      } else {
        response = await createCotizacion(data);
      }

      if (response.status === "success") {
        toast.success(initialData ? "Cotización actualizada" : "Cotización creada");
        router.push("/cotizaciones");
        router.refresh();
      } else {
        toast.error(response.message || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? `Editar Cotización #${initialData.numero}` : "Nueva Cotización"}
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente_nombre">Nombre del Cliente *</Label>
              <Input
                id="cliente_nombre"
                {...form.register("cliente_nombre")}
                placeholder="Empresa S.A. de C.V."
              />
              {form.formState.errors.cliente_nombre && (
                <p className="text-sm text-destructive">{form.formState.errors.cliente_nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_email">Email</Label>
              <Input
                id="cliente_email"
                {...form.register("cliente_email")}
                placeholder="contacto@empresa.com"
              />
              {form.formState.errors.cliente_email && (
                <p className="text-sm text-destructive">{form.formState.errors.cliente_email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cliente_direccion">Dirección</Label>
              <Textarea
                id="cliente_direccion"
                {...form.register("cliente_direccion")}
                placeholder="Calle Principal #123, Ciudad"
              />
            </div>

            <div className="space-y-2">
                <Label>Fecha de Emisión</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.watch("fecha") && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("fecha") ? format(form.watch("fecha"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={form.watch("fecha")}
                            onSelect={(date) => form.setValue("fecha", date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {form.formState.errors.fecha && (
                    <p className="text-sm text-destructive">{form.formState.errors.fecha.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.watch("fecha_vencimiento") && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("fecha_vencimiento") ? format(form.watch("fecha_vencimiento"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={form.watch("fecha_vencimiento")}
                            onSelect={(date) => form.setValue("fecha_vencimiento", date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {initialData && (
                <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                        onValueChange={(value) => form.setValue("estado", value)} 
                        defaultValue={form.watch("estado")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aceptada">Aceptada</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Detalles</CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ descripcion: "", cantidad: 1, precio_unitario: 0 })}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Ítem
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[200px]">Producto</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Descripción</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">Cant.</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">Precio Unit.</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">Total</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {fields.map((field, index) => {
                                const cantidad = parseFloat(form.watch(`items.${index}.cantidad`)) || 0;
                                const precio = parseFloat(form.watch(`items.${index}.precio_unitario`)) || 0;
                                const total = cantidad * precio;

                                return (
                                    <tr key={field.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <ProductSelector 
                                                products={products}
                                                value={form.watch(`items.${index}.producto_id`)}
                                                onSelect={(productOrText) => {
                                                    if (typeof productOrText === 'string') {
                                                        // Custom text
                                                        form.setValue(`items.${index}.producto_id`, ""); // Clear ID
                                                        form.setValue(`items.${index}.descripcion`, productOrText);
                                                    } else {
                                                        // Product object
                                                        form.setValue(`items.${index}.producto_id`, productOrText.id);
                                                        form.setValue(`items.${index}.descripcion`, productOrText.name || productOrText.descripcion || "");
                                                        form.setValue(`items.${index}.precio_unitario`, productOrText.price || 0);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Input 
                                                {...form.register(`items.${index}.descripcion`)} 
                                                placeholder="Descripción del servicio o producto"
                                            />
                                            {form.formState.errors.items?.[index]?.descripcion && (
                                                <p className="text-xs text-destructive mt-1">{form.formState.errors.items[index].descripcion.message}</p>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Input 
                                                type="number" 
                                                {...form.register(`items.${index}.cantidad`)} 
                                                min="1"
                                            />
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Input 
                                                type="number" 
                                                {...form.register(`items.${index}.precio_unitario`)} 
                                                prefix="$"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="p-4 align-middle font-medium">
                                            ${total.toFixed(2)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-muted/50 font-medium">
                            <tr>
                                <td colSpan={4} className="p-4 align-middle text-right">Total:</td>
                                <td className="p-4 align-middle text-lg">${calculateTotal().toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {form.formState.errors.items && (
                     <p className="text-sm text-destructive p-4">{form.formState.errors.items.message}</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea 
                    {...form.register("notas")} 
                    placeholder="Términos y condiciones, notas para el cliente..." 
                    className="min-h-[100px]"
                />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
                {loading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
                <Save className="mr-2 h-4 w-4" />
                Guardar Cotización
            </Button>
        </div>
      </form>
    </div>
  );
}
