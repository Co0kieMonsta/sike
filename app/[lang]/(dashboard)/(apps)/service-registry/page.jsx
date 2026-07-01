import { getServices, getCategories } from "@/action/services";
import { ServiceRegistryMain } from "./components/service-registry-main";

export default async function ServiceRegistryPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories()
  ]);

  return (
    <div className="h-[calc(100vh-80px)] p-4 flex gap-4 overflow-hidden">
      <ServiceRegistryMain initialServices={services || []} initialCategories={categories || []} />
    </div>
  );
}
