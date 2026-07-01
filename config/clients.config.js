import { api } from "@/config/axios.config";

// Get all clients
export const getClients = async () => {
  try {
    const response = await api.get("/clients");
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener clientes",
    };
  }
};

// Get single client by ID
export const getClient = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener cliente",
    };
  }
};

// Create new client
export const createClient = async (data) => {
  try {
    const response = await api.post("/clients", data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al crear cliente",
    };
  }
};

// Update client
export const updateClient = async (id, data) => {
  try {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al actualizar cliente",
    };
  }
};

// Delete client
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al eliminar cliente",
    };
  }
};
