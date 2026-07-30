import { ProductForm } from "../components/product-form";

export const metadata = {
  title: "Registrar Refacción",
};

export default function CrearProductPage() {
  return (
    <div className="p-6">
      <ProductForm />
    </div>
  );
}
