"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Package, History } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryTimeline from "@/components/history-timeline";
import imglyRemoveBackground from "@imgly/background-removal";
import { createProduct, updateProduct, getCategories } from "@/config/inventory.config";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  category_id: z.string().min(1, "La categoría es requerida"),
  price: z.coerce.number().min(0, "El precio debe ser 0 o mayor"),
  cost: z.coerce.number().min(0, "El costo debe ser 0 o mayor"),
  stock: z.coerce.number().min(0, "El stock debe ser 0 o mayor"),
  location: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export function ProductFormDialog({ open, onClose, onSubmit: externalOnSubmit, product, isLoading, categories: parentCategories }) {
  const isEditMode = !!product;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(parentCategories || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (!parentCategories) {
      const fetchCats = async () => {
        try {
          const response = await getCategories();
          if (response.status === "success") {
            setCategories(response.data.filter(c => c.type !== 'asset'));
          }
        } catch (error) {
          console.error("Error fetching categories", error);
        }
      };
      fetchCats();
    }
  }, [parentCategories]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      brand: "",
      category_id: "",
      price: 0,
      cost: 0,
      stock: 0,
      location: "",
      status: "active",
      description: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        sku: product.sku || "",
        brand: product.brand || "",
        category_id: product.category_id || "",
        price: product.price || 0,
        cost: product.cost || 0,
        stock: product.stock || 0,
        location: product.location || "",
        status: product.status || "active",
        description: product.description || "",
      });
      setImagePreview(product.imageUrl || null);
    } else {
      form.reset({
        name: "",
        sku: "",
        brand: "",
        category_id: "",
        price: 0,
        cost: 0,
        stock: 0,
        location: "",
        status: "active",
        description: "",
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, form]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessingImage(true);
      const tempUrl = URL.createObjectURL(file);
      setImagePreview(tempUrl);
      
      try {
        const blob = await imglyRemoveBackground(file);
        const newUrl = URL.createObjectURL(blob);
        setImagePreview(newUrl);
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), { type: "image/png" });
        setImageFile(newFile);
      } catch (error) {
        console.error("Error removing background:", error);
        toast.error("Error al quitar el fondo. Se usará la original.");
        setImageFile(file);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      let finalImageUrl = product?.imageUrl || null;

      if (imageFile) {
        const fileRef = ref(storage, `inventory_images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const payload = { ...data, imageUrl: finalImageUrl };

      if (externalOnSubmit) {
         await externalOnSubmit(payload);
         return;
      }

      let response;
      if (product) {
        response = await updateProduct(product.id, payload);
      } else {
        response = await createProduct(payload);
      }

      if (response.status === "success") {
        toast.success(product ? "Producto actualizado" : "Producto registrado");
        onClose();
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

  const isSubmitting = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditMode ? "Editar Producto" : "Registrar Producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza la información del producto o repuesto."
              : "Ingresa los datos del nuevo producto o repuesto."}
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
                
                <div className="space-y-2 flex flex-col items-center p-4 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/20">
                  <FormLabel htmlFor="image" className={`cursor-pointer flex flex-col items-center gap-2 ${isProcessingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    {imagePreview ? (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border bg-background">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                        {isProcessingImage && (
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-lg border flex items-center justify-center bg-background text-muted-foreground relative">
                        {isProcessingImage ? (
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        ) : "Sin imagen"}
                      </div>
                    )}
                    <span className="text-sm text-primary font-medium mt-2">
                      {isProcessingImage ? "Procesando imagen (Quitando fondo)..." : "Haz clic para subir una foto"}
                    </span>
                  </FormLabel>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nombre / Descripción Corta *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Pistones Forjados" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number / SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. K&N-HP-1008" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. K&N, HKS, GReddy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de Venta ($) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo de Compra ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad en Stock *</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación en Taller</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Estante A2, Almacén" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detalles / Compatibilidad</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Compatible con motores 2JZ-GTE, RB26..." 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="flex items-center justify-between mt-6">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isProcessingImage}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isProcessingImage}>
                    {isSubmitting || isProcessingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      isEditMode ? "Guardar Cambios" : "Registrar Producto"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          {isEditMode && (
            <TabsContent value="history">
              <div className="pt-4">
                <HistoryTimeline entityId={product.id} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
