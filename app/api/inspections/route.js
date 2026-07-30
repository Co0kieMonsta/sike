export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, getDocs, where } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('car_id');

    let q = collection(db, "car_inspections");
    
    if (carId) {
      q = query(q, where("car_id", "==", carId), orderBy("created_at", "desc"));
    } else {
      q = query(q, orderBy("created_at", "desc"));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { status: "fail", message: "Error al obtener recepciones", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      car_id, 
      client_id, 
      fuel_level, 
      mileage, 
      exterior_damage, 
      valuables, 
      photos,
      notes,
      calendar_event_id
    } = body;

    // car_id will be required once we link it properly, but for calendar it might not be linked yet in the backend unless selected. 
    // Wait, the calendar currently just stores "vehiculo: string" as text!
    // So car_id might be null or text. Let's just save whatever we have.

    const inspectionsRef = collection(db, "car_inspections");

    const newInspection = {
      car_id: car_id || null,
      car_name: body.car_name || null, // fallback if car is just a string
      client_id: client_id || null,
      client_name: body.client_name || null,
      fuel_level: fuel_level || "1/2",
      mileage: mileage ? Number(mileage) : 0,
      exterior_damage: exterior_damage || [],
      valuables: valuables || [],
      photos: photos || [],
      notes: notes || null,
      calendar_event_id: calendar_event_id || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(inspectionsRef, newInspection);
    const createdData = { id: docRef.id, ...newInspection };

    return NextResponse.json(
      {
        status: "success",
        message: "Recepción guardada exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al guardar la recepción",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
