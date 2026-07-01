export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

// GET - Fetch all accounts
export async function GET(request) {
  try {
    const accountsRef = collection(db, "finance_accounts");
    const q = query(accountsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    const cuentas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalSaldo = cuentas.reduce((sum, c) => sum + Number(c.saldo || 0), 0);

    return NextResponse.json({
      status: "success",
      data: cuentas,
      count: cuentas.length,
      totalSaldo,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener cuentas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new account
export async function POST(request) {
  try {
    const reqBody = await request.json();

    const accountsRef = collection(db, "finance_accounts");
    const newAccount = {
      nombre: reqBody.nombre,
      tipo: reqBody.tipo,
      numero_cuenta: reqBody.numeroCuenta || null,
      banco: reqBody.banco || null,
      saldo: reqBody.saldo || 0,
      moneda: reqBody.moneda || "USD",
      estado: reqBody.estado || "activo",
      descripcion: reqBody.descripcion || null,
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(accountsRef, newAccount);
    const createdData = { id: docRef.id, ...newAccount };

    return NextResponse.json(
      {
        status: "success",
        message: "Cuenta creada exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

