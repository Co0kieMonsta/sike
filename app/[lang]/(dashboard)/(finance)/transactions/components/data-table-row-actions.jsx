"use client";

import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Copy,
  FileText,
  CheckCircle,
  XCircle,
  Download
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

export function DataTableRowActions({ row, onEdit, onDelete, onView, onChangeStatus }) {
  const transaction = row.original;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success("ID copiado al portapapeles");
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referencia);
    toast.success("Referencia copiada al portapapeles");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Edit Button */}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(transaction)}
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
            <DropdownMenuItem onClick={() => onView(transaction)}>
              <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Editar transacción
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Información</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Copiar ID
          </DropdownMenuItem>

          {transaction.referencia && (
            <DropdownMenuItem onClick={handleCopyRef}>
              <FileText className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Copiar referencia
            </DropdownMenuItem>
          )}

          {transaction.comprobante && (
            <DropdownMenuItem onClick={() => toast.info("Descargando comprobante...")}>
              <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Descargar comprobante
            </DropdownMenuItem>
          )}

          {onChangeStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CheckCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Cambiar estado
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onChangeStatus(transaction, "completado")}>
                    <CheckCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-green-600" />
                    Completado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus(transaction, "pendiente")}>
                    <CheckCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-yellow-600" />
                    Pendiente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus(transaction, "cancelado")}>
                    <XCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-gray-600" />
                    Cancelado
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}

          <DropdownMenuSeparator />
          
          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar transacción
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

