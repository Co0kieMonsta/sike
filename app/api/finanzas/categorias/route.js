import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    let query = supabase
      .from("finance_categories")
      .select("*")
      .order("nombre", { ascending: true });

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    const { data: categorias, error } = await query;

    if (error) {
      throw error;
    }

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

    const { data, error } = await supabase
      .from("finance_categories")
      .insert([
        {
          nombre: reqBody.nombre,
          tipo: reqBody.tipo,
          descripcion: reqBody.descripcion,
          icono: reqBody.icono,
          color: reqBody.color,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Categoría creada exitosamente",
        data: data[0],
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

