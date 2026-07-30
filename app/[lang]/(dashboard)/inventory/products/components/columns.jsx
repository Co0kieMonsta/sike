"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../../users/components/data-table-column-header";
import { ProductRowActions } from "./product-row-actions";

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
          <img src={url} alt="product" className="w-full h-full object-cover" />
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Producto" />,
    cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU/PN" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("sku") || "-"}</div>,
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => <div>{row.getValue("categoryName") || "-"}</div>,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Marca" />,
    cell: ({ row }) => <div>{row.getValue("brand") || "-"}</div>,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
        const stock = row.getValue("stock");
        return (
            <Badge variant="soft" color={stock > 0 ? "success" : "destructive"}>
                {stock}
            </Badge>
        );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions row={row} />,
  },
];
