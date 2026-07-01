
"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../users/components/data-table-column-header"; // Reuse
import { CotizacionesRowActions } from "./cotizaciones-row-actions";

const estados = [
  {
    value: "pendiente",
    label: "Pendiente",
    color: "warning",
  },
  {
    value: "aceptada",
    label: "Aceptada",
    color: "success",
  },
  {
    value: "rechazada",
    label: "Rechazada",
    color: "destructive",
  },
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
    accessorKey: "numero",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Numero" />
    ),
    cell: ({ row }) => <div className="font-medium">#{row.getValue("numero")}</div>,
  },
  {
    accessorKey: "cliente_nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("cliente_nombre")}</div>,
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
        const date = new Date(row.getValue("fecha"));
        return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = estados.find((s) => s.value === row.getValue("estado")) || { label: row.getValue("estado"), color: "default" };

      return (
        <Badge variant="soft" color={status.color}>
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_by_user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado Por" />
    ),
    cell: ({ row }) => {
      const creatorName = row.original.created_by_user?.name || "-";
      return (
        <div className="text-sm text-muted-foreground">
          {creatorName}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CotizacionesRowActions row={row} />,
    meta: {}
  },
];
