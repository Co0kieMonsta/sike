"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "@/config/finanzas.config";
import { toast } from "react-hot-toast";
import { 
  Tags, 
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ingreso",
    descripcion: "",
    icono: "Folder",
    color: "blue",
  });

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await getCategorias();
      if (response.status === "success") {
        setCategorias(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleOpenForm = (categoria = null) => {
    if (categoria) {
      setSelectedCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        descripcion: categoria.descripcion || "",
        icono: categoria.icono || "Folder",
        color: categoria.color || "blue",
      });
    } else {
      setSelectedCategoria(null);
      setFormData({
        nombre: "",
        tipo: "ingreso",
        descripcion: "",
        icono: "Folder",
        color: "blue",
      });
    }
    setFormDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = selectedCategoria
        ? await updateCategoria(selectedCategoria.id, formData)
        : await createCategoria(formData);

      if (response.status === "success") {
        toast.success(selectedCategoria ? "Categoría actualizada" : "Categoría creada");
        setFormDialogOpen(false);
        await fetchCategorias();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al guardar categoría");
    }
  };

  const handleDelete = async () => {
    if (!categoriaToDelete) return;
    try {
      const response = await deleteCategoria(categoriaToDelete.id);
      if (response.status === "success") {
        toast.success("Categoría eliminada");
        await fetchCategorias();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al eliminar categoría");
    } finally {
      setDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  const ingresoCategorias = categorias.filter(c => c.tipo === "ingreso");
  const egresoCategorias = categorias.filter(c => c.tipo === "egreso");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Tags className="h-8 w-8" />
            Gestión de Categorías
          </h2>
          <p className="text-muted-foreground">
            Organiza tus transacciones en categorías
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ingresoCategorias.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{egresoCategorias.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Income/Expense */}
      <Tabs defaultValue="ingresos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ingresos" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="egresos" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Egresos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ingresoCategorias.map((categoria) => (
              <Card key={categoria.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className={`h-5 w-5 text-${categoria.color}-600`} />
                      <CardTitle className="text-base">{categoria.nombre}</CardTitle>
                    </div>
                    <Badge variant="outline" color="success">
                      Ingreso
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {categoria.descripcion}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenForm(categoria)}
                    >
                      <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCategoriaToDelete(categoria);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="egresos" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {egresoCategorias.map((categoria) => (
              <Card key={categoria.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className={`h-5 w-5 text-${categoria.color}-600`} />
                      <CardTitle className="text-base">{categoria.nombre}</CardTitle>
                    </div>
                    <Badge variant="outline" color="destructive">
                      Egreso
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {categoria.descripcion}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenForm(categoria)}
                    >
                      <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCategoriaToDelete(categoria);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              {selectedCategoria ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategoria ? "Actualiza la información de la categoría" : "Completa el formulario para crear una nueva categoría"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Categoría</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ventas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Ingreso
                      </div>
                    </SelectItem>
                    <SelectItem value="egreso">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Egreso
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="red">Rojo</SelectItem>
                      <SelectItem value="yellow">Amarillo</SelectItem>
                      <SelectItem value="purple">Púrpura</SelectItem>
                      <SelectItem value="orange">Naranja</SelectItem>
                      <SelectItem value="teal">Turquesa</SelectItem>
                      <SelectItem value="indigo">Índigo</SelectItem>
                      <SelectItem value="gray">Gris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icono">Icono</Label>
                  <Input
                    id="icono"
                    value={formData.icono}
                    onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                    placeholder="Folder"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedCategoria ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la categoría{" "}
              <span className="font-semibold">{categoriaToDelete?.nombre}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoriaToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriasPage;

