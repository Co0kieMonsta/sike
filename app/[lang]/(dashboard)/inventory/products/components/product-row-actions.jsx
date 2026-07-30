"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/config/inventory.config";
import { toast } from "react-hot-toast";

export function ProductRowActions({ row }) {
  const router = useRouter();
  const product = row.original;

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar el producto ${product.name}?`)) {
      try {
        const response = await deleteProduct(product.id);
        if (response.status === "success") {
          toast.success("Producto eliminado");
          router.refresh();
        } else {
          toast.error("Error al eliminar");
        }
      } catch (error) {
        toast.error("Error al eliminar");
        console.error(error);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => router.push(`/inventory/products/${product.id}`)}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/inventory/products/history/${product.id}`)}>
          Ver Historial
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
