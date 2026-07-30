"use client";

import { useState } from "react";
import { updateProject } from "@/config/projects.config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const ProjectNotesTab = ({ project, onUpdate }) => {
  const router = useRouter();
  const [notes, setNotes] = useState(project?.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const response = await updateProject(project.id, {
        ...project, // keep other fields intact to bypass missing fields since updateProject just PUTs
        notes: notes
      });
      if (response.status === "success") {
        toast.success("Notas guardadas exitosamente");
        if (onUpdate) onUpdate();
        router.refresh();
      } else {
        toast.error("Error al guardar notas");
      }
    } catch (error) {
      toast.error("Error al guardar notas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas del Proyecto</CardTitle>
        <CardDescription>
          Anota aquí cualquier detalle adicional, requerimiento especial del cliente, o progreso importante.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Escribe tus notas aquí..."
          className="min-h-[300px] resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveNotes} disabled={loading}>
            {loading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
            <Save className="mr-2 h-4 w-4" />
            Guardar Notas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectNotesTab;
