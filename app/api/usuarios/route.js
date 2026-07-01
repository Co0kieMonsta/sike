export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch all usuarios
export async function GET(request) {
  try {
    const usersRef = collection(db, "system_users");
    // Traemos todo y ordenamos en memoria para evitar problemas de caché o índices
    const snapshot = await getDocs(usersRef);
    
    let usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by created_at desc
    usuarios.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return NextResponse.json({
      status: "success",
      data: usuarios,
      count: usuarios.length,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Something went wrong",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new usuario
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized: Only admins can create users",
        },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    
    // Check if email already exists
    const usersRef = collection(db, "system_users");
    const checkQuery = query(usersRef, where("email", "==", reqBody.email));
    const checkSnapshot = await getDocs(checkQuery);
    
    if (!checkSnapshot.empty) {
      return NextResponse.json(
        { status: "fail", message: "El usuario con este email ya existe" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(reqBody.password, 10);
    const now = new Date().toISOString();

    const newUser = {
      name: reqBody.name,
      email: reqBody.email,
      password: hashedPassword,
      role: reqBody.role || "user",
      status: reqBody.status || "active",
      image: reqBody.image || null,
      phone: reqBody.phone || null,
      department: reqBody.department || null,
      position: reqBody.position || null,
      created_at: now,
      updated_at: now,
      created_by: session.user.id, 
      updated_by: session.user.id
    };

    // Create new user in DB
    const docRef = await addDoc(usersRef, newUser);
    const createdUser = { id: docRef.id, ...newUser };

    return NextResponse.json(
      {
        status: "success",
        message: "Usuario creado exitosamente",
        data: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error: ${error.message || JSON.stringify(error)}`,
        error: error,
      },
      { status: 500 }
    );
  }
}

