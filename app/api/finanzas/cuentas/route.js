import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch all accounts
export async function GET(request) {
  try {
    const { data: cuentas, error } = await supabase
      .from("finance_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const totalSaldo = cuentas.reduce((sum, c) => sum + Number(c.saldo), 0);

    return NextResponse.json({
      status: "success",
      data: cuentas,
      count: cuentas.length,
      totalSaldo,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener cuentas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new account
export async function POST(request) {
  try {
    const reqBody = await request.json();

    const { data, error } = await supabase
      .from("finance_accounts")
      .insert([
        {
          nombre: reqBody.nombre,
          tipo: reqBody.tipo,
          numero_cuenta: reqBody.numeroCuenta,
          banco: reqBody.banco,
          saldo: reqBody.saldo || 0,
          moneda: reqBody.moneda || "USD",
          estado: reqBody.estado || "activo",
          descripcion: reqBody.descripcion,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Cuenta creada exitosamente",
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear cuenta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

