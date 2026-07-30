"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateProject } from "@/config/projects.config";
import { toast } from "react-hot-toast";
import { Loader2, Send, Car, User, Clock, Wrench, ExternalLink, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CarDamageMapper } from "./car-damage-mapper";

export function ProjectDetailsSheet({ open, onClose, project, onUpdateProject }) {
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!project) return null;

  const comments = project.comments || [];

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSaving(true);
    try {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        date: new Date().toISOString(),
        author: "Usuario" // ideally from session
      };

      const updatedComments = [...comments, comment];
      const payload = { comments: updatedComments };

      const response = await updateProject(project.id, payload);
      
      if (response.status === "success") {
        toast.success("Comentario agregado");
        setNewComment("");
        // Actualizar el estado local
        onUpdateProject({ ...project, comments: updatedComments });
      } else {
        throw new Error("Error");
      }
    } catch (error) {
      toast.error("Error al guardar el comentario");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full flex flex-col p-0">
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between text-xl w-full pr-4">
              <div className="flex items-center gap-2">
                <Car className="w-6 h-6 text-primary" />
                {project.carName || "Vehículo sin nombre"}
              </div>
              <Link href={`/projects/${project.id}`} onClick={onClose}>
                <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                  Ver Proyecto <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </SheetTitle>
            <SheetDescription className="flex items-center gap-1">
              <User className="w-4 h-4" /> {project.client}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Ingreso: {new Date(project.startDate).toLocaleDateString()}
            </Badge>
            {project.mechanic && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary">
                <Wrench className="w-3 h-3" />
                Mecánico: {project.mechanic.name}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {project.inspectionDetails && (
            <div className="mb-6 bg-muted/30 border rounded-lg p-4">
              <h3 className="font-semibold text-sm text-default-900 flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Checklist de Recepción
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Combustible:</span> <span className="font-medium">{project.inspectionDetails.fuel_level}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kilometraje:</span> <span className="font-medium">{project.inspectionDetails.mileage || "N/A"}</span>
                </div>
                {project.inspectionDetails.exterior_damage && (
                  <div className="col-span-2 mt-4 pt-4 border-t">
                    <span className="text-muted-foreground block mb-3 font-semibold text-sm">Mapa de Daños:</span>
                    {Array.isArray(project.inspectionDetails.exterior_damage) ? (
                      <div className="flex flex-wrap gap-1">
                        {project.inspectionDetails.exterior_damage.map(d => (
                          <Badge key={d} variant="destructive" className="text-[10px] py-0">{d.replace("_", " ")}</Badge>
                        ))}
                      </div>
                    ) : (
                      <CarDamageMapper value={project.inspectionDetails.exterior_damage} readOnly={true} />
                    )}
                  </div>
                )}
                {project.inspectionDetails.valuables?.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <span className="text-muted-foreground block mb-1">Objetos de Valor:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.inspectionDetails.valuables.map(v => (
                        <Badge key={v} variant="outline" className="text-[10px] py-0">{v.replace("_", " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <h3 className="font-semibold text-sm text-default-900 mb-4">Comentarios e Historial</h3>
          
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay comentarios todavía. Agrega el primero.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {comment.author.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold">{comment.author}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-default-700">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un comentario o nota..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button size="icon" onClick={handleAddComment} disabled={isSaving || !newComment.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
