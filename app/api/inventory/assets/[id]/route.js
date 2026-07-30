export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "inventory_assets", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Asset not found" },
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

    const docRef = doc(db, "inventory_assets", id);
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
      name, 
      serial_number, 
      brand, 
      model,
      category_id, 
      purchase_price,
      purchase_date,
      location, 
      status, 
      description,
      assigned_to,
      imageUrl
    } = body;

    const docRef = doc(db, "inventory_assets", id);
    
    const updateData = {
      name,
      serial_number: serial_number || null,
      brand: brand || null,
      model: model || null,
      category_id: category_id || null,
      purchase_price: purchase_price ? Number(purchase_price) : 0,
      purchase_date: purchase_date || null,
      location: location || null,
      status: status || 'operativo',
      description: description || null,
      assigned_to: assigned_to || null,
      imageUrl: imageUrl || null,
      updated_by: "USR-001",
      updated_at: new Date().toISOString()
    };

    // Remove undefined properties before updating
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

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
