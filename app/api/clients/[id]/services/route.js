import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  // Await params first (Next.js 15+ requirement)
  const { id } = await params;
  
  try {
    const { data: services, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("client_id", id)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      data: services,
      count: services.length,
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
