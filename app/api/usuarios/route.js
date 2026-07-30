export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";

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

    const now = new Date().toISOString();

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: reqBody.email,
        password: reqBody.password,
        returnSecureToken: false
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return NextResponse.json(
        { status: "fail", message: authData.error?.message || "Error al crear cuenta de usuario (Auth)" },
        { status: 400 }
      );
    }

    const uid = authData.localId;

    const newUser = {
      name: reqBody.name,
      email: reqBody.email,
      role: reqBody.role || "user",
      status: reqBody.status || "active",
      image: reqBody.image || null,
      phone: reqBody.phone || null,
      department: reqBody.department || null,
      position: reqBody.position || null,
      created_at: now,
      updated_at: now,
      created_by: "USR-001", 
      updated_by: "USR-001"
    };

    // Create new user in DB using the auth UID
    const docRef = doc(db, "system_users", uid);
    await setDoc(docRef, newUser);
    const createdUser = { id: uid, ...newUser };

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

