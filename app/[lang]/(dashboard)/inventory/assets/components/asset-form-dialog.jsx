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
import { Loader2, Box, Image as ImageIcon, History } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryTimeline from "@/components/history-timeline";

const assetSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  serial_number: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category_id: z.string().optional(),
  purchase_price: z.string().optional(),
  purchase_date: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["operativo", "en_mantenimiento", "dado_de_baja"]),
  description: z.string().optional(),
  assigned_to: z.string().optional(),
});

export function AssetFormDialog({ open, onClose, onSubmit, asset, isLoading, categories }) {
  const isEditMode = !!asset;
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      serial_number: "",
      brand: "",
      model: "",
      category_id: "",
      purchase_price: "",
      purchase_date: "",
      location: "",
      status: "operativo",
      description: "",
      assigned_to: "",
    },
  });

  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name || "",
        serial_number: asset.serial_number || "",
        brand: asset.brand || "",
        model: asset.model || "",
        category_id: asset.category_id || "",
        purchase_price: String(asset.purchase_price || ""),
        purchase_date: asset.purchase_date || "",
        location: asset.location || "",
        status: asset.status || "operativo",
        description: asset.description || "",
        assigned_to: asset.assigned_to || "",
      });
      setImageUrl(asset.imageUrl || "");
    } else {
      form.reset({
        name: "",
        serial_number: "",
        brand: "",
        model: "",
        category_id: "",
        purchase_price: "",
        purchase_date: "",
        location: "",
        status: "operativo",
        description: "",
        assigned_to: "",
      });
      setImageUrl("");
    }
  }, [asset, form]);

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      imageUrl: imageUrl || null
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `assets/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setImageUrl(downloadURL);
      toast.success("Imagen subida");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            {isEditMode ? "Editar Activo" : "Registrar Activo"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza la información del equipo o herramienta."
              : "Ingresa los datos del nuevo equipo o herramienta."}
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Activo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Escáner Automotriz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Serie</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. SN-123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Snap-on" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Solus Edge" {...field} />
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
                        <FormLabel>Categoría</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
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
                            <SelectItem value="operativo">Operativo</SelectItem>
                            <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                            <SelectItem value="dado_de_baja">Dado de baja</SelectItem>
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
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo de Adquisición</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchase_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Compra</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Bahía 1, Bodega..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asignado a (Responsable)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del responsable" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas / Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalles adicionales..."
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Fotografía (Opcional)
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  {imageUrl && (
                    <div className="mt-2">
                      <img src={imageUrl} alt="Asset" className="h-20 w-20 object-cover rounded-md border" />
                    </div>
                  )}
                </div>

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
                    {isLoading && <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Guardar Cambios" : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          {isEditMode && (
            <TabsContent value="history">
              <HistoryTimeline entityId={asset.id} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
