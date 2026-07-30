"use client";

import { useEffect, useState, use } from "react";
import { getProjectById } from "@/config/projects.config";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, KanbanSquare, DollarSign, Wrench, ImageIcon } from "lucide-react";

// Tab Components (to be implemented)
import ProjectOverviewTab from "./components/project-overview-tab";
import ProjectKanbanTab from "./components/project-kanban-tab";
import ProjectFinanceTab from "./components/project-finance-tab";
import ProjectPartsTab from "./components/project-parts-tab";
import ProjectGalleryTab from "./components/project-gallery-tab";
import ProjectNotesTab from "./components/project-notes-tab";
import ProjectChecklistTab from "./components/project-checklist-tab";
import { StickyNote, ClipboardCheck } from "lucide-react";

const ProjectDetailsPage = ({ params }) => {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await getProjectById(id);
      if (response.status === "success") {
        setProject(response.data);
      } else {
        toast.error(response.message || "Error al cargar proyecto");
      }
    } catch (error) {
      toast.error("Error al cargar proyecto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-muted-foreground">Cargando panel del proyecto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground text-lg">Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
        <p className="text-muted-foreground">Cliente: {project.client}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-background border h-auto p-1 flex-wrap justify-start">
          <TabsTrigger value="overview" className="flex gap-2 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex gap-2 py-2">
            <KanbanSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tareas</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex gap-2 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Finanzas</span>
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex gap-2 py-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Repuestos</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex gap-2 py-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Galería</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex gap-2 py-2">
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">Notas</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex gap-2 py-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Inspección</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverviewTab project={project} />
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <ProjectKanbanTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <ProjectFinanceTab project={project} />
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          <ProjectPartsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <ProjectGalleryTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <ProjectNotesTab project={project} onUpdate={fetchProject} />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <ProjectChecklistTab project={project} onUpdate={fetchProject} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsPage;
