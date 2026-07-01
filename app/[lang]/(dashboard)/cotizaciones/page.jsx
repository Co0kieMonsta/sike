
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { CotizacionesRowActions } from "./components/cotizaciones-row-actions";
import { getCotizaciones, deleteCotizacion } from "@/config/cotizaciones.config";
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
import { FileText, Plus, Trash2 } from "lucide-react";

const CotizacionesPage = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const router = useRouter();

    const fetchCotizaciones = async () => {
        setLoading(true);
        try {
            const response = await getCotizaciones();
            if (response.status === "success") {
                setCotizaciones(response.data);
            } else {
                toast.error(response.message || "Error al cargar cotizaciones");
            }
        } catch (error) {
            toast.error("Error al cargar cotizaciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    const handleCreate = () => {
        router.push("/cotizaciones/crear");
    };

    const handleEdit = (cotizacion) => {
        router.push(`/cotizaciones/${cotizacion.id}/editar`);
    };

    const handleView = (cotizacion) => {
        router.push(`/cotizaciones/${cotizacion.id}`);
    };
    
    const handlePrint = (cotizacion) => {
        // Redirect to view page which should have print styles
        router.push(`/cotizaciones/${cotizacion.id}?print=true`);
    };

    const handleDelete = (cotizacion) => {
        setItemToDelete(cotizacion);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await deleteCotizacion(itemToDelete.id);
            if (response.status === "success") {
                toast.success("Cotización eliminada exitosamente");
                await fetchCotizaciones();
            } else {
                toast.error(response.message || "Error al eliminar cotización");
            }
        } catch (error) {
            toast.error("Error al eliminar cotización");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Enhance columns with actions
    const enhancedColumns = columns.map((col) => {
        if (col.id === "actions") {
            return {
                ...col,
                cell: ({ row }) => (
                    <CotizacionesRowActions
                        row={row}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onPrint={handlePrint}
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
                    <p className="mt-4 text-muted-foreground">Cargando cotizaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Cotizaciones
                    </CardTitle>
                    <CardDescription>
                        Administra las cotizaciones de tus clientes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={enhancedColumns}
                        data={cotizaciones}
                        onRefresh={fetchCotizaciones}
                        onAdd={handleCreate}
                        // onDeleteSelected={handleBulkDelete} // Implement if needed
                    />
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la cotización #{itemToDelete?.numero}.
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

export default CotizacionesPage;
