
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { CotizacionesRowActions } from "./components/cotizaciones-row-actions";
import { getCotizaciones, deleteCotizacion } from "@/config/cotizaciones.config";
import { createProject } from "@/config/projects.config";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(33, 37, 41);
        doc.text("Cotización", 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date(cotizacion.fecha).toLocaleDateString()}`, 14, 30);
        doc.text(`Cotización #: ${cotizacion.numero}`, 14, 36);
        doc.text(`Cliente: ${cotizacion.cliente_nombre || "N/A"}`, 14, 42);
        if(cotizacion.vehiculo) doc.text(`Vehículo: ${cotizacion.vehiculo}`, 14, 48);
        
        const tableData = cotizacion.detalles_cotizacion.map(item => [
            item.descripcion,
            item.cantidad,
            `$${parseFloat(item.precio_unitario).toFixed(2)}`,
            `$${(item.cantidad * item.precio_unitario).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: cotizacion.vehiculo ? 56 : 50,
            head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Subtotal']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            foot: [['', '', 'Total:', `$${parseFloat(cotizacion.total).toFixed(2)}`]],
            footStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold' }
        });

        if (cotizacion.notas) {
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.text("Notas Adicionales:", 14, finalY);
            const splitNotes = doc.splitTextToSize(cotizacion.notas, 180);
            doc.text(splitNotes, 14, finalY + 6);
        }

        doc.save(`Cotizacion_${cotizacion.numero}.pdf`);
    };

    const handleConvertToProject = async (cotizacion) => {
        if(cotizacion.estado === "rechazada") {
            toast.error("No se puede convertir una cotización rechazada.");
            return;
        }
        setLoading(true);
        try {
            const projectData = {
                title: `Proyecto de Cotización ${cotizacion.numero}`,
                client: cotizacion.cliente_nombre,
                carName: cotizacion.vehiculo || "",
                budget: cotizacion.total,
                status: "pending",
                priority: "media",
                startDate: new Date().toISOString(),
                description: `Convertido desde Cotización ${cotizacion.numero}.\n\nServicios:\n${cotizacion.detalles_cotizacion.map(i => `- ${i.cantidad}x ${i.descripcion}`).join('\n')}`,
                notes: cotizacion.notas || ""
            };
            const response = await createProject(projectData);
            if (response.status === "success") {
                toast.success("¡Proyecto creado exitosamente!");
                router.push("/projects");
            } else {
                toast.error("Error al crear proyecto.");
            }
        } catch(error) {
            toast.error("Error al convertir a proyecto.");
        } finally {
            setLoading(false);
        }
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
                        onConvertToProject={handleConvertToProject}
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
