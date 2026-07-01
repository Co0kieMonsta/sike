"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/app/[lang]/(dashboard)/users/components/data-table-column-header";

const carColors = [
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Black", value: "Black", hex: "#000000" },
  { label: "Silver", value: "Silver", hex: "#C0C0C0" },
  { label: "Gray", value: "Gray", hex: "#808080" },
  { label: "Red", value: "Red", hex: "#FF0000" },
  { label: "Blue", value: "Blue", hex: "#0000FF" },
  { label: "Brown", value: "Brown", hex: "#A52A2A" },
  { label: "Green", value: "Green", hex: "#008000" },
  { label: "Beige", value: "Beige", hex: "#F5F5DC" },
  { label: "Orange", value: "Orange", hex: "#FFA500" },
  { label: "Gold", value: "Gold", hex: "#FFD700" },
  { label: "Yellow", value: "Yellow", hex: "#FFFF00" },
  { label: "Purple", value: "Purple", hex: "#800080" },
  { label: "Other", value: "Other", hex: "transparent" },
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <span className="hidden md:block">Phone</span>,
    cell: ({ row }) => <div className="text-sm hidden md:block">{row.getValue("phone")}</div>,
  },
  {
    id: "car_details",
    accessorFn: (row) => `${row.car_brand} ${row.car_model} ${row.car_plate} ${row.car_color}`,
    header: "Car Details",
    cell: ({ row }) => {
      const brand = row.original.car_brand;
      const model = row.original.car_model;
      const plate = row.original.car_plate;
      const colorName = row.original.car_color;
      const colorData = carColors.find(c => c.value === colorName) || { hex: "transparent" };
      
      if (!brand && !model && !plate) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="flex flex-col text-sm gap-1">
          <span className="font-medium">{brand} {model}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
             <span>{plate}</span>
             {colorName && (
                <div className="flex items-center gap-1 border-l pl-2 border-default-300">
                    <div 
                        className="h-3 w-3 rounded-full border border-default-300" 
                        style={{ backgroundColor: colorData.hex }}
                    />
                    <span>{colorName}</span>
                </div>
             )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="hidden md:block">Status</span>,
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div className="hidden md:block">
          <Badge variant={status === "active" ? "success" : "secondary"}>
            {status}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => null, // Will be overridden in the page component
  },
];
