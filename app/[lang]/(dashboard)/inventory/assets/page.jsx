import { getAssets, getCategories } from "@/config/inventory.config";
export const dynamic = "force-dynamic";

import { AssetsPageClient } from "./components/assets-page-client";

export default async function AssetsPage() {
  const assetsRes = await getAssets();
  const categoriesRes = await getCategories();

  const assets = assetsRes?.status === "success" ? assetsRes.data : [];
  const categories = categoriesRes?.status === "success" ? categoriesRes.data : [];

  return (
    <div className="p-6">
      <AssetsPageClient initialAssets={assets} categories={categories} />
    </div>
  );
}
