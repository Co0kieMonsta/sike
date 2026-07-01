import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key"
);

// PUT - Update service
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Optional Check
    // if (!session) { ... }
    
    const { id } = await params;
    const reqBody = await request.json();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("services")
      .update({
        type: reqBody.type,
        date: reqBody.date,
        status: reqBody.status,
        cost: reqBody.cost,
        technician: reqBody.technician,
        notes: reqBody.notes,
        mileage: reqBody.mileage,
        updated_at: now,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Service updated successfully",
      data: data[0],
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

// DELETE - Remove service
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Optional Check
    // if (!session) { ... }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("services")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Service deleted successfully",
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
