"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Wrench, Car, User, CheckCircle2, Clock } from "lucide-react";

import { updateProject } from "@/config/projects.config";
import { toast } from "react-hot-toast";

// Column Definitions
export const SHOP_COLUMNS = [
  { id: "pending", title: "Pendiente", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "diagnostico", title: "Diagnóstico", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "esperando_repuestos", title: "Esperando Repuestos", color: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "en_reparacion", title: "En Reparación", color: "bg-purple-50 dark:bg-purple-900/20" },
  { id: "lavado", title: "Lavado", color: "bg-cyan-50 dark:bg-cyan-900/20" },
  { id: "listo", title: "Listo para Entrega", color: "bg-green-50 dark:bg-green-900/20" },
  { id: "entregado", title: "Entregado", color: "bg-emerald-50 dark:bg-emerald-900/20" }
];

// Sub-component: The draggable Card for a Project
function ProjectCard({ project, onAssignMechanic, onProjectClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, data: { type: "Project", project } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger click if we are not dragging
        if (!isDragging) {
          onProjectClick(project);
        }
      }}
      className={`relative p-3 mb-3 bg-background border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors ${
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-sm text-default-900 line-clamp-1">
          {project.carName || "Vehículo sin nombre"}
        </div>
        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
          {project.priority || "media"}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
        <User className="w-3 h-3" />
        <span className="line-clamp-1">{project.client}</span>
      </div>

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(project.startDate).toLocaleDateString()}
          </div>
          {project.comments?.length > 0 && (
            <div className="text-[10px] text-primary flex items-center gap-1 bg-primary/10 px-1.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              {project.comments.length}
            </div>
          )}
        </div>
        
        {project.mechanic ? (
          <Avatar className="w-6 h-6 border" title={`Asignado a: ${project.mechanic.name}`}>
            <AvatarImage src={project.mechanic.image} />
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
              {project.mechanic.name?.substring(0, 2).toUpperCase() || "MC"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation(); // prevent drag
              onAssignMechanic(project);
            }}
            title="Asignar mecánico"
          >
            <Wrench className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Sub-component: A Column in the Board
function BoardColumn({ column, projects, onAssignMechanic, onProjectClick }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[280px] min-w-[280px] rounded-xl border border-border/50 ${column.color}`}
    >
      <div className="p-3 border-b border-border/50 flex justify-between items-center bg-background/50 rounded-t-xl">
        <div className="font-bold text-sm text-default-900">
          {column.title}
        </div>
        <Badge className="bg-default-900 text-default-100 font-bold px-2">
          {projects.length}
        </Badge>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-[150px]">
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onAssignMechanic={onAssignMechanic} onProjectClick={onProjectClick} />
          ))}
        </SortableContext>
        
        {projects.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 py-8">
            <Car className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-xs">Soltar aquí</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component: Shop Board
export default function ShopBoard({ initialProjects, onAssignMechanicModal, onProjectClick }) {
  const [projects, setProjects] = useState(initialProjects || []);
  const [activeProject, setActiveProject] = useState(null);

  React.useEffect(() => {
    setProjects(initialProjects || []);
  }, [initialProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === "Project") {
      setActiveProject(active.data.current.project);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the dragging project
    const activeProjectIndex = projects.findIndex((p) => p.id === activeId);
    const project = projects[activeProjectIndex];

    // Determine the new column (either dropped on a column directly, or over another task)
    let newStatus = project.status;
    const overData = over.data.current;

    if (overData?.type === "Column") {
      newStatus = overData.column.id;
    } else if (overData?.type === "Project") {
      newStatus = overData.project.status;
    }

    // If status changed
    if (newStatus !== project.status) {
      // Optimistic UI Update
      const previousStatus = project.status;
      setProjects((prev) => 
        prev.map(p => p.id === activeId ? { ...p, status: newStatus } : p)
      );

      // Trigger assign modal if moved to En Reparacion and no mechanic assigned
      if (newStatus === "en_reparacion" && !project.mechanic) {
        onAssignMechanicModal({ ...project, status: newStatus });
      }

      // API Call
      try {
        const response = await updateProject(activeId, { status: newStatus });
        if (response.status === "success") {
          toast.success(`Movido a ${SHOP_COLUMNS.find(c => c.id === newStatus)?.title}`);
        } else {
          throw new Error("Failed");
        }
      } catch (error) {
        toast.error("Error al mover el vehículo");
        // Revert optimistic update
        setProjects((prev) => 
          prev.map(p => p.id === activeId ? { ...p, status: previousStatus } : p)
        );
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 items-stretch h-[calc(100vh-220px)]">
        {SHOP_COLUMNS.map((col) => (
          <BoardColumn 
            key={col.id} 
            column={col} 
            projects={projects.filter(p => (p.status || "pending") === col.id)} 
            onAssignMechanic={onAssignMechanicModal}
            onProjectClick={onProjectClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <ProjectCard project={activeProject} onAssignMechanic={() => {}} onProjectClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
