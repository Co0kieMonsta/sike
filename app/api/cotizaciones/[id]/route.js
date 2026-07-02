export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "docs_cotizaciones", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Quote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: { id: docSnap.id, ...docSnap.data() }
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "docs_cotizaciones", id);
    await deleteDoc(docRef);

    return NextResponse.json({
      status: "success",
      message: "Deleted successfully"
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      cliente_nombre, 
      cliente_email, 
      cliente_direccion, 
      fecha, 
      fecha_vencimiento, 
      items, 
      notas,
      estado
    } = body;

    // 1. Calculate new total
    const total = items ? items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) : 0;

    // 2. Update Cotización in Firestore
    const docRef = doc(db, "docs_cotizaciones", id);
    
    const updateData = {
      cliente_nombre,
      cliente_email: cliente_email || null,
      cliente_direccion: cliente_direccion || null,
      fecha: fecha || new Date().toISOString(),
      fecha_vencimiento: fecha_vencimiento || null,
      total,
      notas: notas || null,
      estado: estado || 'pendiente',
      updated_by: "USR-001",
      updated_at: new Date().toISOString()
    };

    if (items) {
      updateData.detalles_cotizacion = items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        producto_id: item.producto_id || null
      }));
    }

    await updateDoc(docRef, updateData);

    return NextResponse.json({
      status: "success",
      message: "Updated successfully"
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
