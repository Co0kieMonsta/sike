import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET - Fetch single category
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const categoryRef = doc(db, "finance_categories", id);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Categoría no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: { id: categorySnap.id, ...categorySnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();

    const categoryRef = doc(db, "finance_categories", id);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Categoría no encontrada",
        },
        { status: 404 }
      );
    }

    const updates = {
      nombre: reqBody.nombre,
      tipo: reqBody.tipo,
      descripcion: reqBody.descripcion,
      icono: reqBody.icono,
      color: reqBody.color,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    await updateDoc(categoryRef, updates);
    const updatedSnap = await getDoc(categoryRef);

    return NextResponse.json({
      status: "success",
      message: "Categoría actualizada exitosamente",
      data: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const categoryRef = doc(db, "finance_categories", id);
    await deleteDoc(categoryRef);

    return NextResponse.json({
      status: "success",
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

