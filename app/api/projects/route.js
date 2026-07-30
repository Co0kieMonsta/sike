export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

// GET - Fetch all projects
export async function GET(request) {
  try {
    const projectsRef = collection(db, "projects");
    
    // Simplificamos la consulta a Firestore para evitar errores de índices compuestos
    const q = query(projectsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    let projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: "success",
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener proyectos",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      client, 
      description, 
      status, 
      startDate, 
      endDate, 
      budget,
      priority,
      carId,
      carName,
      inspectionId,
      inspectionDetails
    } = body;

    if (!title || !client) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields (title or client)" }, 
        { status: 400 }
      );
    }

    const projectsRef = collection(db, "projects");

    const newProject = {
      title,
      client,
      description: description || null,
      status: status || 'pending',
      priority: priority || 'media',
      carId: carId || null,
      carName: carName || null,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      budget: budget ? parseFloat(budget) : 0,
      inspectionId: inspectionId || null,
      inspectionDetails: inspectionDetails || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(projectsRef, newProject);
    const createdData = { id: docRef.id, ...newProject };

    return NextResponse.json(
      {
        status: "success",
        message: "Proyecto creado exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear proyecto",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
