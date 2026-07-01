import { api } from "@/config/axios.config";

// Get all usuarios
export const getUsuarios = async () => {
  try {
    const response = await api.get("/usuarios");
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener usuarios",
    };
  }
};

// Get single usuario by ID
export const getUsuario = async (id) => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener usuario",
    };
  }
};

// Create new usuario
export const createUsuario = async (data) => {
  try {
    const response = await api.post("/usuarios", data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al crear usuario",
    };
  }
};

// Update usuario
export const updateUsuario = async (id, data) => {
  try {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al actualizar usuario",
    };
  }
};

// Delete usuario
export const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al eliminar usuario",
    };
  }
};

