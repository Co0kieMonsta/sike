import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Car, DollarSign, Wallet, CheckCircle } from "lucide-react";

export function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vehículos Activos</p>
            <h3 className="text-2xl font-bold">{stats.activeVehicles || 0}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trabajos Finalizados</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.completedProjects || 0}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ingresos (Mes)</p>
            <h3 className="text-2xl font-bold text-green-600">
              ${stats.monthlyIncome?.toFixed(2) || "0.00"}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <Wallet className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Egresos (Mes)</p>
            <h3 className="text-2xl font-bold text-red-600">
              ${stats.monthlyExpenses?.toFixed(2) || "0.00"}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
