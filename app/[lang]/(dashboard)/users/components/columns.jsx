"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

const roles = [
  {
    value: "admin",
    label: "Admin",
    color: "destructive",
  },
  {
    value: "manager",
    label: "Manager",
    color: "info",
  },
  {
    value: "user",
    label: "User",
    color: "default",
  },
];

const statuses = [
  {
    value: "active",
    label: "Activo",
    color: "success",
  },
  {
    value: "inactive",
    label: "Inactivo",
    color: "warning",
  },
  {
    value: "pending",
    label: "Pendiente",
    color: "secondary",
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name");
      const email = row.original.email;
      const image = row.original.image;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image?.src || image} alt={name} />
            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => {
      const role = roles.find((r) => r.value === row.getValue("role"));

      if (!role) {
        return null;
      }

      return (
        <Badge variant="outline" color={role.color}>
          {role.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue("status"));

      if (!status) {
        return null;
      }

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
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Departamento" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("department")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Posición" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue("position")}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.getValue("phone")}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      );
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
    accessorKey: "updated_by_user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modificado Por" />
    ),
    cell: ({ row }) => {
      const updaterName = row.original.updated_by_user?.name || "-";
      const updatedAt = row.original.updated_at ? new Date(row.original.updated_at).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : "";
      
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{updaterName}</span>
          {updatedAt && <span className="text-xs text-muted-foreground">{updatedAt}</span>}
        </div>
      );
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

export { roles, statuses };

