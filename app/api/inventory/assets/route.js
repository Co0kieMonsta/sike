export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const assetsRef = collection(db, "inventory_assets");
    const q = query(assetsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    // Join category names
    let assets = await Promise.all(snapshot.docs.map(async (docSnap) => {
      let assetData = { id: docSnap.id, ...docSnap.data() };
      if (assetData.category_id) {
         try {
           const catRef = doc(db, "inventory_categories", assetData.category_id);
           const catSnap = await getDoc(catRef);
           if(catSnap.exists()) {
             assetData.categoryName = catSnap.data().name;
           }
         } catch(e) {}
      }
      return assetData;
    }));

    return NextResponse.json({
      status: "success",
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener activos",
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
      name, 
      serial_number, 
      brand, 
      model,
      category_id, 
      purchase_price,
      purchase_date,
      location, 
      status, 
      description,
      assigned_to,
      imageUrl
    } = body;

    if (!name) {
      return NextResponse.json(
        { status: "fail", message: "Missing required field: name" }, 
        { status: 400 }
      );
    }

    const assetsRef = collection(db, "inventory_assets");

    const newAsset = {
      name,
      serial_number: serial_number || null,
      brand: brand || null,
      model: model || null,
      category_id: category_id || null,
      purchase_price: purchase_price ? Number(purchase_price) : 0,
      purchase_date: purchase_date || null,
      location: location || null,
      status: status || 'operativo',
      description: description || null,
      assigned_to: assigned_to || null,
      imageUrl: imageUrl || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(assetsRef, newAsset);
    const createdData = { id: docRef.id, ...newAsset };

    return NextResponse.json(
      {
        status: "success",
        message: "Activo creado exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear activo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
