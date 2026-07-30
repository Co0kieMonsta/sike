"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCar, updateCar, getCars } from "@/config/cars.config";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const carSchema = z.object({
  make: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.string().optional(),
  vin_chassis: z.string().optional(),
  licensePlate: z.string().optional(),
  engine: z.string().optional(),
  modifications: z.string().optional(),
  status: z.string().optional(),
  ownerName: z.string().min(1, "El nombre del dueño es requerido"),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  client_id: z.string().optional(),
});

export function CarForm({ initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientsList, setClientsList] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients");
        const response = await res.json();
        if (response.status === "success" && response.data) {
          setClientsList(response.data);
        }
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };
    fetchClients();
  }, []);

  const form = useForm({
    resolver: zodResolver(carSchema),
    defaultValues: initialData ? {
        make: initialData.make || "",
        model: initialData.model || "",
        year: initialData.year || "",
        vin_chassis: initialData.vin_chassis || "",
        licensePlate: initialData.licensePlate || "",
        engine: initialData.engine || "",
        modifications: initialData.modifications || "",
        status: initialData.status || "en_taller",
        ownerName: initialData.ownerName || "",
        ownerPhone: initialData.ownerPhone || "",
        ownerEmail: initialData.ownerEmail || "",
        client_id: initialData.client_id || "",
    } : {
      make: "",
      model: "",
      year: "",
      vin_chassis: "",
      licensePlate: "",
      engine: "",
      modifications: "",
      status: "en_taller",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      client_id: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let finalData = { ...data };

      // If no client_id, but we have ownerName, create a new client first
      if (!finalData.client_id && finalData.ownerName) {
        try {
          const clientRes = await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: finalData.ownerName,
              email: finalData.ownerEmail || "",
              phone: finalData.ownerPhone || "",
              car_brand: finalData.make || "",
              car_model: finalData.model || "",
              car_plate: finalData.licensePlate || "",
            })
          });
          const clientResponse = await clientRes.json();
          if (clientResponse.status === "success" && clientResponse.data) {
            finalData.client_id = clientResponse.data.id;
          }
        } catch (err) {
          console.error("Error auto-creating client:", err);
          // continue saving car even if client creation fails
        }
      }

      let response;
      if (initialData) {
        response = await updateCar(initialData.id, finalData);
      } else {
        response = await createCar(finalData);
      }

      if (response.status === "success") {
        toast.success(initialData ? "Vehículo actualizado" : "Vehículo registrado");
        router.push("/cars");
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

  const clientOptions = clientsList.map(c => ({ value: c.id, label: c.name }));

  const popularMakes = [
    // Marcas Tradicionales
    "Toyota", "Nissan", "Chevrolet", "Ford", "Volkswagen", "Honda", "Kia", "Hyundai", 
    "Mazda", "Jeep", "Dodge", "BMW", "Mercedes-Benz", "Audi", "Renault", "Peugeot", 
    "Suzuki", "Seat", "Mitsubishi", "Fiat", "Subaru", "Volvo", "Lexus", "Porsche",
    // Marcas Chinas
    "MG", "Changan", "BYD", "Chery", "Geely", "JAC", "BAIC", "Omoda", "GWM", "Haval", "Jetour"
  ].sort().map(make => ({ value: make, label: make }));

  const formatLicensePlate = (val) => {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  };

  const formatPhone = (val) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned.slice(0, 3);
    if (cleaned.length > 3) formatted += ' ' + cleaned.slice(3, 6);
    if (cleaned.length > 6) formatted += ' ' + cleaned.slice(6, 9);
    return formatted;
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? `Editar: ${initialData.make} ${initialData.model}` : "Registrar Vehículo"}
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* CAR DETAILS SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Especificaciones del Vehículo</CardTitle>
            <CardDescription>Detalles principales y de rendimiento del coche.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="make">Marca *</Label>
              <Controller
                name="make"
                control={form.control}
                render={({ field }) => (
                  <CreatableSelect
                    {...field}
                    className="react-select"
                    classNamePrefix="select"
                    options={popularMakes}
                    placeholder="Escribe o selecciona marca"
                    value={field.value ? { label: field.value, value: field.value } : null}
                    onChange={(selected) => field.onChange(selected ? selected.value : "")}
                  />
                )}
              />
              {form.formState.errors.make && (
                <p className="text-sm text-destructive">{form.formState.errors.make.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                {...form.register("model")}
                placeholder="Ej. Skyline R32 GT-R"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-destructive">{form.formState.errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                {...form.register("year")}
                placeholder="Ej. 1994"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine">Motor</Label>
              <Input
                id="engine"
                {...form.register("engine")}
                placeholder="Ej. RB26DETT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin_chassis">VIN / Chasis</Label>
              <Input
                id="vin_chassis"
                {...form.register("vin_chassis")}
                placeholder="Ej. BNR32-123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Placas</Label>
              <Controller
                name="licensePlate"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="licensePlate"
                    placeholder="Ej. JDM-123"
                    onChange={(e) => field.onChange(formatLicensePlate(e.target.value))}
                  />
                )}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Estado en Taller</Label>
                <Select 
                    onValueChange={(value) => form.setValue("status", value)} 
                    defaultValue={form.watch("status")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en_taller">En Taller</SelectItem>
                        <SelectItem value="esperando_piezas">Esperando Piezas</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="modifications">Modificaciones / Especificaciones</Label>
              <Textarea
                id="modifications"
                {...form.register("modifications")}
                placeholder="Turbos híbridos, inyectores 1000cc, repro Haltech..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* OWNER INFO SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Datos de contacto del dueño del vehículo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerName">Nombre del Dueño *</Label>
              <Controller
                name="ownerName"
                control={form.control}
                render={({ field }) => (
                  <CreatableSelect
                    {...field}
                    className="react-select"
                    classNamePrefix="select"
                    options={clientOptions}
                    placeholder="Nombre completo"
                    value={
                      form.watch("client_id") 
                        ? clientOptions.find(c => c.value === form.watch("client_id")) 
                        : (field.value ? { label: field.value, value: field.value } : null)
                    }
                    onChange={(selectedOption) => {
                      const val = selectedOption ? selectedOption.value : "";
                      const selectedClient = clientsList.find(c => c.id === val);
                      
                      if (selectedClient) {
                        form.setValue("ownerName", selectedClient.name);
                        form.setValue("client_id", selectedClient.id);
                        form.setValue("ownerEmail", selectedClient.email || "");
                        form.setValue("ownerPhone", selectedClient.phone || "");
                      } else {
                        form.setValue("ownerName", val);
                        form.setValue("client_id", "");
                        // Opcional: no limpiar para permitir escribir un nuevo nombre con el mail/tel actual
                      }
                    }}
                  />
                )}
              />
              {form.formState.errors.ownerName && (
                <p className="text-sm text-destructive">{form.formState.errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Teléfono</Label>
              <Controller
                name="ownerPhone"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="ownerPhone"
                    placeholder="Ej. 999 999 999"
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                {...form.register("ownerEmail")}
                placeholder="cliente@correo.com"
              />
              {form.formState.errors.ownerEmail && (
                <p className="text-sm text-destructive">{form.formState.errors.ownerEmail.message}</p>
              )}
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
                Guardar Vehículo
            </Button>
        </div>
      </form>
    </div>
  );
}
