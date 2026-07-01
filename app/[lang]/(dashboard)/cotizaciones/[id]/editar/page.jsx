
"use client";

import { useState, useEffect } from "react";
import { CotizacionForm } from "../../components/cotizacion-form";
import { getCotizacionById } from "@/config/cotizaciones.config";
import { toast } from "react-hot-toast";

import { useParams } from "next/navigation";

export default function EditarCotizacionPage() {
  const params = useParams();
  const { id } = params;
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const response = await getCotizacionById(id);
        if (response.status === "success") {
          setCotizacion(response.data);
        } else {
          toast.error(response.message || "Error not fetching quote");
        }
      } catch (error) {
        toast.error("Error loading quote");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCotizacion();
    }
  }, [id]);

  if (loading) {
     return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Cargando cotización...</p>
            </div>
        </div>
    );
  }

  if (!cotizacion) {
    return <div>Cotización no encontrada</div>;
  }

  return <CotizacionForm initialData={cotizacion} />;
}
