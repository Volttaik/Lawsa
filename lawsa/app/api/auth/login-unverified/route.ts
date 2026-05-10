import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmailOrUsername, updateUser } from "@/lib/queries";
import { signToken } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password, code } = await request.json();
    if (!emailOrUsername || !password || !code)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    const user = await getUserByEmailOrUsername(emailOrUsername);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id FROM users
       WHERE id = $1
         AND email_verification_code = $2
         AND email_verification_code != ''
         AND email_verification_code_expires > NOW()`,
      [user.id, String(code).trim()]
    );

    if (!rows.length) {
      // Give a clear reason so the user knows whether to resend or just retype
      const { rows: codeRows } = await pool.query(
        `SELECT email_verification_code_expires FROM users WHERE id = $1`,
        [user.id]
      );
      const expiry = codeRows[0]?.email_verification_code_expires;
      if (expiry && new Date(expiry) < new Date()) {
        return NextResponse.json(
          { error: "Your code has expired. Click 'Resend code' to get a new one." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Incorrect code. Please check your email and try again." },
        { status: 400 }
      );
    }

    await updateUser(user.id, {
      emailVerified: true,
      emailVerificationCode: "",
      emailVerificationCodeExpires: null,
    });

    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage || "",
    });

    const { password: _pw, ...safeUser } = user;
    const response = NextResponse.json({
      message: "Email verified and login successful",
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
    console.error("Login-unverified error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
