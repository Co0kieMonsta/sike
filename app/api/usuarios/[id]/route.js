import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Create private admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Fetch single usuario by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // In strict RLS, we might need admin client here if RLS is effectively "no one can read"
    // But usually reading is open or authenticated. Using admin client to be safe for now 
    // since we are replacing internal mock admin logic.
    const { data: usuario, error } = await supabaseAdmin
      .from("system_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !usuario) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: usuario,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update usuario
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Enforce Admin Only for updates
    if (!session || session.user.role !== "admin") {
       return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const reqBody = await request.json();

    const updates = { ...reqBody };
    delete updates.id; // Don't allow ID update
    delete updates.created_at; 
    delete updates.created_by; // Correctly preserve original creator
    
    // Track modification
    updates.updated_by = session.user.id;
    updates.updated_at = new Date().toISOString();
    
    // If password is present, hash it
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update in Supabase
    const { data, error } = await supabaseAdmin
      .from("system_users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found from single()
         return NextResponse.json(
          {
            status: "fail",
            message: "Usuario no encontrado",
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al actualizar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete usuario
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Enforce Admin Only
    if (!session || session.user.role !== "admin") {
       return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Prevent deleting self (optional safety)
    if (session.user.id === id) {
       return NextResponse.json(
        {
          status: "fail",
          message: "No puedes eliminar tu propia cuenta",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("system_users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
      data: null,
    });
  } catch (error) {
    console.log("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al eliminar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

