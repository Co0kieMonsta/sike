export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export async function GET(request) {
  try {
    const carsRef = collection(db, "cars");
    const q = query(carsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: cars,
      count: cars.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener vehículos",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      make, 
      model, 
      year, 
      vin_chassis, 
      licensePlate,
      engine,
      modifications,
      status,
      ownerName,
      ownerPhone,
      ownerEmail,
      client_id
    } = body;

    if (!make || !model || !ownerName) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields (make, model, or ownerName)" }, 
        { status: 400 }
      );
    }

    const carsRef = collection(db, "cars");

    const newCar = {
      make,
      model,
      year: year || null,
      vin_chassis: vin_chassis || null,
      licensePlate: licensePlate || null,
      engine: engine || null,
      modifications: modifications || null,
      status: status || 'en_taller',
      ownerName,
      ownerPhone: ownerPhone || null,
      ownerEmail: ownerEmail || null,
      client_id: client_id || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(carsRef, newCar);
    const createdData = { id: docRef.id, ...newCar };

    return NextResponse.json(
      {
        status: "success",
        message: "Vehículo registrado exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al registrar vehículo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
