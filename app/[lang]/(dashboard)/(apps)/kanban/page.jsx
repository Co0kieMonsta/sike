"use client";

import React, { useEffect, useState } from "react";
import { getProjects } from "@/config/projects.config";
import KanbanBreadCrumbs from "./bread-crumbs";
import ShopBoard from "@/components/shop/shop-board";
import { AssignMechanicModal } from "@/components/shop/assign-mechanic-modal";
import { ProjectDetailsSheet } from "@/components/shop/project-details-sheet";
import { Loader2 } from "lucide-react";

export default function TallerEnVivoPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [projectToAssign, setProjectToAssign] = useState(null);

  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [projectForDetails, setProjectForDetails] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getProjects();
      if (res.status === "success") {
        setProjects(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleOpenAssignModal = (project) => {
    setProjectToAssign(project);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = (mechanic) => {
    // Update local state so it reflects immediately
    setProjects(prev => prev.map(p => 
      p.id === projectToAssign.id ? { ...p, mechanic, status: projectToAssign.status } : p
    ));
  };

  const handleOpenDetails = (project) => {
    setProjectForDetails(project);
    setDetailsSheetOpen(true);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setProjectForDetails(updatedProject); // Update sheet if open
  };

  return (
    <>
      <div className="flex flex-wrap mb-7">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-default-900">Taller en Vivo</h1>
          <p className="text-sm text-muted-foreground mt-1">Controla el flujo de los vehículos en tiempo real</p>
        </div>
        <div className="flex-none">
          <KanbanBreadCrumbs />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <ShopBoard 
          initialProjects={projects} 
          onAssignMechanicModal={handleOpenAssignModal}
          onProjectClick={handleOpenDetails}
        />
      )}

      <AssignMechanicModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        project={projectToAssign}
        onAssignSuccess={handleAssignSuccess}
      />

      <ProjectDetailsSheet
        open={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
        project={projectForDetails}
        onUpdateProject={handleUpdateProject}
      />
    </>
  );
}
