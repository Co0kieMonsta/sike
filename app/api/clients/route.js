import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Create private admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Fetch all clients
export async function GET(request) {
  try {
    const { data: clients, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      data: clients,
      count: clients.length,
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

// POST - Create new client
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Optional: Enforce Auth
    // if (!session) {
    //   return NextResponse.json(
    //     { status: "fail", message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const reqBody = await request.json();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert([
        {
          name: reqBody.name,
          email: reqBody.email,
          phone: reqBody.phone,
          address: reqBody.address,
          car_brand: reqBody.car_brand,
          car_model: reqBody.car_model,
          car_color: reqBody.car_color,
          car_plate: reqBody.car_plate,
          status: reqBody.status || "active",
          created_at: now,
          updated_at: now,
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Cliente creado exitosamente",
        data: data[0],
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
