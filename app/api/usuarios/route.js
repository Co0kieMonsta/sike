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

// GET - Fetch all usuarios
export async function GET(request) {
  try {
    // Select with joins to get creator/updater names.
    // Note: This relies on Supabase detecting the Foreign Keys 'created_by' and 'updated_by'
    // pointing to 'system_users'. We alias them to avoid collisions.
    const { data: usuarios, error } = await supabaseAdmin
      .from("system_users")
      .select(`
        *,
        created_by_user:created_by(name),
        updated_by_user:updated_by(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      data: usuarios,
      count: usuarios.length,
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

// POST - Create new usuario
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("POST /api/usuarios SESSION:", JSON.stringify(session, null, 2));

    // Enforce Admin Only
    if (!session || session.user.role !== "admin") {
      console.log("Unauthorized access attempt. Role:", session?.user?.role);
      return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized: Only admins can create users",
        },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(reqBody.password, 10);

    const now = new Date().toISOString();

    // Create new user in DB
    const { data, error } = await supabaseAdmin
      .from("system_users")
      .insert([
        {
          name: reqBody.name,
          email: reqBody.email,
          password: hashedPassword,
          role: reqBody.role || "user",
          status: reqBody.status || "active",
          image: reqBody.image, // Optional
          phone: reqBody.phone,
          department: reqBody.department,
          position: reqBody.position,
          created_at: now,
          updated_at: now,
          created_by: session.user.id, // Track creator
          updated_by: session.user.id  // Initial updater is creator
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          {
            status: "fail",
            message: "El usuario con este email ya existe",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Usuario creado exitosamente",
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

