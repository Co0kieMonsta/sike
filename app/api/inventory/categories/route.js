export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export async function GET(request) {
  try {
    const catsRef = collection(db, "inventory_categories");
    const q = query(catsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener categorías",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const catsRef = collection(db, "inventory_categories");

    const newCategory = {
      name,
      description: description || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(catsRef, newCategory);
    const createdData = { id: docRef.id, ...newCategory };

    return NextResponse.json(
      {
        status: "success",
        message: "Categoría creada exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
