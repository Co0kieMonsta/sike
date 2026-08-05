"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/config/inventory.config";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
      <Card className="mb-5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Package className="h-8 w-8 text-primary" />
                Productos y Repuestos
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Administra el inventario de repuestos y productos.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link href="/inventory/products/crear" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Producto
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-md border-0 sm:border bg-background">
            <DataTable data={products} columns={columns} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
