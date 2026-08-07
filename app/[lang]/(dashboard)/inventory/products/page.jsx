"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/config/inventory.config";
import { deleteProduct } from "@/config/inventory.config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Trash2, History } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.status === "success") {
        setProducts(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (confirm(`¿Estás seguro de eliminar el producto ${name}?`)) {
      try {
        const response = await deleteProduct(id);
        if (response.status === "success") {
          toast.success("Producto eliminado");
          fetchProducts();
        } else {
          toast.error("Error al eliminar");
        }
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const filteredProducts = products.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
        <CardHeader>
          <div className="flex items-center py-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-md border-0 sm:border bg-background overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU/PN</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.imageUrl ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden border">
                            <img src={p.imageUrl} alt="product" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            -
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">{p.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">{p.sku || "-"}</div>
                      </TableCell>
                      <TableCell>{p.categoryName || "-"}</TableCell>
                      <TableCell>{p.brand || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="soft" color={p.stock > 0 ? "success" : "destructive"}>
                          {p.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/inventory/products/${p.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Link href={`/inventory/products/history/${p.id}`}>
                            <Button variant="ghost" size="icon" title="Historial">
                              <History className="h-4 w-4 text-gray-600" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)} title="Eliminar">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
