export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const productsRef = collection(db, "inventory_products");
    const q = query(productsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    // Join category names
    let products = await Promise.all(snapshot.docs.map(async (docSnap) => {
      let productData = { id: docSnap.id, ...docSnap.data() };
      if (productData.category_id) {
         try {
           const catRef = doc(db, "inventory_categories", productData.category_id);
           const catSnap = await getDoc(catRef);
           if(catSnap.exists()) {
             productData.categoryName = catSnap.data().name;
           }
         } catch(e) {}
      }
      return productData;
    }));

    return NextResponse.json({
      status: "success",
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al obtener productos",
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
      sku, 
      brand, 
      category_id, 
      price, 
      cost, 
      stock, 
      location, 
      status, 
      description,
      imageUrl
    } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const productsRef = collection(db, "inventory_products");

    const newProduct = {
      name,
      sku: sku || null,
      brand: brand || null,
      category_id,
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      stock: stock ? Number(stock) : 0,
      location: location || null,
      status: status || 'active',
      description: description || null,
      imageUrl: imageUrl || null,
      created_by: "USR-001",
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(productsRef, newProduct);
    const createdData = { id: docRef.id, ...newProduct };

    if (newProduct.stock > 0) {
      const movementsRef = collection(db, "inventory_movements");
      await addDoc(movementsRef, {
        productId: docRef.id,
        type: "restock",
        quantity: newProduct.stock,
        oldStock: 0,
        newStock: newProduct.stock,
        addedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Producto creado exitosamente",
        data: createdData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Error al crear producto",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
