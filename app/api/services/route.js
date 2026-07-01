import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Create private admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key"
);

// POST - Create new service
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
      .from("services")
      .insert([
        {
          client_id: reqBody.clientId, // Map clientId to client_id
          type: reqBody.type,
          date: reqBody.date,
          status: reqBody.status,
          cost: reqBody.cost,
          technician: reqBody.technician,
          notes: reqBody.notes,
          mileage: reqBody.mileage,
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
        message: "Service created successfully",
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
