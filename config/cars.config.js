import { api } from "@/config/axios.config";

export const getCars = async () => {
    try {
        const response = await api.get("/cars");
        return {
            status: "success",
            data: response.data.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const createCar = async (data) => {
    try {
        const response = await api.post("/cars", data);
        return {
            status: "success",
            data: response.data.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const getCarById = async (id) => {
    try {
        const response = await api.get(`/cars/${id}`);
        return {
            status: "success",
            data: response.data.data,
        };
    } catch (error) {
        return {
            status: "error",
            message: error.response?.data || error.message,
        };
    }
};

export const updateCar = async (id, data) => {
    try {
        const response = await api.put(`/cars/${id}`, data);
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

export const deleteCar = async (id) => {
    try {
        const response = await api.delete(`/cars/${id}`);
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
