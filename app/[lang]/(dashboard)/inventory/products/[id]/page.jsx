import { ProductForm } from "../components/product-form";
import { getProductById } from "@/config/inventory.config";
import HistoryTimeline from "@/components/history-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Editar Producto",
};

export default async function EditarProductPage({ params }) {
  const { id } = await params;
  const response = await getProductById(id);
  const product = response.status === "success" ? response.data : null;

  if (!product) {
    return <div className="p-6 text-destructive">Error: Producto no encontrado</div>;
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="detalles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="detalles">Detalles del Producto</TabsTrigger>
          <TabsTrigger value="historial">Historial de Cambios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detalles">
          <ProductForm initialData={product} />
        </TabsContent>
        
        <TabsContent value="historial">
          <Card>
            <CardContent className="pt-6">
              <HistoryTimeline entityId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
