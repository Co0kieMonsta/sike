"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../../users/components/data-table-column-header";
import { AssetRowActions } from "./asset-row-actions";

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
    accessorKey: "imageUrl",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Imagen" />,
    cell: ({ row }) => {
      const url = row.getValue("imageUrl");
      return url ? (
        <div className="w-10 h-10 rounded-md overflow-hidden border">
          <img src={url} alt="asset" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
          -
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
    cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "serial_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Serie" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("serial_number") || "-"}</div>,
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => <div>{row.getValue("categoryName") || "-"}</div>,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Marca / Modelo" />,
    cell: ({ row }) => {
        const brand = row.getValue("brand");
        const model = row.original.model;
        if (!brand && !model) return <div>-</div>;
        return <div>{brand} {model ? `(${model})` : ''}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
        const status = row.getValue("status");
        let color = "secondary";
        let label = status;
        if (status === "operativo") {
            color = "success";
            label = "Operativo";
        } else if (status === "en_mantenimiento") {
            color = "warning";
            label = "Mantenimiento";
        } else if (status === "dado_de_baja") {
            color = "destructive";
            label = "Dado de baja";
        }
        return (
            <Badge variant="soft" color={color}>
                {label}
            </Badge>
        );
    },
  },
  {
    accessorKey: "assigned_to",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Asignado a" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("assigned_to") || "-"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <AssetRowActions row={row} />,
  },
];
