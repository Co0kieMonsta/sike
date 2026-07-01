
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("cotizaciones")
      .select(`
        *,
        detalles_cotizacion (*),
        created_by_user:created_by(name),
        updated_by_user:updated_by(name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("cotizaciones")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting quote:", error);
      return new NextResponse(error.message, { status: 500 });
    }

    return new NextResponse("Deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      cliente_nombre, 
      cliente_email, 
      cliente_direccion, 
      fecha, 
      fecha_vencimiento, 
      items, 
      notas,
      estado
    } = body;

    // 1. Calculate new total
    const total = items ? items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) : 0;

    // 2. Update Cotización
    const { error: cotError } = await supabase
      .from("cotizaciones")
      .update({
        cliente_nombre,
        cliente_email,
        cliente_direccion,
        fecha,
        fecha_vencimiento,
        total,
        notas,
        estado,
        updated_by: session.user.id,
        updated_at: new Date()
      })
      .eq("id", id);

    if (cotError) {
      return new NextResponse(cotError.message, { status: 500 });
    }

    // 3. Update Items (Delete all and recreate - simplest strategy for now)
    if (items) {
        // Delete existing
        await supabase.from("detalles_cotizacion").delete().eq("cotizacion_id", id);

        // Insert new
        const itemsToInsert = items.map(item => ({
            cotizacion_id: id,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            product_id: item.producto_id || null // Add product_id
        }));

        const { error: itemsError } = await supabase
            .from("detalles_cotizacion")
            .insert(itemsToInsert);
            
        if (itemsError) {
            console.error("Error updating items:", itemsError);
            return new NextResponse("Error updating items", { status: 500 });
        }
    }

    return new NextResponse("Updated successfully", { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
