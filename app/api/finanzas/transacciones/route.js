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

// GET - Fetch all transactions
export async function GET(request) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");
    const supabaseClient = getSupabaseClient();

    let query = supabaseClient
      .from("finance_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (tipo) {
      query = query.eq("tipo", tipo);
    }
    if (estado) {
      query = query.eq("estado", estado);
    }
    if (fechaInicio) {
      query = query.gte("fecha", fechaInicio);
    }
    if (fechaFin) {
      query = query.lte("fecha", fechaFin);
    }

    const { data: transacciones, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate totals
    const ingresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + Number(t.monto), 0);
    
    const egresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + Number(t.monto), 0);

    return NextResponse.json({
      status: "success",
      data: transacciones.map(t => ({
        ...t,
        metodoPago: t.metodo_pago
      })),
      count: transacciones.length,
      summary: {
        ingresos,
        egresos,
        balance: ingresos - egresos,
      },
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener transacciones",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new transaction
export async function POST(request) {
  try {
    const reqBody = await request.json();
    const supabaseClient = getSupabaseClient();
    
    console.log(`Creating transaction. Service Role Key present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);

    const { data, error } = await supabaseClient
      .from("finance_transactions")
      .insert([
        {
          fecha: reqBody.fecha,
          tipo: reqBody.tipo,
          categoria: reqBody.categoria,
          subcategoria: reqBody.subcategoria,
          monto: reqBody.monto,
          metodo_pago: reqBody.metodoPago, // Note: DB column uses snake_case usually but I defined it in schema. Let's match schema. 
          // Wait, I defined schema as: metodo_pago. The incoming data is camelCase likely.
          // Let's map it.
          cuenta: reqBody.cuenta,
          descripcion: reqBody.descripcion,
          referencia: reqBody.referencia,
          estado: reqBody.estado || "completado",
          comprobante: reqBody.comprobante,
          created_by: "USR-001", // Default user for now
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    // Update account balance if account is specified
    if (reqBody.cuenta) {
      console.log("Updating account balance for account:", reqBody.cuenta);
      // Frontend sends account name, not ID. So we search by name.
      // Use admin client here too to ensure we can read/update accounts
      const { data: account, error: accountError } = await supabaseClient
        .from("finance_accounts")
        .select("id, saldo")
        .eq("nombre", reqBody.cuenta)
        .single();

      if (accountError) {
        console.error("Error fetching account:", accountError);
      } else if (account) {
        console.log("Current balance:", account.saldo);
        let newBalance = Number(account.saldo);
        const amount = Number(reqBody.monto);
        console.log("Transaction amount:", amount, "Type:", reqBody.tipo);

        if (reqBody.tipo === "ingreso") {
          newBalance += amount;
        } else if (reqBody.tipo === "egreso") {
          newBalance -= amount;
        }
        console.log("New balance:", newBalance);

        console.log("New balance:", newBalance);

        const { error: updateError } = await supabaseClient
          .from("finance_accounts")
          .update({ saldo: newBalance })
          .eq("id", account.id);
        
        if (updateError) {
            console.error("Error updating balance:", updateError);
        } else {
            console.log("Balance updated successfully");
        }
      }
    } else {
        console.log("No account specified in transaction");
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Transacción creada exitosamente",
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear transacción",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

