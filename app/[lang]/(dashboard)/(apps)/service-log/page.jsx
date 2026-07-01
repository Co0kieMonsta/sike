import { getServiceOrders } from "@/action/services";
import { ServiceOrdersTable } from "./components/service-orders-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ServiceLogPage() {
  const orders = await getServiceOrders();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Service Log</h2>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
            <ServiceOrdersTable initialOrders={orders || []} />
        </CardContent>
      </Card>
    </div>
  );
}
