export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "inventory_products", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Product not found" },
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

    const docRef = doc(db, "inventory_products", id);
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
      sku, 
      brand, 
      category_id, 
      price, 
      cost, 
      stock, 
      location, 
      status, 
      description,
      imageUrl
    } = body;

    const docRef = doc(db, "inventory_products", id);
    
    const updateData = {
      name,
      sku: sku || null,
      brand: brand || null,
      category_id,
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      stock: stock ? Number(stock) : 0,
      location: location || null,
      status: status || 'active',
      description: description || null,
      imageUrl: imageUrl || null,
      updated_by: "USR-001",
      updated_at: new Date().toISOString()
    };

    const docSnap = await getDoc(docRef);
    const oldData = docSnap.exists() ? docSnap.data() : {};
    
    await updateDoc(docRef, updateData);

    const oldStock = Number(oldData.stock || 0);
    const newStock = updateData.stock;
    const diff = newStock - oldStock;

    if (diff !== 0) {
      const movementsRef = collection(db, "inventory_movements");
      await addDoc(movementsRef, {
        productId: id,
        type: diff > 0 ? "restock" : "manual_deduction",
        quantity: Math.abs(diff),
        oldStock,
        newStock,
        addedAt: new Date().toISOString()
      });
    }

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
