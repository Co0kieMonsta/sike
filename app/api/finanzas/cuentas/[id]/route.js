import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET - Fetch single account
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const accountRef = doc(db, "finance_accounts", id);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Cuenta no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: { id: accountSnap.id, ...accountSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update account
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();

    const accountRef = doc(db, "finance_accounts", id);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Cuenta no encontrada",
        },
        { status: 404 }
      );
    }

    const updates = {
      nombre: reqBody.nombre,
      tipo: reqBody.tipo,
      numero_cuenta: reqBody.numeroCuenta,
      banco: reqBody.banco,
      saldo: reqBody.saldo,
      moneda: reqBody.moneda,
      estado: reqBody.estado,
      descripcion: reqBody.descripcion,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    await updateDoc(accountRef, updates);
    const updatedSnap = await getDoc(accountRef);

    return NextResponse.json({
      status: "success",
      message: "Cuenta actualizada exitosamente",
      data: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete account
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const accountRef = doc(db, "finance_accounts", id);
    await deleteDoc(accountRef);

    return NextResponse.json({
      status: "success",
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

