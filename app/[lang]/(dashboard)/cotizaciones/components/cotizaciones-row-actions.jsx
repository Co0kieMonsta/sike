
"use client";

import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Printer,
  Copy,
  Hammer,
  Send
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

export function CotizacionesRowActions({ row, onEdit, onDelete, onView, onPrint, onConvertToProject }) {
  const cotizacion = row.original;

  const handleShare = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const magicLink = `${origin}/es/quote/${cotizacion.id}`;
    const text = `Hola ${cotizacion.cliente_nombre || ''}, aquí tienes la cotización para tu ${cotizacion.vehiculo || 'vehículo'}. Puedes revisarla y aprobarla en el siguiente enlace: ${magicLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Edit Button */}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(cotizacion)}
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
            <DropdownMenuItem onClick={() => onView(cotizacion)}>
              <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
          )}

          {onPrint && (
            <DropdownMenuItem onClick={() => onPrint(cotizacion)}>
              <Printer className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Descargar PDF
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleShare} className="text-green-600 focus:text-green-700 focus:bg-green-50">
            <Send className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Compartir por WhatsApp
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {onConvertToProject && (
            <DropdownMenuItem onClick={() => onConvertToProject(cotizacion)} className="text-primary focus:text-primary">
              <Hammer className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Convertir a Proyecto
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(cotizacion)}>
              <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(cotizacion)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
