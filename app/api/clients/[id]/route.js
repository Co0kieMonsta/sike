export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET - Fetch single client
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const docRef = doc(db, "docs_clients", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: { id: docSnap.id, ...docSnap.data() }
    });
  } catch (error) {
    return NextResponse.json(
      { status: "fail", message: "Error occurred", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update client
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const docRef = doc(db, "docs_clients", id);
    
    const updateData = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      car_brand: body.car_brand || null,
      car_model: body.car_model || null,
      car_color: body.car_color || null,
      car_plate: body.car_plate || null,
      status: body.status || "active",
      updated_at: now,
    };

    await updateDoc(docRef, updateData);

    return NextResponse.json({
      status: "success",
      message: "Client updated successfully",
      data: { id, ...updateData },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "fail", message: "Error updating client", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const docRef = doc(db, "docs_clients", id);
    await deleteDoc(docRef);

    return NextResponse.json({
      status: "success",
      message: "Client deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "fail", message: "Error deleting client", error: error.message },
      { status: 500 }
    );
  }
}
