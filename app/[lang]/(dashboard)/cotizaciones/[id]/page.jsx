
"use client";

import { useState, useEffect } from "react";
import { getCotizacionById } from "@/config/cotizaciones.config";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function VerCotizacionPage() {
  const params = useParams();
  const { id } = params;
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const response = await getCotizacionById(id);
        if (response.status === "success") {
          setCotizacion(response.data);
          
          // Auto print if query param is set
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('print') === 'true') {
            setTimeout(() => window.print(), 500);
          }
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCotizacion();
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('cotizacion-content');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true, // For images if any
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Cotizacion-${cotizacion.numero}.pdf`);
        toast.success("PDF descargado correctamente");
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Error al generar PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center h-screen">
           <div className="text-center">
               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
           </div>
       </div>
   );
 }

  if (!cotizacion) {
    return <div className="p-8 text-center">Cotización no encontrada</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Actions Bar (Hidden on Print) */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
            </Button>
        </div>
      </div>

      {/* Invoice/Quote Container */}
      <Card className="print:shadow-none print:border-none" id="cotizacion-content">
        <CardContent className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-primary">COTIZACIÓN</h1>
                    <p className="text-muted-foreground mt-1">#{cotizacion.numero}</p>
                    <div className="mt-4">
                        <Badge variant={cotizacion.estado === 'aceptada' ? 'success' : 'outline'}>
                            {cotizacion.estado?.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">Mi Empresa S.A.</h2>
                    <p className="text-sm text-muted-foreground">Calle Falsa 123</p>
                    <p className="text-sm text-muted-foreground">Ciudad, País</p>
                    <p className="text-sm text-muted-foreground">contacto@miempresa.com</p>
                </div>
            </div>

            {/* Dates & Client */}
            <div className="grid grid-cols-2 gap-8 border-t border-b py-8">
                <div>
                    <h3 className="font-semibold text-gray-500 mb-2 uppercase text-sm">Facturar a:</h3>
                    <p className="font-bold text-lg">{cotizacion.cliente_nombre}</p>
                    <p className="text-muted-foreground">{cotizacion.cliente_direccion}</p>
                    <p className="text-muted-foreground">{cotizacion.cliente_email}</p>
                </div>
                <div className="text-right">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Fecha de Emisión:</span>
                            <span className="font-medium">{new Date(cotizacion.fecha).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Vencimiento:</span>
                            <span className="font-medium">
                                {cotizacion.fecha_vencimiento 
                                    ? new Date(cotizacion.fecha_vencimiento).toLocaleDateString() 
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-primary">
                            <th className="text-left py-3 font-bold">Descripción</th>
                            <th className="text-center py-3 font-bold w-24">Cant.</th>
                            <th className="text-right py-3 font-bold w-32">Precio Unit.</th>
                            <th className="text-right py-3 font-bold w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {cotizacion.detalles_cotizacion?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4">{item.descripcion}</td>
                                <td className="py-4 text-center">{item.cantidad}</td>
                                <td className="py-4 text-right">
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.precio_unitario)}
                                </td>
                                <td className="py-4 text-right font-medium">
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.cantidad * item.precio_unitario)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end border-t pt-8">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cotizacion.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {cotizacion.notas && (
                <div className="border-t pt-8">
                    <h3 className="font-semibold mb-2">Notas:</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cotizacion.notas}</p>
                </div>
            )}
            
            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground border-t pt-8 mt-12 print:mt-auto">
                <p>Gracias por su preferencia.</p>
            </div>
        </CardContent>
      </Card>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
            body { background: white; }
            nav, aside, footer { display: none !important; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
}
