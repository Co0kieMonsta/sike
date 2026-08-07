import { getProductById } from "@/config/inventory.config";
import ProductHistoryTab from "../../components/product-history-tab";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Historial de Productos",
};

export default async function ProductHistoryPage({ params }) {
  const { id } = await params;
  const response = await getProductById(id);
  const product = response.status === "success" ? response.data : null;

  if (!product) {
    return <div className="text-destructive">Error: Producto no encontrado</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historial: {product.name}</h2>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
      </div>

      <ProductHistoryTab productId={product.id} />
    </div>
  );
}
