import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmailOrUsername, updateUser } from "@/lib/queries";
import { signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5000";
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json();
    if (!emailOrUsername || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    const user = await getUserByEmailOrUsername(emailOrUsername);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    if (!user.emailVerified) {
      const verificationToken = randomUUID();
      const baseUrl = getBaseUrl(request);
      updateUser(user.id, { emailVerificationToken: verificationToken })
        .then(() => sendVerificationEmail(user.email, user.name, verificationToken, baseUrl))
        .catch((err) => console.error("[login] Failed to resend verification email:", err.message));
      return NextResponse.json({ error: "Please verify your email before signing in. A new verification link has been sent to your inbox.", requiresVerification: true }, { status: 403 });
    }

    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage || "",
    });

    const { password: _pw, ...safeUser } = user;

    const response = NextResponse.json({
      message: "Login successful",
      token: jwtToken,
      user: safeUser,
    });

    response.cookies.set("lawsa-token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
