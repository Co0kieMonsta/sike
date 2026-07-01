"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const tipos = [
  { value: "ingreso", label: "Ingreso", color: "success" },
  { value: "egreso", label: "Egreso", color: "destructive" },
];

const estados = [
  { value: "completado", label: "Completado", color: "success" },
  { value: "pendiente", label: "Pendiente", color: "warning" },
  { value: "cancelado", label: "Cancelado", color: "secondary" },
];

const metodosPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "tarjeta", label: "Tarjeta" },
];

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px] font-mono text-xs">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fecha"));
      return (
        <div className="text-sm">
          {fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = tipos.find((t) => t.value === row.getValue("tipo"));
      if (!tipo) return null;

      return (
        <div className="flex items-center gap-2">
          {tipo.value === "ingreso" ? (
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          )}
          <Badge variant="outline" color={tipo.color}>
            {tipo.label}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "categoria",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("categoria")}</span>
          {row.original.subcategoria && (
            <span className="text-xs text-muted-foreground">{row.original.subcategoria}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "monto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const monto = parseFloat(row.getValue("monto"));
      const tipo = row.original.tipo;
      const formatted = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'PEN',
      }).format(monto);

      return (
        <div className={`text-right font-semibold ${
          tipo === "ingreso" ? "text-green-600" : "text-red-600"
        }`}>
          {tipo === "ingreso" ? "+" : "-"} {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "metodo_pago",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Método" />
    ),
    cell: ({ row }) => {
      const metodo = metodosPago.find((m) => m.value === row.getValue("metodo_pago"));
      return (
        <div className="text-sm">
          {metodo?.label || row.getValue("metodo_pago")}
        </div>
      );
    },
  },
  {
    accessorKey: "cuenta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.getValue("cuenta")}
        </div>
      );
    },
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] truncate" title={row.getValue("descripcion")}>
          {row.getValue("descripcion")}
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = estados.find((e) => e.value === row.getValue("estado"));
      if (!estado) return null;

      return (
        <Badge variant="soft" color={estado.color}>
          {estado.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      // This will be populated by the enhanced columns in the page
    }
  },
];

export { tipos, estados, metodosPago };

