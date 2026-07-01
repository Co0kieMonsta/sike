export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    const categoriesRef = collection(db, "finance_categories");
    
    let q;
    if (tipo) {
      q = query(categoriesRef, where("tipo", "==", tipo), orderBy("nombre", "asc"));
    } else {
      q = query(categoriesRef, orderBy("nombre", "asc"));
    }

    const snapshot = await getDocs(q);
    const categorias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: categorias,
      count: categorias.length,
    });
  } catch (error) {
    console.log("An error occurred:", error);
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

// POST - Create new category
export async function POST(request) {
  try {
    const reqBody = await request.json();

    const categoriesRef = collection(db, "finance_categories");
    const newCategory = {
      nombre: reqBody.nombre,
      tipo: reqBody.tipo,
      descripcion: reqBody.descripcion || null,
      icono: reqBody.icono || null,
      color: reqBody.color || null,
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(categoriesRef, newCategory);
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
    console.log("An error occurred:", error);
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

