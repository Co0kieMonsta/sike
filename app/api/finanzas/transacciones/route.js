export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, orderBy, updateDoc, doc } from "firebase/firestore";

// GET - Fetch all transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");

    const transRef = collection(db, "finance_transactions");
    
    // Simplificamos la consulta a Firestore para evitar errores de índices compuestos (Composite Index Error).
    // Traemos todo ordenado por fecha de creación y filtramos en memoria.
    const q = query(transRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let transacciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtros en memoria
    if (tipo) transacciones = transacciones.filter(t => t.tipo === tipo);
    if (estado) transacciones = transacciones.filter(t => t.estado === estado);
    if (fechaInicio) transacciones = transacciones.filter(t => t.fecha >= fechaInicio);
    if (fechaFin) transacciones = transacciones.filter(t => t.fecha <= fechaFin);
    
    // Sort final por fecha
    transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Calculate totals
    const ingresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + Number(t.monto), 0);
    
    const egresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + Number(t.monto), 0);

    return NextResponse.json({
      status: "success",
      data: transacciones.map(t => ({
        ...t,
        metodoPago: t.metodo_pago
      })),
      count: transacciones.length,
      summary: {
        ingresos,
        egresos,
        balance: ingresos - egresos,
      },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener transacciones",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new transaction
export async function POST(request) {
  try {
    const reqBody = await request.json();
    
    const transRef = collection(db, "finance_transactions");
    const newTransaction = {
      fecha: reqBody.fecha,
      tipo: reqBody.tipo,
      categoria: reqBody.categoria || null,
      subcategoria: reqBody.subcategoria || null,
      monto: reqBody.monto,
      metodo_pago: reqBody.metodoPago || null,
      cuenta: reqBody.cuenta || null,
      descripcion: reqBody.descripcion || null,
      referencia: reqBody.referencia || null,
      estado: reqBody.estado || "completado",
      comprobante: reqBody.comprobante || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(transRef, newTransaction);
    const createdData = { id: docRef.id, ...newTransaction };

    // Update account balance if account is specified
    if (reqBody.cuenta) {
      const accountsRef = collection(db, "finance_accounts");
      const q = query(accountsRef, where("nombre", "==", reqBody.cuenta));
      const accountSnap = await getDocs(q);

      if (!accountSnap.empty) {
        const accountDoc = accountSnap.docs[0];
        const accountData = accountDoc.data();
        
        let newBalance = Number(accountData.saldo || 0);
        const amount = Number(reqBody.monto);

        if (reqBody.tipo === "ingreso") {
          newBalance += amount;
        } else if (reqBody.tipo === "egreso") {
          newBalance -= amount;
        }

        const accountRef = doc(db, "finance_accounts", accountDoc.id);
        await updateDoc(accountRef, { saldo: newBalance });
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Transacción creada exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear transacción",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

