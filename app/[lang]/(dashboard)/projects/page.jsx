"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { ProjectsRowActions } from "./components/projects-row-actions";
import { getProjects, deleteProject } from "@/config/projects.config";
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
import { ClipBoard, FileText } from "lucide-react";

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const router = useRouter();

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getProjects();
            if (response.status === "success") {
                setProjects(response.data);
            } else {
                toast.error(response.message || "Error al cargar proyectos");
            }
        } catch (error) {
            toast.error("Error al cargar proyectos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreate = () => {
        router.push("/projects/crear");
    };

    const handleEdit = (project) => {
        router.push(`/projects/${project.id}`);
    };

    const handleView = (project) => {
        router.push(`/projects/${project.id}`);
    };
    
    const handleDelete = (project) => {
        setItemToDelete(project);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await deleteProject(itemToDelete.id);
            if (response.status === "success") {
                toast.success("Proyecto eliminado exitosamente");
                await fetchProjects();
            } else {
                toast.error(response.message || "Error al eliminar proyecto");
            }
        } catch (error) {
            toast.error("Error al eliminar proyecto");
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
                    <ProjectsRowActions
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
                    <p className="mt-4 text-muted-foreground">Cargando proyectos...</p>
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
                        Proyectos
                    </CardTitle>
                    <CardDescription>
                        Administra los proyectos y servicios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={enhancedColumns}
                        data={projects}
                        onRefresh={fetchProjects}
                        onAdd={handleCreate}
                    />
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el proyecto "{itemToDelete?.title}".
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

export default ProjectsPage;
