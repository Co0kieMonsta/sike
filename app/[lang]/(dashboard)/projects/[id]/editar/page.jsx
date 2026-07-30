"use client";

import { useState, useEffect } from "react";
import { ProjectForm } from "../../components/project-form";
import { getProjectById } from "@/config/projects.config";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const EditProjectPage = ({ params }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      // params.id requires unwrapping in React 18/Next.js 16 if it's a promise,
      // but in this setup we can directly access it or await it.
      const resolvedParams = await params;
      try {
        const response = await getProjectById(resolvedParams.id);
        if (response.status === "success") {
          setProject(response.data);
        } else {
          toast.error("Error al cargar el proyecto");
        }
      } catch (error) {
        toast.error("Error al cargar el proyecto");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Proyecto no encontrado
      </div>
    );
  }

  return <ProjectForm initialData={project} />;
};

export default EditProjectPage;
