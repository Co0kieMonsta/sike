"use client";

import React, { useEffect, useState } from "react";
import { getProjects } from "@/config/projects.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wrench, CheckCircle } from "lucide-react";

export default function ComisionesPage() {
  const [mechanicsData, setMechanicsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      setLoading(true);
      try {
        const res = await getProjects();
        if (res.status === "success") {
          const projects = res.data || [];
          
          // Group by mechanic
          const grouped = {};

          projects.forEach(p => {
            if (p.mechanic && p.mechanicCommission) {
              const mechId = p.mechanic.id;
              if (!grouped[mechId]) {
                grouped[mechId] = {
                  mechanic: p.mechanic,
                  totalOwed: 0,
                  totalPaid: 0,
                  projects: []
                };
              }

              const comm = parseFloat(p.mechanicCommission);
              
              // We assume commission is owed if project is "Finalizado" or similar
              // For now, let's just show all assigned commissions
              grouped[mechId].totalOwed += comm;
              grouped[mechId].projects.push({
                id: p.id,
                carName: p.carName,
                status: p.status,
                commission: comm
              });
            }
          });

          setMechanicsData(grouped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comisiones a Mecánicos</h1>
        <p className="text-muted-foreground">Reporte de comisiones fijas asignadas por proyecto.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : Object.keys(mechanicsData).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No hay comisiones registradas en ningún proyecto activo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.values(mechanicsData).map((data) => (
            <Card key={data.mechanic.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{data.mechanic.name}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Acumulado</p>
                  <p className="text-2xl font-bold text-primary">${data.totalOwed.toFixed(2)}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto (Vehículo)</TableHead>
                      <TableHead>Estado del Proyecto</TableHead>
                      <TableHead className="text-right">Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.projects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.carName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ${p.commission.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
