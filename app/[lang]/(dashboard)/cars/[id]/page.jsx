"use client";

import { useEffect, useState, use } from "react";
import { getCarById } from "@/config/cars.config";
import { CarForm } from "../components/car-form";
import { toast } from "react-hot-toast";

const EditCarPage = ({ params }) => {
    const { id } = use(params);
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCar = async () => {
            setLoading(true);
            try {
                const response = await getCarById(id);
                if (response.status === "success") {
                    setCar(response.data);
                } else {
                    toast.error(response.message || "Error al cargar vehículo");
                }
            } catch (error) {
                toast.error("Error al cargar vehículo");
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-muted-foreground">Cargando vehículo...</p>
                </div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground text-lg">Vehículo no encontrado</p>
            </div>
        );
    }

    return <CarForm initialData={car} />;
};

export default EditCarPage;
