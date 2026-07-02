"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "@/config/usuarios.config";
import { toast } from "react-hot-toast";
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
import { Users, Download, Upload, Trash2, Plus, Search, Pencil } from "lucide-react";
import { UserFormDialog } from "./components/user-form-dialog";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formLoading, setFormLoading] = useState(false);

  // Fetch usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await getUsuarios();
      if (response.status === "success") {
        setUsuarios(response.data);
      } else {
        toast.error(response.message || "Error al cargar usuarios");
      }
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Handle add user
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormDialogOpen(true);
  };

  // Handle delete user confirmation
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await deleteUsuario(userToDelete.id);
      if (response.status === "success") {
        toast.success("Usuario eliminado exitosamente");
        await fetchUsuarios();
      } else {
        toast.error(response.message || "Error al eliminar usuario");
      }
    } catch (error) {
      toast.error("Error al eliminar usuario");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      let response;
      if (selectedUser) {
        // Update existing user
        response = await updateUsuario(selectedUser.id, data);
      } else {
        // Create new user
        response = await createUsuario(data);
      }

      if (response.status === "success") {
        toast.success(
          selectedUser
            ? "Usuario actualizado exitosamente"
            : "Usuario creado exitosamente"
        );
        setFormDialogOpen(false);
        await fetchUsuarios();
      } else {
        toast.error(response.message || "Error al guardar usuario");
      }
    } catch (error) {
      toast.error("Error al guardar usuario");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios del sistema, asigna roles y permisos. 
            Puedes crear, editar, eliminar y cambiar el estado.
          </p>
        </div>
        <Button onClick={handleAddUser} className="w-full sm:w-auto">
          <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en el sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con estado activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.role === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios con rol admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios pendientes de activación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenedor de Tabla con Restricción Absoluta */}
      <Card className="w-full max-w-full overflow-hidden border-0 sm:border">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Directorio de Usuarios</CardTitle>
          <CardDescription>Lista completa de miembros de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="flex items-center gap-2 mb-4 px-4 sm:px-0 pt-4 sm:pt-0">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image?.src || user.image} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium whitespace-nowrap">{user.name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" color={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'info' : 'default'} className="capitalize whitespace-nowrap">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="soft" color={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'warning' : 'secondary'} className="capitalize whitespace-nowrap">
                          {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{user.department || '-'}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={user.position}>
                          {user.position || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              usuario{" "}
              <span className="font-semibold">{userToDelete?.name}</span> del
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
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

export default UsuariosPage;

