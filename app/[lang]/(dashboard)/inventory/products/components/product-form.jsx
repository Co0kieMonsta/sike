"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, getCategories } from "@/config/inventory.config";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

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

export function ProductForm({ initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await getCategories();
        if (response.status === "success") {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCats();
  }, []);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
        ...initialData,
    } : {
      status: "active",
      price: 0,
      cost: 0,
      stock: 0,
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let finalImageUrl = initialData?.imageUrl || null;

      if (imageFile) {
        const fileRef = ref(storage, `inventory_images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const payload = { ...data, imageUrl: finalImageUrl };

      let response;
      if (initialData) {
        response = await updateProduct(initialData.id, payload);
      } else {
        response = await createProduct(payload);
      }

      if (response.status === "success") {
        toast.success(initialData ? "Refacción actualizada" : "Refacción registrada");
        router.push("/inventory/products");
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
            {initialData ? `Editar Refacción: ${initialData.name}` : "Registrar Refacción"}
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Detalles principales de la refacción o producto.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre / Descripción Corta *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Ej. Filtro de Aceite de Alto Flujo"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2 flex flex-col items-center p-4 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/20">
              <Label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                {imagePreview ? (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border bg-background">
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-lg border flex items-center justify-center bg-background text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                <span className="text-sm text-primary font-medium mt-2">Haz clic para subir una foto</span>
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Part Number / SKU</Label>
              <Input
                id="sku"
                {...form.register("sku")}
                placeholder="Ej. K&N-HP-1008"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                {...form.register("brand")}
                placeholder="Ej. K&N, HKS, GReddy"
              />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category_id">Categoría *</Label>
                <Select 
                    onValueChange={(value) => form.setValue("category_id", value)} 
                    defaultValue={form.watch("category_id") || initialData?.category_id}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.category_id.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                    onValueChange={(value) => form.setValue("status", value)} 
                    defaultValue={form.watch("status")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario y Precios</CardTitle>
            <CardDescription>Gestión de existencias y costos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo de Compra ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...form.register("cost")}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Cantidad en Stock *</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                {...form.register("stock")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación en Taller</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="Ej. Estante A2, Bodega"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Detalles / Compatibilidad</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Compatible con motores 2JZ-GTE, RB26..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
                {loading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
                <Save className="mr-2 h-4 w-4" />
                Guardar Refacción
            </Button>
        </div>
      </form>
    </div>
  );
}
