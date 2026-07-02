export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

// GET - Fetch all cotizaciones
export async function GET(request) {
  try {
    const cotizacionesRef = collection(db, "docs_cotizaciones");
    
    // Simplificamos la consulta a Firestore para evitar errores de índices compuestos
    const q = query(cotizacionesRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let cotizaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: cotizaciones,
      count: cotizaciones.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener cotizaciones",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new cotizacion
export async function POST(request) {
  try {
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

    if (!cliente_nombre || !items || items.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields (cliente_nombre or items)" }, 
        { status: 400 }
      );
    }

    // 1. Calculate total
    const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    // 2. Generate a sequential number (in a real app this should use a transaction or counter collection)
    const cotizacionesRef = collection(db, "docs_cotizaciones");
    const snapshot = await getDocs(cotizacionesRef);
    const numero = `COT-${String(snapshot.docs.length + 1).padStart(4, '0')}`;

    const newCotizacion = {
      numero,
      cliente_nombre,
      cliente_email: cliente_email || null,
      cliente_direccion: cliente_direccion || null,
      fecha: fecha || new Date().toISOString(),
      fecha_vencimiento: fecha_vencimiento || null,
      total,
      notas: notas || null,
      detalles_cotizacion: items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        producto_id: item.producto_id || null
      })),
      estado: estado || 'pendiente',
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(cotizacionesRef, newCotizacion);
    const createdData = { id: docRef.id, ...newCotizacion };

    return NextResponse.json(
      {
        status: "success",
        message: "Cotización creada exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear cotización",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
