import { api } from "@/config/axios.config";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "firebase/firestore";
import { logAction } from "./audit.config";

// --- Categories ---
export const getCategories = async () => {
    try {
        const snapshot = await getDocs(collection(db, "inventory_categories"));
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { status: "success", data: categories };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const createCategory = async (data) => {
    try {
        const payload = { ...data, created_at: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "inventory_categories"), payload);
        return { status: "success", data: { id: docRef.id, ...payload } };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const updateCategory = async (id, data) => {
    try {
        await updateDoc(doc(db, "inventory_categories", id), data);
        return { status: "success", data };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteCategory = async (id) => {
    try {
        await deleteDoc(doc(db, "inventory_categories", id));
        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

// --- Products ---
export const getProducts = async () => {
    try {
        const productsRef = collection(db, "inventory_products");
        const q = query(productsRef, orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        
        let products = await Promise.all(snapshot.docs.map(async (docSnap) => {
            let productData = { id: docSnap.id, ...docSnap.data() };
            if (productData.category_id) {
                try {
                    const catSnap = await getDoc(doc(db, "inventory_categories", productData.category_id));
                    if(catSnap.exists()) {
                        productData.categoryName = catSnap.data().name;
                    }
                } catch(e) {}
            }
            return productData;
        }));
        
        return { status: "success", data: products };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const getProductById = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "inventory_products", id));
        if (docSnap.exists()) {
            return { status: "success", data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { status: "fail", message: "Product not found" };
        }
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const createProduct = async (data) => {
    try {
        const { name, sku, brand, category_id, price, cost, stock, location, status, description, imageUrl } = data;
        const newProduct = {
            name, sku: sku || null, brand: brand || null, category_id,
            price: Number(price), cost: cost ? Number(cost) : 0, stock: stock ? Number(stock) : 0,
            location: location || null, status: status || 'active', description: description || null,
            imageUrl: imageUrl || null, created_by: auth.currentUser ? auth.currentUser.uid : "anonymous", created_at: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "inventory_products"), newProduct);
        const createdData = { id: docRef.id, ...newProduct };
        
        await logAction("inventory_products", docRef.id, "CREATE", null, createdData);
        
        if (newProduct.stock > 0) {
            await addDoc(collection(db, "inventory_movements"), {
                productId: docRef.id, type: "restock", quantity: newProduct.stock,
                oldStock: 0, newStock: newProduct.stock, addedAt: new Date().toISOString()
            });
        }
        
        return { status: "success", data: createdData };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const updateProduct = async (id, data) => {
    try {
        const updatePayload = { ...data };
        if (updatePayload.price !== undefined) updatePayload.price = Number(updatePayload.price);
        if (updatePayload.cost !== undefined) updatePayload.cost = Number(updatePayload.cost);
        if (updatePayload.stock !== undefined) updatePayload.stock = Number(updatePayload.stock);
        
        // Fetch old data for audit
        const oldDoc = await getDoc(doc(db, "inventory_products", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await updateDoc(doc(db, "inventory_products", id), updatePayload);
        
        const newData = { ...oldData, ...updatePayload };
        await logAction("inventory_products", id, "UPDATE", oldData, newData);

        return { status: "success", data: updatePayload };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteProduct = async (id) => {
    try {
        const oldDoc = await getDoc(doc(db, "inventory_products", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await deleteDoc(doc(db, "inventory_products", id));
        
        await logAction("inventory_products", id, "DELETE", oldData, null);

        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
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
        const assetsRef = collection(db, "inventory_assets");
        const q = query(assetsRef, orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);

        let assets = await Promise.all(snapshot.docs.map(async (docSnap) => {
            let assetData = { id: docSnap.id, ...docSnap.data() };
            if (assetData.category_id) {
                try {
                    const catSnap = await getDoc(doc(db, "inventory_categories", assetData.category_id));
                    if(catSnap.exists()) {
                        assetData.categoryName = catSnap.data().name;
                    }
                } catch(e) {}
            }
            return assetData;
        }));

        return { status: "success", data: assets };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const createAsset = async (data) => {
    try {
        const { name, serial_number, brand, model, category_id, purchase_price, purchase_date, location, status, description, assigned_to, imageUrl } = data;
        const newAsset = {
            name, serial_number: serial_number || null, brand: brand || null, model: model || null,
            category_id: category_id || null, purchase_price: purchase_price ? Number(purchase_price) : 0,
            purchase_date: purchase_date || null, location: location || null, status: status || 'operativo',
            description: description || null, assigned_to: assigned_to || null, imageUrl: imageUrl || null,
            created_by: auth.currentUser ? auth.currentUser.uid : "anonymous", created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "inventory_assets"), newAsset);
        const createdData = { id: docRef.id, ...newAsset };
        
        await logAction("inventory_assets", docRef.id, "CREATE", null, createdData);
        
        return { status: "success", data: createdData };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const updateAsset = async (id, data) => {
    try {
        const updatePayload = { ...data };
        if (updatePayload.purchase_price !== undefined) updatePayload.purchase_price = Number(updatePayload.purchase_price);
        updatePayload.updated_at = new Date().toISOString();
        
        const oldDoc = await getDoc(doc(db, "inventory_assets", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await updateDoc(doc(db, "inventory_assets", id), updatePayload);
        const newData = { ...oldData, ...updatePayload };
        
        await logAction("inventory_assets", id, "UPDATE", oldData, newData);

        return { status: "success", data: updatePayload };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};

export const deleteAsset = async (id) => {
    try {
        const oldDoc = await getDoc(doc(db, "inventory_assets", id));
        const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

        await deleteDoc(doc(db, "inventory_assets", id));
        await logAction("inventory_assets", id, "DELETE", oldData, null);

        return { status: "success" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};
