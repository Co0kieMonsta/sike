"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/config/inventory.config";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      if (response.status === "success") {
        setProducts(response.data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
