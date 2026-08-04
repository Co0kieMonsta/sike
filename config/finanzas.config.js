import { db, auth } from "@/lib/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";
import { logAction } from "./audit.config";

// ============ TRANSACTIONS ============

const applyBalanceDelta = async (cuentaNombre, delta) => {
  if (!cuentaNombre || delta === 0) return;
  const accountsRef = collection(db, "finance_accounts");
  const q = query(accountsRef, where("nombre", "==", cuentaNombre));
  const accountSnap = await getDocs(q);
  if (!accountSnap.empty) {
    const accountDoc = accountSnap.docs[0];
    const currentSaldo = Number(accountDoc.data().saldo || 0);
    await updateDoc(doc(db, "finance_accounts", accountDoc.id), { saldo: currentSaldo + delta });
  }
};

export const getTransacciones = async (filters = {}) => {
  try {
    const { tipo, estado, fechaInicio, fechaFin, proyecto_id } = filters;
    const transRef = collection(db, "finance_transactions");
    
    const q = query(transRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let transacciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (tipo) transacciones = transacciones.filter(t => t.tipo === tipo);
    if (estado) transacciones = transacciones.filter(t => t.estado === estado);
    if (fechaInicio) transacciones = transacciones.filter(t => t.fecha >= fechaInicio);
    if (fechaFin) transacciones = transacciones.filter(t => t.fecha <= fechaFin);
    
    if (proyecto_id) {
      transacciones = transacciones.filter(t => t.proyecto_id === proyecto_id);
    } else {
      transacciones = transacciones.filter(t => !t.is_internal);
    }
    
    transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const ingresos = transacciones
      .filter((t) => t.tipo === "ingreso" && t.estado === "completado")
      .reduce((sum, t) => sum + Number(t.monto), 0);
    const egresos = transacciones
      .filter((t) => t.tipo === "egreso" && t.estado === "completado")
      .reduce((sum, t) => sum + Number(t.monto), 0);

    return {
      status: "success",
      data: transacciones.map(t => ({ ...t, metodoPago: t.metodo_pago })),
      count: transacciones.length,
      summary: { ingresos, egresos, balance: ingresos - egresos },
    };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const getTransaccion = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "finance_transactions", id));
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return { status: "success", data: { ...data, metodoPago: data.metodo_pago } };
    }
    return { status: "fail", message: "Not found" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const createTransaccion = async (data) => {
  try {
    const newTransaction = {
      fecha: data.fecha, tipo: data.tipo, categoria: data.categoria || null,
      subcategoria: data.subcategoria || null, monto: data.monto,
      metodo_pago: data.metodoPago || null, cuenta: data.cuenta || null,
      descripcion: data.descripcion || null, referencia: data.referencia || null,
      estado: data.estado || "completado", comprobante: data.comprobante || null,
      proyecto_id: data.proyecto_id || null, is_internal: data.is_internal || false,
      created_by: auth.currentUser ? auth.currentUser.uid : "anonymous",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "finance_transactions"), newTransaction);
    const createdData = { id: docRef.id, ...newTransaction };

    if (newTransaction.cuenta && newTransaction.estado === "completado") {
      const delta = newTransaction.tipo === "ingreso" ? Number(newTransaction.monto) : -Number(newTransaction.monto);
      await applyBalanceDelta(newTransaction.cuenta, delta);
    }

    await logAction("finance_transactions", docRef.id, "CREATE", null, createdData);
    return { status: "success", data: createdData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const updateTransaccion = async (id, data) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_transactions", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    const updates = {
      fecha: data.fecha, tipo: data.tipo, categoria: data.categoria,
      subcategoria: data.subcategoria, monto: data.monto,
      metodo_pago: data.metodoPago || data.metodo_pago, cuenta: data.cuenta,
      descripcion: data.descripcion, referencia: data.referencia || null,
      estado: data.estado || "completado", proyecto_id: data.proyecto_id || null,
      comprobante: data.comprobante, updated_at: new Date().toISOString()
    };
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    await updateDoc(doc(db, "finance_transactions", id), updates);
    const newData = { ...oldData, ...updates };
    
    // Fix balance deltas
    if (oldData) {
      const oldWasCompletado = oldData.estado === "completado";
      const newIsCompletado = newData.estado === "completado";

      if (oldWasCompletado && oldData.cuenta) {
        const revertDelta = oldData.tipo === "ingreso" ? -Number(oldData.monto) : Number(oldData.monto);
        await applyBalanceDelta(oldData.cuenta, revertDelta);
      }

      if (newIsCompletado && newData.cuenta) {
        const applyDelta = newData.tipo === "ingreso" ? Number(newData.monto) : -Number(newData.monto);
        await applyBalanceDelta(newData.cuenta, applyDelta);
      }
    }

    await logAction("finance_transactions", id, "UPDATE", oldData, newData);
    return { status: "success", data: newData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const deleteTransaccion = async (id) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_transactions", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await deleteDoc(doc(db, "finance_transactions", id));
    
    if (oldData && oldData.estado === "completado" && oldData.cuenta) {
      const delta = oldData.tipo === "ingreso" ? -Number(oldData.monto) : Number(oldData.monto);
      await applyBalanceDelta(oldData.cuenta, delta);
    }
    
    await logAction("finance_transactions", id, "DELETE", oldData, null);

    return { status: "success" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// ============ ACCOUNTS ============

export const getCuentas = async () => {
  try {
    const snapshot = await getDocs(collection(db, "finance_accounts"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const getCuenta = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "finance_accounts", id));
    if (docSnap.exists()) return { status: "success", data: { id: docSnap.id, ...docSnap.data() } };
    return { status: "fail", message: "Not found" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const createCuenta = async (data) => {
  try {
    const payload = { ...data, created_at: new Date().toISOString() };
    const docRef = await addDoc(collection(db, "finance_accounts"), payload);
    const createdData = { id: docRef.id, ...payload };
    
    await logAction("finance_accounts", docRef.id, "CREATE", null, createdData);
    return { status: "success", data: createdData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const updateCuenta = async (id, data) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_accounts", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await updateDoc(doc(db, "finance_accounts", id), data);
    const newData = { ...oldData, ...data };
    
    await logAction("finance_accounts", id, "UPDATE", oldData, newData);
    return { status: "success", data: newData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const deleteCuenta = async (id) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_accounts", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await deleteDoc(doc(db, "finance_accounts", id));
    await logAction("finance_accounts", id, "DELETE", oldData, null);

    return { status: "success" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// ============ CATEGORIES ============

export const getCategorias = async (tipo = null) => {
  try {
    const q = tipo ? query(collection(db, "finance_categories"), where("tipo", "==", tipo)) : collection(db, "finance_categories");
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const getCategoria = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "finance_categories", id));
    if (docSnap.exists()) return { status: "success", data: { id: docSnap.id, ...docSnap.data() } };
    return { status: "fail", message: "Not found" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const createCategoria = async (data) => {
  try {
    const payload = { ...data, created_at: new Date().toISOString() };
    const docRef = await addDoc(collection(db, "finance_categories"), payload);
    const createdData = { id: docRef.id, ...payload };
    
    await logAction("finance_categories", docRef.id, "CREATE", null, createdData);
    return { status: "success", data: createdData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const updateCategoria = async (id, data) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_categories", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await updateDoc(doc(db, "finance_categories", id), data);
    const newData = { ...oldData, ...data };
    
    await logAction("finance_categories", id, "UPDATE", oldData, newData);
    return { status: "success", data: newData };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

export const deleteCategoria = async (id) => {
  try {
    const oldDoc = await getDoc(doc(db, "finance_categories", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await deleteDoc(doc(db, "finance_categories", id));
    await logAction("finance_categories", id, "DELETE", oldData, null);

    return { status: "success" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

