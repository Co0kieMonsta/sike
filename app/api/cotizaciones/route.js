
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper to get admin client for bypassing RLS if needed, 
// though we enabled public access, it's good practice for backend mutations.
const supabaseAdmin = supabase; 

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabase
      .from("cotizaciones")
      .select(`
        *,
        created_by_user:created_by(name),
        updated_by_user:updated_by(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cotizaciones:", error);
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { 
      cliente_nombre, 
      cliente_email, 
      cliente_direccion, 
      fecha, 
      fecha_vencimiento, 
      items, 
      notas 
    } = body;

    if (!cliente_nombre || !items || items.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Calculate total
    const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    // 2. Insert Cotización
    const { data: cotizacion, error: cotError } = await supabase
      .from("cotizaciones")
      .insert({
        cliente_nombre,
        cliente_email,
        cliente_direccion,
        fecha: fecha || new Date(),
        fecha_vencimiento,
        total,
        notas,
        created_by: session.user.id,
        updated_by: session.user.id,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (cotError) {
      console.error("Error creating cotizacion:", cotError);
      return new NextResponse(cotError.message, { status: 500 });
    }

    // 3. Insert Items
    const itemsToInsert = items.map(item => ({
      cotizacion_id: cotizacion.id,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      product_id: item.producto_id || null // Add product_id
      // total is generated always
    }));

    const { error: itemsError } = await supabase
      .from("detalles_cotizacion")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating details:", itemsError);
      // Ideally we would rollback here, but Supabase HTTP client doesn't support transactions easily.
      // We could delete the created cotizacion.
      await supabase.from("cotizaciones").delete().eq("id", cotizacion.id);
      return new NextResponse("Error creating quote details", { status: 500 });
    }

    return NextResponse.json(cotizacion);
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
