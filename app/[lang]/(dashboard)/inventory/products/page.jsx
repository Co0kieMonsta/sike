import { getProducts } from "@/config/inventory.config";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventario de Refacciones",
};

export default async function ProductsPage() {
  const response = await getProducts();
  const products = response.status === "success" ? response.data : [];

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Refacciones y Productos</h1>
        <Link href="/inventory/products/crear">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Refacción
          </Button>
        </Link>
      </div>
      
      <div className="bg-background rounded-md border p-4">
          <DataTable data={products} columns={columns} />
      </div>
    </div>
  );
}
