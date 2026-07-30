import { db, auth, storage } from "@/lib/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";
import { logAction } from "./audit.config";

export const getProjects = async () => {
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { status: "success", data: projects };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const createProject = async (data) => {
    try {
        const { title, client, description, status, startDate, endDate, budget, priority, carId, carName, inspectionId, inspectionDetails } = data;
        const newProject = {
            title, client, description: description || null,
            status: status || 'pending', priority: priority || 'media',
            carId: carId || null, carName: carName || null,
            startDate: startDate || new Date().toISOString(), endDate: endDate || null,
            budget: budget ? parseFloat(budget) : 0,
            inspectionId: inspectionId || null, inspectionDetails: inspectionDetails || null,
            created_by: auth.currentUser ? auth.currentUser.uid : "anonymous",
            created_at: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "projects"), newProject);
        const createdData = { id: docRef.id, ...newProject };
        
        await logAction("projects", docRef.id, "CREATE", null, createdData);
        
        return { status: "success", data: createdData };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const getProjectById = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "projects", id));
        if (docSnap.exists()) {
            return { status: "success", data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { status: "fail", message: "Project not found" };
        }
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const updateProject = async (id, data) => {
    try {
        const oldDoc = await getDoc(doc(db, "projects", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await updateDoc(doc(db, "projects", id), data);
        
        const newData = { ...oldData, ...data };
        await logAction("projects", id, "UPDATE", oldData, newData);

        return { status: "success", data };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteProject = async (id) => {
    try {
        const oldDoc = await getDoc(doc(db, "projects", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await deleteDoc(doc(db, "projects", id));
        
        await logAction("projects", id, "DELETE", oldData, null);

        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};


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

