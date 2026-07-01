import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") || "password";
  const hash = "$2b$10$dMXuOXQcX9QIPUSYuejutBwuKHZkOOhQTC7JnyGMCe";

  try {
    const match = await bcrypt.compare(password, hash);
    const newHash = await bcrypt.hash(password, 10);
    const matchNew = await bcrypt.compare(password, newHash);

    return NextResponse.json({
      inputPassword: password,
      targetHash: hash,
      isMatch: match,
      generatedHash: newHash,
      isMatchNew: matchNew
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
