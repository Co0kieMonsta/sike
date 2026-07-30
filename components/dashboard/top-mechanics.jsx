import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wrench } from "lucide-react";

export function TopMechanics({ mechanicsData }) {
  if (!mechanicsData || mechanicsData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Mecánicos Destacados</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          Aún no hay mecánicos con proyectos finalizados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Rendimiento por Técnico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mechanicsData.slice(0, 5).map((mech, i) => (
            <div key={mech.id || i} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={mech.image?.src || mech.image} alt={mech.name} />
                <AvatarFallback>{mech.name?.substring(0, 2) || <Wrench className="w-4 h-4" />}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{mech.name}</p>
                <p className="text-xs text-muted-foreground">
                  {mech.completedCount} reparaciones
                </p>
              </div>
              <div className="ml-auto font-medium text-green-600">
                +${mech.totalCommission?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
