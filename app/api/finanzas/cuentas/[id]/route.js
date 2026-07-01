import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch single account
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const { data: cuenta, error } = await supabase
      .from("finance_accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !cuenta) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Cuenta no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: cuenta,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update account
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();

    const { data, error } = await supabase
      .from("finance_accounts")
      .update({
          nombre: reqBody.nombre,
          tipo: reqBody.tipo,
          numero_cuenta: reqBody.numeroCuenta,
          banco: reqBody.banco,
          saldo: reqBody.saldo,
          moneda: reqBody.moneda,
          estado: reqBody.estado,
          descripcion: reqBody.descripcion,
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
          message: "Cuenta no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Cuenta actualizada exitosamente",
      data: data[0],
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete account
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from("finance_accounts")
      .delete()
      .eq("id", id);

    if (error) {
       throw error;
    }

    return NextResponse.json({
      status: "success",
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

