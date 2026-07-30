export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { status: "fail", message: "Project not found" },
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

    const docRef = doc(db, "projects", id);
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
      title, 
      client, 
      description, 
      status, 
      startDate, 
      endDate, 
      budget,
      priority,
      notes,
      carId,
      carName,
      checklist,
      inspectionDetails
    } = body;

    const docRef = doc(db, "projects", id);
    
    // Only update fields that are explicitly provided in the body
    const updateData = {
      updated_by: "USR-001",
      updated_at: new Date().toISOString()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.client !== undefined) updateData.client = body.client;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.carId !== undefined) updateData.carId = body.carId;
    if (body.carName !== undefined) updateData.carName = body.carName;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.checklist !== undefined) updateData.checklist = body.checklist;
    if (body.inspectionDetails !== undefined) updateData.inspectionDetails = body.inspectionDetails;
    if (body.mechanic !== undefined) updateData.mechanic = body.mechanic;
    if (body.comments !== undefined) updateData.comments = body.comments;
    if (body.payments !== undefined) updateData.payments = body.payments;
    if (body.mechanicCommission !== undefined) updateData.mechanicCommission = parseFloat(body.mechanicCommission);

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
