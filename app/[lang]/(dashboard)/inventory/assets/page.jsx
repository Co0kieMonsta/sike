import { getInventoryAssets, getInventoryCategories } from "@/action/inventory";
export const dynamic = "force-dynamic";

import AssetList from "@/components/inventory/asset-list";

export default async function AssetsPage() {
  const assets = await getInventoryAssets();
  const categories = await getInventoryCategories();

  return (
    <div className="p-6">
      <AssetList assets={assets || []} categories={categories || []} />
    </div>
  );
}
