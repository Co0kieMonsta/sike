import { getSales } from "@/action/sales";
import { SalesTable } from "./components/sales-table";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await getSales();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales History</h1>
      </div>
      
      <div className="bg-card rounded-md border">
        <SalesTable data={sales || []} />
      </div>
    </div>
  );
}
