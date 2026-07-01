import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

// Create a Supabase client with the SERVICE_ROLE_KEY to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    // Check if users exist
    const { count, error: countError } = await supabaseAdmin
      .from("system_users")
      .select("*", { count: 'exact', head: true });

    if (countError) throw countError;

    if (count > 0) {
      return NextResponse.json({
        message: "Users table is not empty. Seeding aborted.",
      });
    }

    // Create initial admin
    const hashedPassword = await bcrypt.hash("password", 10);
    
    const { data, error } = await supabaseAdmin
      .from("system_users")
      .insert([
        {
          name: "Dashtail Admin",
          email: "dashtail@codeshaper.net",
          password: hashedPassword,
          role: "admin",
          status: "active",
          image: "/images/avatar/avatar-3.jpg"
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: "Admin user created successfully",
      user: data[0]
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
