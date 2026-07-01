"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { UserFormDialog } from "./components/user-form-dialog";
import { DataTableRowActions } from "./components/data-table-row-actions";
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
import { Users, Download, Upload, Trash2 } from "lucide-react";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usersToDelete, setUsersToDelete] = useState([]);
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

  // Handle bulk delete
  const handleBulkDelete = (selectedRows) => {
    setUsersToDelete(selectedRows.map(row => row.original));
    setBulkDeleteDialogOpen(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    try {
      const deletePromises = usersToDelete.map(user => deleteUsuario(user.id));
      await Promise.all(deletePromises);
      
      toast.success(`${usersToDelete.length} usuario(s) eliminado(s) exitosamente`);
      await fetchUsuarios();
    } catch (error) {
      toast.error("Error al eliminar usuarios");
    } finally {
      setBulkDeleteDialogOpen(false);
      setUsersToDelete([]);
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(usuarios, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Usuarios exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar usuarios");
    }
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedUsers = JSON.parse(text);
        
        if (!Array.isArray(importedUsers)) {
          toast.error("Formato de archivo inválido");
          return;
        }

        // Here you would typically call an API to bulk import
        // For now, we'll just show a success message
        toast.success(`Listo para importar ${importedUsers.length} usuarios`);
      } catch (error) {
        toast.error("Error al importar usuarios");
      }
    };
    input.click();
  };

  // Handle change status
  const handleChangeStatus = async (user, newStatus) => {
    try {
      const response = await updateUsuario(user.id, { ...user, status: newStatus });
      if (response.status === "success") {
        toast.success("Estado actualizado exitosamente");
        await fetchUsuarios();
      } else {
        toast.error(response.message || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  // Handle change role
  const handleChangeRole = async (user, newRole) => {
    try {
      const response = await updateUsuario(user.id, { ...user, role: newRole });
      if (response.status === "success") {
        toast.success("Rol actualizado exitosamente");
        await fetchUsuarios();
      } else {
        toast.error(response.message || "Error al actualizar rol");
      }
    } catch (error) {
      toast.error("Error al actualizar rol");
    }
  };

  // Enhance columns with action handlers
  const enhancedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => (
          <DataTableRowActions
            row={row}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onChangeStatus={handleChangeStatus}
            onChangeRole={handleChangeRole}
          />
        ),
      };
    }
    return col;
  });

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
    <div className="space-y-5">
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

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>
            Administra los usuarios del sistema, asigna roles y permisos. 
            Puedes crear, editar, eliminar y cambiar el estado de los usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={enhancedColumns}
            data={usuarios}
            onRefresh={fetchUsuarios}
            onAddUser={handleAddUser}
            onDeleteSelected={handleBulkDelete}
            onExport={handleExport}
            onImport={handleImport}
          />
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Eliminar múltiples usuarios?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{" "}
              <span className="font-semibold">{usersToDelete.length} usuario(s)</span> del
              sistema.
              {usersToDelete.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto rounded-md border p-2">
                  <ul className="space-y-1 text-sm">
                    {usersToDelete.map((user) => (
                      <li key={user.id} className="flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUsersToDelete([])}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar {usersToDelete.length} usuario(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsuariosPage;

