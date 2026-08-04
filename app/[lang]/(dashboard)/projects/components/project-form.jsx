"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/config/projects.config";
import { getCars, createCar } from "@/config/cars.config";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const projectSchema = z.object({
  title: z.string().min(1, "El título del proyecto es requerido"),
  client: z.string().min(1, "El nombre del cliente es requerido"),
  carId: z.string().optional(),
  carName: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.date({ required_error: "La fecha de inicio es requerida" }),
  endDate: z.date().optional().nullable(),
  budget: z.coerce.number().min(0, "Mínimo 0").optional(),
});

export function ProjectForm({ initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [carsList, setCarsList] = useState([]);
  
  // New Car state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creatingCar, setCreatingCar] = useState(false);
  const [newCar, setNewCar] = useState({
    make: "",
    model: "",
    licensePlate: "",
    ownerName: "",
    ownerPhone: ""
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getCars();
        if (response.status === "success" && response.data) {
          setCarsList(response.data);
          const uniqueClients = new Map();
          response.data.forEach(car => {
            if (car.ownerName && !uniqueClients.has(car.ownerName)) {
              uniqueClients.set(car.ownerName, {
                name: car.ownerName,
                email: car.ownerEmail || "",
                phone: car.ownerPhone || ""
              });
            }
          });
          setClientsList(Array.from(uniqueClients.values()));
        }
      } catch (error) {
        console.error("Error fetching clients from cars", error);
      }
    };
    fetchClients();
  }, []);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData.endDate ? new Date(initialData.endDate) : null,
    } : {
      startDate: new Date(),
      status: "pending",
      priority: "media",
      budget: 0
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      if (initialData) {
        response = await updateProject(initialData.id, data);
      } else {
        response = await createProject(data);
      }

      if (response.status === "success") {
        toast.success(initialData ? "Proyecto actualizado" : "Proyecto creado");
        router.push("/projects");
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

  // Formatters for masking
  const formatLicensePlate = (val) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    // Format as XXX-XXX (cap at 6)
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  };

  const formatPhone = (val) => {
    // Remove all non-numeric characters
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned.slice(0, 3);
    if (cleaned.length > 3) {
      formatted += ' ' + cleaned.slice(3, 6);
    }
    if (cleaned.length > 6) {
      formatted += ' ' + cleaned.slice(6, 9); // Cap at 9 digits as requested: 999 999 999
    }
    return formatted;
  };

  const popularMakes = [
    // Marcas Tradicionales
    "Toyota", "Nissan", "Chevrolet", "Ford", "Volkswagen", "Honda", "Kia", "Hyundai", 
    "Mazda", "Jeep", "Dodge", "BMW", "Mercedes-Benz", "Audi", "Renault", "Peugeot", 
    "Suzuki", "Seat", "Mitsubishi", "Fiat", "Subaru", "Volvo", "Lexus", "Porsche",
    // Marcas Chinas
    "MG", "Changan", "BYD", "Chery", "Geely", "JAC", "BAIC", "Omoda", "GWM", "Haval", "Jetour"
  ].sort().map(make => ({ value: make, label: make }));

  const handleCreateCar = async () => {
    if (!newCar.make || !newCar.model || !newCar.ownerName) {
      toast.error("Marca, Modelo y Dueño son requeridos");
      return;
    }
    setCreatingCar(true);
    try {
      const res = await createCar(newCar);
      if (res.status === "success") {
        toast.success("Vehículo registrado exitosamente");
        // Refetch cars
        const carsRes = await getCars();
        if (carsRes.status === "success" && carsRes.data) {
          setCarsList(carsRes.data);
        }
        
        // Auto select new car
        form.setValue("carId", res.data.id);
        form.setValue("carName", `${res.data.make} ${res.data.model}`);
        form.setValue("client", res.data.ownerName);
        
        setIsDialogOpen(false);
        setNewCar({ make: "", model: "", licensePlate: "", ownerName: "", ownerPhone: "" });
      } else {
        toast.error("Error al crear vehículo");
      }
    } catch (error) {
      toast.error("Error al crear vehículo");
    } finally {
      setCreatingCar(false);
    }
  };

  const clientOptions = clientsList.map(c => ({ value: c.name, label: c.name }));
  const carOptions = carsList.map(c => ({ 
    value: c.id, 
    label: `${c.make} ${c.model} ${c.licensePlate ? `[${c.licensePlate}]` : ''} - Dueño: ${c.ownerName}`,
    carName: `${c.make} ${c.model}`,
    ownerName: c.ownerName
  }));

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? `Editar Proyecto: ${initialData.title}` : "Nuevo Proyecto"}
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Proyecto *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Swap 2JZ"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carId">Vehículo Asociado</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Controller
                    name="carId"
                    control={form.control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        className="react-select"
                        classNamePrefix="select"
                        options={carOptions}
                        placeholder="Seleccionar vehículo (opcional)"
                        value={carOptions.find(c => c.value === field.value) || (field.value ? { label: form.watch('carName') || 'Vehículo', value: field.value } : null)}
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption ? selectedOption.value : "");
                          if (selectedOption && selectedOption.ownerName) {
                            form.setValue("client", selectedOption.ownerName);
                            form.setValue("carName", selectedOption.carName);
                          }
                        }}
                      />
                    )}
                  />
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button" className="shrink-0">+</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Nuevo Vehículo / Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2 overflow-visible">
                        <Label>Marca *</Label>
                        <CreatableSelect
                          className="react-select"
                          classNamePrefix="select"
                          options={popularMakes}
                          placeholder="Escribe o selecciona marca"
                          value={newCar.make ? { label: newCar.make, value: newCar.make } : null}
                          onChange={(selected) => setNewCar({...newCar, make: selected ? selected.value : ""})}
                          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Modelo *</Label>
                        <Input value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} placeholder="Ej. Civic 2020" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Placas</Label>
                        <Input 
                          value={newCar.licensePlate} 
                          onChange={(e) => setNewCar({...newCar, licensePlate: formatLicensePlate(e.target.value)})} 
                          placeholder="Ej. XYZ-123" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Dueño (Cliente) *</Label>
                        <Input value={newCar.ownerName} onChange={(e) => setNewCar({...newCar, ownerName: e.target.value})} placeholder="Nombre completo" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Teléfono Dueño</Label>
                        <Input 
                          value={newCar.ownerPhone} 
                          onChange={(e) => setNewCar({...newCar, ownerPhone: formatPhone(e.target.value)})} 
                          placeholder="Ej. 999 999 999" 
                        />
                      </div>
                      <Button onClick={handleCreateCar} disabled={creatingCar} className="mt-2" type="button">
                        {creatingCar ? "Guardando..." : "Guardar y Seleccionar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                {...form.register("client")}
                placeholder="Nombre del cliente"
              />
              {form.formState.errors.client && (
                <p className="text-sm text-destructive">{form.formState.errors.client.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto ($)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                {...form.register("budget")}
                placeholder="0.00"
              />
              {form.formState.errors.budget && (
                <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
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
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En Progreso</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select 
                    onValueChange={(value) => form.setValue("priority", value)} 
                    defaultValue={form.watch("priority")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.watch("startDate") && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("startDate") ? format(form.watch("startDate"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={form.watch("startDate")}
                            onSelect={(date) => form.setValue("startDate", date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Fecha de Finalización</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.watch("endDate") && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("endDate") ? format(form.watch("endDate"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={form.watch("endDate")}
                            onSelect={(date) => form.setValue("endDate", date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción / Detalles del Servicio</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Detalles sobre lo que incluye el proyecto..."
                className="min-h-[120px]"
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
                Guardar Proyecto
            </Button>
        </div>
      </form>
    </div>
  );
}
