import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch single category
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const { data: categoria, error } = await supabase
      .from("finance_categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !categoria) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Categoría no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: categoria,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();

    const { data, error } = await supabase
      .from("finance_categories")
      .update({
          nombre: reqBody.nombre,
          tipo: reqBody.tipo,
          descripcion: reqBody.descripcion,
          icono: reqBody.icono,
          color: reqBody.color,
      })
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Categoría no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Categoría actualizada exitosamente",
      data: data[0],
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from("finance_categories")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success",
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar categoría",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

