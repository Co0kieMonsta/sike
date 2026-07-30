"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { CarsRowActions } from "./components/cars-row-actions";
import { getCars, deleteCar } from "@/config/cars.config";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Application } from "@/components/svg"; // Ensure you have an appropriate icon, or use lucide-react (e.g. Car)
import { Car } from "lucide-react";

const CarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const router = useRouter();

    const fetchCars = async () => {
        setLoading(true);
        try {
            const response = await getCars();
            if (response.status === "success") {
                setCars(response.data);
            } else {
                toast.error(response.message || "Error al cargar vehículos");
            }
        } catch (error) {
            toast.error("Error al cargar vehículos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleCreate = () => {
        router.push("/cars/crear");
    };

    const handleEdit = (car) => {
        router.push(`/cars/${car.id}`);
    };

    const handleView = (car) => {
        router.push(`/cars/${car.id}`);
    };
    
    const handleDelete = (car) => {
        setItemToDelete(car);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await deleteCar(itemToDelete.id);
            if (response.status === "success") {
                toast.success("Vehículo eliminado exitosamente");
                await fetchCars();
            } else {
                toast.error(response.message || "Error al eliminar vehículo");
            }
        } catch (error) {
            toast.error("Error al eliminar vehículo");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const enhancedColumns = columns.map((col) => {
        if (col.id === "actions") {
            return {
                ...col,
                cell: ({ row }) => (
                    <CarsRowActions
                        row={row}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                ),
            };
        }
        return col;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-muted-foreground">Cargando vehículos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Vehículos en Taller
                    </CardTitle>
                    <CardDescription>
                        Administra los vehículos y sus especificaciones de rendimiento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={enhancedColumns}
                        data={cars}
                        onRefresh={fetchCars}
                        onAdd={handleCreate}
                    />
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el registro de "{itemToDelete?.make} {itemToDelete?.model}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CarsPage;
