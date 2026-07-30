"use client";

import { useEffect, useState } from "react";
import { getProductUsageHistory } from "@/config/inventory.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ExternalLink, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProductHistoryTab = ({ productId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await getProductUsageHistory(productId);
        if (response.status === "success") {
          setHistory(response.data);
        } else {
          toast.error("Error al cargar historial");
        }
      } catch (error) {
        toast.error("Error al cargar historial");
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Uso</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Cargando historial...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Esta pieza aún no ha sido utilizada en ningún proyecto.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo de Movimiento</TableHead>
                <TableHead>Detalle / Referencia</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.date ? new Date(item.date).toLocaleDateString() : "Desconocida"}
                  </TableCell>
                  <TableCell>
                    {item.type === "project_usage" && (
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Uso en Proyecto</Badge>
                    )}
                    {item.type === "restock" && (
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Reposición / Compra</Badge>
                    )}
                    {item.type === "manual_deduction" && (
                      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Deducción Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.type === "project_usage" ? (
                      <div className="flex items-center gap-2 font-medium">
                        <Hammer className="h-4 w-4 text-muted-foreground" />
                        ID Proyecto: {item.projectId.slice(0, 8)}...
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Stock ajustado: {item.oldStock} ➔ {item.newStock}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${item.type === 'restock' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'restock' ? '+' : '-'}{item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.type === "project_usage" && (
                      <Link href={`/en/projects/${item.projectId}`} className="text-blue-500 hover:underline flex items-center justify-end gap-1 text-sm">
                        Ver Proyecto <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductHistoryTab;
