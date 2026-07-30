import { api } from "@/config/axios.config";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// --- Categories ---
export const getCategories = async () => {
    try {
        const response = await api.get("/inventory/categories");
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const createCategory = async (data) => {
    try {
        const response = await api.post("/inventory/categories", data);
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const updateCategory = async (id, data) => {
    try {
        const response = await api.put(`/inventory/categories/${id}`, data);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/inventory/categories/${id}`);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

// --- Products ---
export const getProducts = async () => {
    try {
        const response = await api.get("/inventory/products");
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const getProductById = async (id) => {
    try {
        const response = await api.get(`/inventory/products/${id}`);
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const createProduct = async (data) => {
    try {
        const response = await api.post("/inventory/products", data);
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const updateProduct = async (id, data) => {
    try {
        const response = await api.put(`/inventory/products/${id}`, data);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/inventory/products/${id}`);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

// --- History ---
export const getProductUsageHistory = async (productId) => {
    try {
        // Fetch usages in projects
        const qParts = query(collection(db, "project_parts"), where("productId", "==", productId));
        const partsSnap = await getDocs(qParts);
        
        // Fetch manual restocks / adjustments
        const qMovements = query(collection(db, "inventory_movements"), where("productId", "==", productId));
        const movementsSnap = await getDocs(qMovements);
        
        const history = [];
        
        for (const document of partsSnap.docs) {
            const data = document.data();
            history.push({ 
                id: document.id, 
                type: "project_usage",
                date: data.addedAt,
                quantity: data.quantity,
                projectId: data.projectId,
                price: data.price
            });
        }
        
        for (const document of movementsSnap.docs) {
            const data = document.data();
            history.push({ 
                id: document.id, 
                type: data.type, // 'restock' or 'manual_deduction'
                date: data.addedAt,
                quantity: data.quantity,
                oldStock: data.oldStock,
                newStock: data.newStock
            });
        }
        
        // Sort descending by date
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return { status: "success", data: history };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

// --- Assets ---
export const getAssets = async () => {
    try {
        const response = await api.get("/inventory/assets");
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const createAsset = async (data) => {
    try {
        const response = await api.post("/inventory/assets", data);
        return { status: "success", data: response.data.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const updateAsset = async (id, data) => {
    try {
        const response = await api.put(`/inventory/assets/${id}`, data);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};

export const deleteAsset = async (id) => {
    try {
        const response = await api.delete(`/inventory/assets/${id}`);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: error.response?.data || error.message };
    }
};
