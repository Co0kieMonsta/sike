"use client";

import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Copy,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

export function DataTableRowActions({ row, onEdit, onDelete, onView, onChangeStatus, onChangeRole }) {
  const usuario = row.original;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(usuario.email);
    toast.success("Email copiado al portapapeles");
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(usuario.phone);
    toast.success("Teléfono copiado al portapapeles");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Edit Button */}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(usuario)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          {onView && (
            <DropdownMenuItem onClick={() => onView(usuario)}>
              <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(usuario)}>
              <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Editar usuario
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Información de contacto</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleCopyEmail}>
            <Mail className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Copiar email
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyPhone}>
            <Phone className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Copiar teléfono
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(usuario.id)}>
            <Copy className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Copiar ID
          </DropdownMenuItem>

          {(onChangeStatus || onChangeRole) && <DropdownMenuSeparator />}

          {onChangeStatus && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Cambiar estado
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onChangeStatus(usuario, "active")}>
                  <UserCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-green-600" />
                  Activo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus(usuario, "inactive")}>
                  <UserX className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-yellow-600" />
                  Inactivo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus(usuario, "pending")}>
                  <UserCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-gray-600" />
                  Pendiente
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {onChangeRole && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Cambiar rol
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onChangeRole(usuario, "admin")}>
                  <Shield className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-red-600" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(usuario, "manager")}>
                  <Shield className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-blue-600" />
                  Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(usuario, "user")}>
                  <Shield className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-gray-600" />
                  User
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator />
          
          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(usuario)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar usuario
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

