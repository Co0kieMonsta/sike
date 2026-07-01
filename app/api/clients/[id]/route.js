import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Create private admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Fetch single client
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      data: client,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "fail",
        message: "Client not found or error occurred",
        error: error.message,
      },
      { status: 404 }
    );
  }
}

// PUT - Update client
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const reqBody = await request.json();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update({
        name: reqBody.name,
        email: reqBody.email,
        phone: reqBody.phone,
        address: reqBody.address,
        car_brand: reqBody.car_brand,
        car_model: reqBody.car_model,
        car_color: reqBody.car_color,
        car_plate: reqBody.car_plate,
        status: reqBody.status,
        updated_at: now,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Client updated successfully",
      data: data[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "fail",
        message: "Error updating client",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Client deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "fail",
        message: "Error deleting client",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
