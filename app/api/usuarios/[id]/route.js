import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch single usuario by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const userRef = doc(db, "system_users", id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: { id: userSnap.id, ...userSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update usuario
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Enforce Admin Only for updates
    if (!session || session.user.role !== "admin") {
       return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const reqBody = await request.json();

    const updates = { ...reqBody };
    delete updates.id; 
    delete updates.created_at; 
    delete updates.created_by; 
    
    updates.updated_by = session.user.id;
    updates.updated_at = new Date().toISOString();
    
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const userRef = doc(db, "system_users", id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
         return NextResponse.json(
          {
            status: "fail",
            message: "Usuario no encontrado",
          },
          { status: 404 }
        );
    }

    await updateDoc(userRef, updates);
    const updatedSnap = await getDoc(userRef);

    return NextResponse.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete usuario
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Enforce Admin Only
    if (!session || session.user.role !== "admin") {
       return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (session.user.id === id) {
       return NextResponse.json(
        {
          status: "fail",
          message: "No puedes eliminar tu propia cuenta",
        },
        { status: 400 }
      );
    }

    const userRef = doc(db, "system_users", id);
    await deleteDoc(userRef);

    return NextResponse.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
      data: null,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

