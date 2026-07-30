"use client";

import React, { useEffect, useState } from "react";
import { getEntityHistory } from "@/config/audit.config";
import { Loader2, History, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const HistoryTimeline = ({ entityId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      const response = await getEntityHistory(entityId);
      if (response.status === "success") {
        setLogs(response.data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [entityId]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <History className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">No hay historial registrado para este elemento.</p>
      </div>
    );
  }

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "UPDATE": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "DELETE": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "CREATE": return "Creación";
      case "UPDATE": return "Actualización";
      case "DELETE": return "Eliminación";
      default: return "Acción desconocida";
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-border ml-3 mt-4">
        {logs.map((log, index) => (
          <div key={log.id} className="mb-8 ml-6 relative">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-background rounded-full -left-[35px] ring-4 ring-background border border-border">
              <User className="w-3 h-3 text-muted-foreground" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                  {getActionLabel(log.action)}
                </span>
                <span className="text-sm font-semibold text-foreground">{log.userEmail}</span>
              </div>
              <time className="text-xs text-muted-foreground mt-1 sm:mt-0">
                {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
              </time>
            </div>
            
            {log.changes && log.changes.length > 0 ? (
              <div className="mt-3 bg-muted/50 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/80 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium">Campo</th>
                      <th className="px-4 py-2 font-medium">Valor Anterior</th>
                      <th className="px-4 py-2 font-medium">Valor Nuevo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {log.changes.map((change, i) => (
                      <tr key={i} className="hover:bg-muted/80 transition-colors">
                        <td className="px-4 py-2 font-medium text-foreground">{change.field}</td>
                        <td className="px-4 py-2 text-muted-foreground line-through">
                          {change.old !== null && change.old !== undefined ? String(change.old) : "-"}
                        </td>
                        <td className="px-4 py-2 text-primary font-medium">
                          {change.new !== null && change.new !== undefined ? String(change.new) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">
                No hubo cambios detallados.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
