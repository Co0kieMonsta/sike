"use client";

import { useState } from "react";
import { createAsset, updateAsset, deleteAsset } from "@/config/inventory.config";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wrench } from "lucide-react";

export function AssetsPageClient({ initialAssets, categories }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssets = initialAssets.filter((a) =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (confirm(`¿Estás seguro de eliminar el activo ${name}?`)) {
      try {
        const response = await deleteAsset(id);
        if (response.status === "success") {
          toast.success("Activo eliminado");
          router.refresh();
        } else {
          toast.error("Error al eliminar");
        }
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleOpenDialog = (asset = null) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      let response;
      if (editingAsset) {
        response = await updateAsset(editingAsset.id, data);
      } else {
        response = await createAsset(data);
      }

      if (response.status === "success") {
        toast.success(editingAsset ? "Activo actualizado" : "Activo registrado");
        handleCloseDialog();
        router.refresh();
      } else {
        toast.error(response.message || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="space-y-5">
      <Card className="mb-5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Wrench className="h-8 w-8 text-primary" />
                Activos y Herramientas
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Gestiona la maquinaria, equipos y herramientas del taller.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Registrar Activo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center py-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, serie o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="bg-background rounded-md border-0 sm:border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>No. Serie</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No se encontraron activos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((a) => {
                  let statusColor = "secondary";
                  let statusLabel = a.status;
                  if (a.status === "operativo") {
                    statusColor = "success";
                    statusLabel = "Operativo";
                  } else if (a.status === "en_mantenimiento") {
                    statusColor = "warning";
                    statusLabel = "Mantenimiento";
                  } else if (a.status === "dado_de_baja") {
                    statusColor = "destructive";
                    statusLabel = "Dado de baja";
                  }
                  
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        {a.imageUrl ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden border">
                            <img src={a.imageUrl} alt="asset" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            -
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">{a.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">{a.serial_number || "-"}</div>
                      </TableCell>
                      <TableCell>{a.categoryName || "-"}</TableCell>
                      <TableCell>
                        {a.brand || a.model ? (
                          <div>{a.brand} {a.model ? `(${a.model})` : ''}</div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="soft" color={statusColor}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">{a.assigned_to || "-"}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(a)} title="Editar">
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, a.name)} title="Eliminar">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <AssetFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        asset={editingAsset}
        isLoading={isLoading}
        categories={categories}
      />
    </div>
  );
}
