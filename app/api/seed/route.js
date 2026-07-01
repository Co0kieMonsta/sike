import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    const usersRef = collection(db, "system_users");
    const snapshot = await getDocs(usersRef);

    if (!snapshot.empty) {
      return NextResponse.json({
        message: "Users collection is not empty. Seeding aborted.",
      });
    }

    // Create initial admin
    const hashedPassword = await bcrypt.hash("password", 10);
    
    const adminUser = {
      name: "Sike Admin",
      email: "admin@sike.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
      image: "/images/avatar/avatar-3.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await addDoc(usersRef, adminUser);

    return NextResponse.json({
      message: "Admin user created successfully",
      user: { id: docRef.id, ...adminUser }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
