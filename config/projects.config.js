import { api } from "@/config/axios.config";

export const getProjects = async () => {
    try {
        const response = await api.get("/projects");
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

export const createProject = async (data) => {
    try {
        const response = await api.post("/projects", data);
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

export const getProjectById = async (id) => {
    try {
        const response = await api.get(`/projects/${id}`);
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

export const updateProject = async (id, data) => {
    try {
        const response = await api.put(`/projects/${id}`, data);
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

export const deleteProject = async (id) => {
    try {
        const response = await api.delete(`/projects/${id}`);
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

import { db, storage } from "@/lib/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";

// ============ PROJECT TASKS (KANBAN) ============
export const getProjectTasks = async (projectId) => {
    try {
        const q = query(collection(db, "project_tasks"), where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { status: "success", data: tasks };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const createProjectTask = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "project_tasks"), {
            ...data,
            createdAt: new Date().toISOString()
        });
        return { status: "success", data: { id: docRef.id, ...data } };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const updateProjectTask = async (id, data) => {
    try {
        const ref = doc(db, "project_tasks", id);
        await updateDoc(ref, data);
        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteProjectTask = async (id) => {
    try {
        await deleteDoc(doc(db, "project_tasks", id));
        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

// ============ PROJECT PARTS ============
export const getProjectParts = async (projectId) => {
    try {
        const q = query(collection(db, "project_parts"), where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { status: "success", data: parts };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const addProjectPart = async (data) => {
    try {
        // Also deduct from inventory in a real scenario
        const docRef = await addDoc(collection(db, "project_parts"), {
            ...data,
            addedAt: new Date().toISOString()
        });
        
        // Descontar inventario (Simplificado, idealmente en transacción)
        if(data.productId && data.quantity) {
             const productRef = doc(db, "products", data.productId);
             const prodSnap = await getDoc(productRef);
             if(prodSnap.exists()) {
                 const currentStock = prodSnap.data().stock || 0;
                 await updateDoc(productRef, { stock: currentStock - data.quantity });
             }
        }
        
        // Sincronizar con finanzas como egreso
        let transactionId = null;
        if (data.price && data.quantity) {
            const totalCost = parseFloat(data.price) * parseInt(data.quantity);
            if (totalCost > 0) {
                try {
                    const transRes = await api.post("/finanzas/transacciones", {
                        proyecto_id: data.projectId,
                        tipo: "egreso",
                        monto: totalCost,
                        descripcion: `Repuesto asignado: ${data.name} (x${data.quantity})`,
                        fecha: new Date().toISOString().split('T')[0],
                        metodoPago: "inventario",
                        estado: "completado",
                        is_internal: true
                    });
                    if (transRes.data && transRes.data.data && transRes.data.data.id) {
                        transactionId = transRes.data.data.id;
                        // Guardar el ID de transacción en el documento del repuesto
                        await updateDoc(docRef, { transactionId });
                    }
                } catch (e) {
                    console.error("Error syncing part with finance:", e);
                }
            }
        }
        
        return { status: "success", data: { id: docRef.id, ...data, transactionId } };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteProjectPart = async (id, partData) => {
    try {
        await deleteDoc(doc(db, "project_parts", id));
        // Devolver al inventario
        if(partData?.productId && partData?.quantity) {
             const productRef = doc(db, "products", partData.productId);
             const prodSnap = await getDoc(productRef);
             if(prodSnap.exists()) {
                 const currentStock = prodSnap.data().stock || 0;
                 await updateDoc(productRef, { stock: currentStock + partData.quantity });
             }
        }
        
        // Eliminar transacción financiera si existe
        if (partData?.transactionId) {
            try {
                await api.delete(`/finanzas/transacciones/${partData.transactionId}`);
            } catch (e) {
                console.error("Error deleting finance transaction:", e);
            }
        }
        
        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

// ============ PROJECT ATTACHMENTS ============
export const getProjectAttachments = async (projectId) => {
    try {
        const q = query(collection(db, "project_attachments"), where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { status: "success", data: files };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const addProjectAttachment = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "project_attachments"), {
            ...data,
            uploadedAt: new Date().toISOString()
        });
        return { status: "success", data: { id: docRef.id, ...data } };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteProjectAttachment = async (id) => {
    try {
        await deleteDoc(doc(db, "project_attachments", id));
        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

