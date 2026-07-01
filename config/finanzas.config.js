import { api } from "@/config/axios.config";

// ============ TRANSACTIONS ============

export const getTransacciones = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/finanzas/transacciones?${params}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener transacciones",
    };
  }
};

export const getTransaccion = async (id) => {
  try {
    const response = await api.get(`/finanzas/transacciones/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener transacción",
    };
  }
};

export const createTransaccion = async (data) => {
  try {
    const response = await api.post("/finanzas/transacciones", data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al crear transacción",
    };
  }
};

export const updateTransaccion = async (id, data) => {
  try {
    const response = await api.put(`/finanzas/transacciones/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al actualizar transacción",
    };
  }
};

export const deleteTransaccion = async (id) => {
  try {
    const response = await api.delete(`/finanzas/transacciones/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al eliminar transacción",
    };
  }
};

// ============ ACCOUNTS ============

export const getCuentas = async () => {
  try {
    const response = await api.get("/finanzas/cuentas");
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener cuentas",
    };
  }
};

export const getCuenta = async (id) => {
  try {
    const response = await api.get(`/finanzas/cuentas/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener cuenta",
    };
  }
};

export const createCuenta = async (data) => {
  try {
    const response = await api.post("/finanzas/cuentas", data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al crear cuenta",
    };
  }
};

export const updateCuenta = async (id, data) => {
  try {
    const response = await api.put(`/finanzas/cuentas/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al actualizar cuenta",
    };
  }
};

export const deleteCuenta = async (id) => {
  try {
    const response = await api.delete(`/finanzas/cuentas/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al eliminar cuenta",
    };
  }
};

// ============ CATEGORIES ============

export const getCategorias = async (tipo = null) => {
  try {
    const params = tipo ? `?tipo=${tipo}` : "";
    const response = await api.get(`/finanzas/categorias${params}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener categorías",
    };
  }
};

export const getCategoria = async (id) => {
  try {
    const response = await api.get(`/finanzas/categorias/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al obtener categoría",
    };
  }
};

export const createCategoria = async (data) => {
  try {
    const response = await api.post("/finanzas/categorias", data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al crear categoría",
    };
  }
};

export const updateCategoria = async (id, data) => {
  try {
    const response = await api.put(`/finanzas/categorias/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al actualizar categoría",
    };
  }
};

export const deleteCategoria = async (id) => {
  try {
    const response = await api.delete(`/finanzas/categorias/${id}`);
    return response.data;
  } catch (error) {
    return {
      status: "fail",
      message: error.response?.data?.message || "Error al eliminar categoría",
    };
  }
};

