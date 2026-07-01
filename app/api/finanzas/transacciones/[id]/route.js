import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET - Fetch single transaction
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const transRef = doc(db, "finance_transactions", id);
    const transSnap = await getDoc(transRef);

    if (!transSnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Transacción no encontrada",
        },
        { status: 404 }
      );
    }

    const transaction = { id: transSnap.id, ...transSnap.data() };
    const formattedTransaction = {
      ...transaction,
      metodoPago: transaction.metodo_pago,
    };

    return NextResponse.json({
      status: "success",
      data: formattedTransaction,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al obtener transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update transaction
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();

    const transRef = doc(db, "finance_transactions", id);
    const transSnap = await getDoc(transRef);

    if (!transSnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Transacción no encontrada",
        },
        { status: 404 }
      );
    }

    const updates = {
      fecha: reqBody.fecha,
      tipo: reqBody.tipo,
      categoria: reqBody.categoria,
      subcategoria: reqBody.subcategoria,
      monto: reqBody.monto,
      metodo_pago: reqBody.metodoPago || reqBody.metodo_pago,
      cuenta: reqBody.cuenta,
      descripcion: reqBody.descripcion,
      referencia: reqBody.referencia,
      estado: reqBody.estado,
      comprobante: reqBody.comprobante,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    await updateDoc(transRef, updates);
    const updatedSnap = await getDoc(transRef);

    return NextResponse.json({
      status: "success",
      message: "Transacción actualizada exitosamente",
      data: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al actualizar transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete transaction
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const transRef = doc(db, "finance_transactions", id);
    await deleteDoc(transRef);

    return NextResponse.json({
      status: "success",
      message: "Transacción eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al eliminar transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

