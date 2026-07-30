"use client";

import React, { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProjectsStatusChart } from "@/components/dashboard/projects-status-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopMechanics } from "@/components/dashboard/top-mechanics";
import { getProjects } from "@/config/projects.config";
import { getTransacciones } from "@/config/finanzas.config";
import { Loader2 } from "lucide-react";
import DatePickerWithRange from "@/components/date-picker-with-range";

const DashboardPageView = ({ trans }) => {
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [mechanicsData, setMechanicsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [projectsRes, transRes] = await Promise.all([
          getProjects(),
          getTransacciones()
        ]);

        const projects = projectsRes.status === "success" ? projectsRes.data : [];
        const transactions = transRes.status === "success" ? transRes.data : [];

        // 1. Process Stats
        const activeVehicles = projects.filter(p => p.status !== "Finalizado" && p.status !== "Cancelado").length;
        const completedProjects = projects.filter(p => p.status === "Finalizado").length;

        // Determine current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyIncome = transactions
          .filter(t => {
            const d = new Date(t.fecha);
            return t.tipo === "ingreso" && t.estado === "completado" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + Number(t.monto), 0);

        const monthlyExpenses = transactions
          .filter(t => {
            const d = new Date(t.fecha);
            return t.tipo === "egreso" && t.estado === "completado" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + Number(t.monto), 0);

        setStats({
          activeVehicles,
          completedProjects,
          monthlyIncome,
          monthlyExpenses
        });

        // 2. Process Projects Status Chart
        const statuses = {};
        projects.forEach(p => {
          const s = p.status || "Pendiente";
          statuses[s] = (statuses[s] || 0) + 1;
        });
        
        const mappedStatus = Object.keys(statuses).map(key => ({
          name: key,
          value: statuses[key]
        }));
        setStatusData(mappedStatus);

        // 3. Process Revenue Chart (Last 7 Days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateString = d.toISOString().split('T')[0];
          
          const dayIngresos = transactions
            .filter(t => t.tipo === "ingreso" && t.estado === "completado" && t.fecha.startsWith(dateString))
            .reduce((sum, t) => sum + Number(t.monto), 0);
            
          const dayEgresos = transactions
            .filter(t => t.tipo === "egreso" && t.estado === "completado" && t.fecha.startsWith(dateString))
            .reduce((sum, t) => sum + Number(t.monto), 0);

          last7Days.push({
            name: d.toLocaleDateString('es-ES', { weekday: 'short' }),
            ingresos: dayIngresos,
            egresos: dayEgresos
          });
        }
        setRevenueData(last7Days);

        // 4. Process Top Mechanics
        const mechs = {};
        projects.forEach(p => {
          if (p.mechanic && p.status === "Finalizado") {
            const mId = p.mechanic.id;
            if (!mechs[mId]) {
              mechs[mId] = {
                ...p.mechanic,
                completedCount: 0,
                totalCommission: 0
              };
            }
            mechs[mId].completedCount += 1;
            mechs[mId].totalCommission += Number(p.mechanicCommission || 0);
          }
        });

        const sortedMechs = Object.values(mechs).sort((a, b) => b.completedCount - a.completedCount);
        setMechanicsData(sortedMechs);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Sike Auto Analytics
        </div>
        <DatePickerWithRange />
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart revenueData={revenueData} />
        </div>
        <div>
          <ProjectsStatusChart statusData={statusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopMechanics mechanicsData={mechanicsData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPageView;
