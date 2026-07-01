import { getInventoryCategories } from "@/action/inventory";
export const dynamic = "force-dynamic";

import CategoryList from "@/components/inventory/category-list";

export default async function CategoriesPage() {
  const categories = await getInventoryCategories();

  return (
    <div className="p-6">
      <CategoryList categories={categories || []} />
    </div>
  );
}
