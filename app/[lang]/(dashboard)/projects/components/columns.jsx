"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../users/components/data-table-column-header";
import { ProjectsRowActions } from "./projects-row-actions";

const estados = [
  { value: "pending", label: "Pendiente", color: "warning" },
  { value: "in_progress", label: "En Progreso", color: "info" },
  { value: "completed", label: "Completado", color: "success" },
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
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("client")}</div>,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha Inicio" />,
    cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"));
        return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "budget",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Presupuesto" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget")) || 0;
      const formatted = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prioridad" />,
    cell: ({ row }) => {
      const p = row.getValue("priority") || "media";
      if (p === "alta") return <Badge variant="outline" className="text-red-700 bg-red-100 border-red-200">Alta</Badge>;
      if (p === "baja") return <Badge variant="outline" className="text-blue-700 bg-blue-100 border-blue-200">Baja</Badge>;
      return <Badge variant="outline" className="text-amber-700 bg-amber-100 border-amber-200">Media</Badge>;
    },
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
    cell: ({ row }) => <ProjectsRowActions row={row} />,
  },
];
