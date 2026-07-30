"use client";

import { useEffect, useState } from "react";
import { getProjectAttachments, addProjectAttachment, deleteProjectAttachment } from "@/config/projects.config";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, FileText, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "react-hot-toast";

const ProjectGalleryTab = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await getProjectAttachments(projectId);
      if (response.status === "success") setFiles(response.data);
    } catch (error) {
      toast.error("Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      const isImage = selectedFile.type.startsWith("image/");
      const storagePath = `projects/${projectId}/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await addProjectAttachment({
        projectId,
        name: selectedFile.name,
        url: downloadURL,
        type: isImage ? "image" : "document",
        size: selectedFile.size
      });
      
      toast.success("Archivo subido exitosamente");
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir archivo");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProjectAttachment(id);
      toast.success("Archivo eliminado");
      fetchFiles();
    } catch (e) {
      toast.error("Error al eliminar archivo");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Documentos y Fotos</h3>
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            onChange={handleFileUpload} 
            disabled={uploading}
            className="max-w-[250px]"
          />
          {uploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Cargando archivos...</p>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
            <p>No hay archivos adjuntos en este proyecto.</p>
            <p className="text-sm">Sube fotos o documentos usando el botón de arriba.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map(file => (
            <Card key={file.id} className="overflow-hidden group relative">
              {file.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full flex flex-col items-center justify-center bg-muted">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground truncate px-2 w-full text-center">{file.name}</span>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" asChild>
                  <a href={file.url} target="_blank" rel="noreferrer" title="Ver archivo">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(file.id)} title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectGalleryTab;
