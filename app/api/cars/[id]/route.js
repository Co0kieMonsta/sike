export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "cars", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Car not found" },
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

    const docRef = doc(db, "cars", id);
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
      make, 
      model, 
      year, 
      vin_chassis, 
      licensePlate,
      engine,
      modifications,
      status,
      ownerName,
      ownerPhone,
      ownerEmail,
      client_id
    } = body;

    const docRef = doc(db, "cars", id);
    
    const updateData = {
      make,
      model,
      year: year || null,
      vin_chassis: vin_chassis || null,
      licensePlate: licensePlate || null,
      engine: engine || null,
      modifications: modifications || null,
      status: status || 'en_taller',
      ownerName,
      ownerPhone: ownerPhone || null,
      ownerEmail: ownerEmail || null,
      client_id: client_id || null,
      updated_by: "USR-001",
      updated_at: new Date().toISOString()
    };

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
