"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../users/components/data-table-column-header";
import { CarsRowActions } from "./cars-row-actions";

const estados = [
  { value: "en_taller", label: "En Taller", color: "warning" },
  { value: "esperando_piezas", label: "Esperando Piezas", color: "destructive" },
  { value: "entregado", label: "Entregado", color: "success" },
];

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: "make",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Marca" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("make")}</div>,
  },
  {
    accessorKey: "model",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("model")} {row.original.year && `(${row.original.year})`}</div>,
  },
  {
    accessorKey: "engine",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Motor" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("engine") || "-"}</div>,
  },
  {
    accessorKey: "ownerName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => <div className="truncate max-w-[150px]">{row.getValue("ownerName")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = estados.find((s) => s.value === row.getValue("status")) || { label: row.getValue("status"), color: "default" };
      return <Badge variant="soft" color={status.color}>{status.label}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }) => <CarsRowActions row={row} />,
  },
];
