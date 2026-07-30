"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransacciones } from "@/config/finanzas.config";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ProjectOverviewTab = ({ project }) => {
  const [summary, setSummary] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      setLoading(true);
      try {
        const response = await getTransacciones({ proyecto_id: project.id });
        if (response.status === "success") {
          setSummary(response.summary || { ingresos: 0, egresos: 0, balance: 0 });
        }
      } catch (error) {
        console.error("Error fetching finances for project", error);
      } finally {
        setLoading(false);
      }
    };
    if (project?.id) {
      fetchFinances();
    }
  }, [project?.id]);

  const budget = parseFloat(project?.budget) || 0;
  const spent = summary.egresos || 0;
  const earned = summary.ingresos || 0;
  const budgetUsage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastado (Egresos)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            {budget > 0 && (
              <div className="mt-2">
                <Progress value={budgetUsage} className="h-2" color={budgetUsage > 100 ? "destructive" : "primary"} />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {budgetUsage.toFixed(1)}% del presupuesto
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${earned.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia / Pérdida</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${earned - spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(earned - spent).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold text-sm text-muted-foreground">Descripción:</span>
            <p className="mt-1">{project?.description || "Sin descripción"}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-semibold text-sm text-muted-foreground">Estado:</span>
              <p className="capitalize mt-1">{project?.status}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-muted-foreground">Fecha Inicio:</span>
              <p className="mt-1">{new Date(project?.startDate).toLocaleDateString()}</p>
            </div>
            {project?.carName && (
              <div className="md:col-span-2">
                <span className="font-semibold text-sm text-muted-foreground">Vehículo Asociado:</span>
                <p className="mt-1">{project?.carName}</p>
              </div>
            )}
            {project?.endDate && (
              <div>
                <span className="font-semibold text-sm text-muted-foreground">Fecha Fin:</span>
                <p className="mt-1">{new Date(project?.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverviewTab;
