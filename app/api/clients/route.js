export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

// GET - Fetch all clients
export async function GET(request) {
  try {
    const clientsRef = collection(db, "docs_clients");
    const q = query(clientsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener clientes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new client
export async function POST(request) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const newClient = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      car_brand: body.car_brand || null,
      car_model: body.car_model || null,
      car_color: body.car_color || null,
      car_plate: body.car_plate || null,
      status: body.status || "active",
      created_at: now,
      updated_at: now,
    };

    const clientsRef = collection(db, "docs_clients");
    const docRef = await addDoc(clientsRef, newClient);
    
    return NextResponse.json(
      {
        status: "success",
        message: "Cliente creado exitosamente",
        data: { id: docRef.id, ...newClient },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear cliente",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
