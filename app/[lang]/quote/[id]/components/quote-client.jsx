"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Car, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateCotizacion } from "@/config/cotizaciones.config";

export function QuoteClient({ quote }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(quote.estado);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAction = async (newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cotizaciones/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...quote, estado: newStatus }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setStatus(newStatus);
        toast.success(newStatus === "aprobada" ? "¡Cotización aprobada!" : "Cotización rechazada");
      } else {
        toast.error("Error al actualizar la cotización");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "aprobada") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
        <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
          <Check className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-default-900">¡Cotización Aprobada!</h1>
        <p className="text-default-500 max-w-md">
          Gracias por confiar en nosotros. El equipo ya fue notificado y comenzaremos a trabajar en tu vehículo lo antes posible.
        </p>
      </div>
    );
  }

  if (status === "rechazada") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
        <div className="w-24 h-24 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mb-4">
          <X className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-default-900">Cotización Rechazada</h1>
        <p className="text-default-500 max-w-md">
          Hemos recibido tu respuesta. Si tienes alguna duda o quieres ajustar los servicios, por favor contáctanos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Car className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-default-900">Autorización de Servicio</h1>
        <p className="text-default-500">Cotización #{quote.numero}</p>
      </div>

      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
              <p className="text-lg font-bold">{quote.vehiculo || "No especificado"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="font-semibold">{new Date(quote.fecha).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {quote.detalles_cotizacion?.map((item, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-default-900">{item.descripcion}</p>
                  <p className="text-sm text-muted-foreground">Cant: {item.cantidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(item.precio_unitario * item.cantidad)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-primary/5 p-6 border-t flex justify-between items-center">
            <span className="text-lg font-bold text-default-900">Total a Pagar</span>
            <span className="text-2xl font-black text-primary">{formatCurrency(quote.total)}</span>
          </div>

          {quote.notas && (
            <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/20 text-yellow-800 dark:text-yellow-200 text-sm">
              <span className="font-bold block mb-1">Notas del taller:</span>
              {quote.notas}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center bg-muted/50 p-3 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-primary" /> Garantía de Servicio
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center bg-muted/50 p-3 rounded-lg">
          <Clock className="w-4 h-4 text-primary" /> Rápida Ejecución
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 sticky bottom-4">
        <Button 
          size="lg" 
          className="w-full text-lg h-14 shadow-xl shadow-primary/25"
          onClick={() => handleAction("aprobada")}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
          Autorizar Trabajo
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => handleAction("rechazada")}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
          Rechazar / Solicitar Cambios
        </Button>
      </div>

    </div>
  );
}
