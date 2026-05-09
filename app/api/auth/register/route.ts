import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { getUserByEmail, getUserByEmailOrUsername, createUser, updateUser } from "@/lib/queries";
import { signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5000";
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, phone, dateOfBirth, profileImage } = await request.json();
    if (!name || !username || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await getUserByEmail(email);
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const existingByUsername = await getUserByEmailOrUsername(username);
    if (existingByUsername) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      profileImage,
      emailVerified: false,
    });

    if (!user) return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });

    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage || "",
    });

    const verificationToken = randomUUID();
    const baseUrl = getBaseUrl(request);

    updateUser(user.id, { emailVerificationToken: verificationToken })
      .then(() => sendVerificationEmail(user.email, user.name, verificationToken, baseUrl))
      .catch((err) => console.error("[register] Failed to send verification email:", err.message));

    const { password: _pw, ...safeUser } = user;

    const response = NextResponse.json({
      message: "Account created successfully",
      token: jwtToken,
      user: safeUser,
    }, { status: 201 });

    response.cookies.set("lawsa-token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
