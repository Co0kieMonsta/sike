import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
};

// GET - Fetch single transaction
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const supabaseClient = getSupabaseClient();
    
    const { data: transaction, error } = await supabaseClient
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Transacción no encontrada",
        },
        { status: 404 }
      );
    }

    // Map metada_pago to metodoPago for frontend consistency
    const formattedTransaction = {
      ...transaction,
      metodoPago: transaction.metodo_pago,
    };

    return NextResponse.json({
      status: "success",
      data: formattedTransaction,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al obtener transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update transaction
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();
    const supabaseClient = getSupabaseClient();

    console.log(`Updating transaction ${id}. Service Role Key present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);

    const { data, error } = await supabaseClient
      .from("finance_transactions")
      .update({
          fecha: reqBody.fecha,
          tipo: reqBody.tipo,
          categoria: reqBody.categoria,
          subcategoria: reqBody.subcategoria,
          monto: reqBody.monto,
          metodo_pago: reqBody.metodoPago || reqBody.metodo_pago, // Handle both cases
          cuenta: reqBody.cuenta,
          descripcion: reqBody.descripcion,
          referencia: reqBody.referencia,
          estado: reqBody.estado,
          comprobante: reqBody.comprobante,
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
          message: "Transacción no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Transacción actualizada exitosamente",
      data: data[0],
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al actualizar transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete transaction
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabaseClient = getSupabaseClient();
    
    console.log(`Deleting transaction ${id}. Service Role Key present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);

    const { error } = await supabaseClient
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success",
      message: "Transacción eliminada exitosamente",
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Error al eliminar transacción: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

