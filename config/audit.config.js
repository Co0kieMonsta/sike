import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs } from "firebase/firestore";

/**
 * Calculates the difference between two objects.
 * @param {Object} oldData - The previous state of the document.
 * @param {Object} newData - The new state of the document.
 * @returns {Array} Array of changes [{ field, old, new }]
 */
const calculateDiff = (oldData, newData) => {
    if (!oldData) oldData = {};
    if (!newData) newData = {};

    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    // Fields to ignore when computing differences
    const ignoreFields = ['updated_at', 'created_at', 'updatedAt', 'createdAt', 'created_by'];

    allKeys.forEach((key) => {
        if (ignoreFields.includes(key)) return;

        const oldVal = oldData[key];
        const newVal = newData[key];

        // Basic comparison (does not do deep equality for nested objects/arrays yet, 
        // but sufficient for flat fields like price, name, etc.)
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push({
                field: key,
                old: oldVal !== undefined ? oldVal : null,
                new: newVal !== undefined ? newVal : null
            });
        }
    });

    return changes;
};

/**
 * Logs an action to the audit_logs collection.
 * @param {String} module - The module name (e.g., 'inventory', 'projects')
 * @param {String} entityId - The ID of the document being modified
 * @param {String} action - The action type: 'CREATE', 'UPDATE', 'DELETE'
 * @param {Object} oldData - (Optional) The previous data
 * @param {Object} newData - (Optional) The new data
 */
export const logAction = async (module, entityId, action, oldData = null, newData = null) => {
    try {
        const user = auth.currentUser;
        
        // If there's no authenticated user, we can default to 'System' or 'Anonymous'
        const userId = user ? user.uid : "anonymous";
        const userEmail = user ? user.email : "Sistema";

        let changes = [];
        
        if (action === 'UPDATE' && oldData && newData) {
            changes = calculateDiff(oldData, newData);
            // If no actual changes, skip logging
            if (changes.length === 0) return; 
        } else if (action === 'CREATE' && newData) {
            changes = calculateDiff({}, newData);
        } else if (action === 'DELETE' && oldData) {
            changes = calculateDiff(oldData, {});
        }

        const logEntry = {
            module,
            entityId,
            action,
            userId,
            userEmail,
            changes,
            timestamp: new Date().toISOString()
        };

        await addDoc(collection(db, "audit_logs"), logEntry);
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
};

/**
 * Retrieves the audit history for a specific entity.
 * @param {String} entityId - The document ID to fetch history for.
 */
export const getEntityHistory = async (entityId) => {
    try {
        const logsRef = collection(db, "audit_logs");
        const q = query(logsRef, where("entityId", "==", entityId), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        return {
            status: "success",
            data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
    } catch (error) {
        return { status: "error", message: error.message };
    }
};
