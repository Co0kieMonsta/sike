import { api } from "@/config/axios.config";

export const getServices = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/services`);
    return response.data;
  } catch (error) {
     return {
      status: "fail",
      message: error.response?.data?.message || "Error fetching services",
    };
  }
};

export const createService = async (data) => {
  try {
    const response = await api.post("/services", data);
    return response.data;
  } catch (error) {
     return {
      status: "fail",
      message: error.response?.data?.message || "Error creating service",
    };
  }
};

export const updateService = async (id, data) => {
  try {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  } catch (error) {
     return {
      status: "fail",
      message: error.response?.data?.message || "Error updating service",
    };
  }
};

export const deleteService = async (id) => {
  try {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  } catch (error) {
     return {
      status: "fail",
      message: error.response?.data?.message || "Error deleting service",
    };
  }
};
