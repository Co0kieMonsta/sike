
import { api } from "@/config/axios.config";

export const getCotizaciones = async () => {
    try {
        const response = await api.get("/cotizaciones");
        return {
            status: "success",
            data: response.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const createCotizacion = async (data) => {
    try {
        const response = await api.post("/cotizaciones", data);
        return {
            status: "success",
            data: response.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const getCotizacionById = async (id) => {
    try {
        const response = await api.get(`/cotizaciones/${id}`);
        return {
            status: "success",
            data: response.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const updateCotizacion = async (id, data) => {
    try {
        const response = await api.put(`/cotizaciones/${id}`, data);
        return {
            status: "success",
            data: response.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const deleteCotizacion = async (id) => {
    try {
        const response = await api.delete(`/cotizaciones/${id}`);
        return {
            status: "success",
            data: response.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};
