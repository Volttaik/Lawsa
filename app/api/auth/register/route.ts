import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmailOrUsername, createUser } from "@/lib/queries";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, phone, dateOfBirth, profileImage } = await request.json();
    if (!name || !username || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await getUserByEmailOrUsername(email);
    if (existing) {
      return NextResponse.json({ error: existing.email === email.toLowerCase() ? "Email already in use" : "Username already taken" }, { status: 400 });
    }
    const existingByUsername = await getUserByEmailOrUsername(username);
    if (existingByUsername)
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser({ name, username, email, password: hashedPassword, phone, dateOfBirth, profileImage });
    if (!user) throw new Error("Failed to create user");

    const token = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name });
    const response = NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, name: user.name, username: user.username, email: user.email, profileImage: user.profileImage },
    }, { status: 201 });
    response.cookies.set("sosa-token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 60 * 60 * 24 * 30, path: "/" });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
