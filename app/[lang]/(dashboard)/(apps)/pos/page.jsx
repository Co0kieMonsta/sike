import { getInventoryProducts, getInventoryCategories } from "@/action/inventory";
import { POSMain } from "./components/pos-main";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  let products = [];
  let categories = [];
  try {
    products = await getInventoryProducts();
    categories = await getInventoryCategories();
    console.log("POSPage Debug - Products:", products?.length, "Categories:", categories?.length);
  } catch (error) {
    console.error("POSPage Data Fetch Error:", error);
  }

  return (
    <div className="h-[calc(100vh-80px)] p-4 flex gap-4 overflow-hidden">
      <POSMain 
        initialProducts={products || []} 
        categories={categories || []} 
      />
    </div>
  );
}
