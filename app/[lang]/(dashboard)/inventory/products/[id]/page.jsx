import { ProductForm } from "../components/product-form";
import { getProductById } from "@/config/inventory.config";

export const metadata = {
  title: "Editar Refacción",
};

export default async function EditarProductPage({ params }) {
  const { id } = await params;
  const response = await getProductById(id);
  const product = response.status === "success" ? response.data : null;

  if (!product) {
    return <div className="p-6 text-destructive">Error: Refacción no encontrada</div>;
  }

  return (
    <div className="p-6">
      <ProductForm initialData={product} />
    </div>
  );
}
