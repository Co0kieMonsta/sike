import { getInventoryProducts, getInventoryCategories } from "@/action/inventory";
export const dynamic = "force-dynamic";

import ProductList from "@/components/inventory/product-list";

export default async function ProductsPage() {
  const products = await getInventoryProducts();
  const categories = await getInventoryCategories();

  return (
    <div className="p-6">
      <ProductList products={products || []} categories={categories || []} />
    </div>
  );
}
