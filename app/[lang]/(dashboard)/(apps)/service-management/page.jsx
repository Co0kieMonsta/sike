import { getServices, getCategories } from "@/action/services";
import { ServiceManagementMain } from "./components/service-management-main";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ServiceManagementPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories()
  ]);

  return (
    
    <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Service Management</CardTitle>
            </CardHeader>
            <CardContent>
                <ServiceManagementMain initialServices={services || []} initialCategories={categories || []} />
            </CardContent>
          </Card>
        </div>
  );
}
