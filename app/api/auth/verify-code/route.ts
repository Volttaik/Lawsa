import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/queries";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND email_verification_code = $2 AND email_verification_code_expires > NOW()`,
      [authUser.userId, String(code)]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 400 });
    }

    await updateUser(authUser.userId, {
      emailVerified: true,
      emailVerificationCode: "",
      emailVerificationCodeExpires: null,
    });

    return NextResponse.json({ message: "Email verified. You now have your verified badge!" });
  } catch (e) {
    console.error("Verify code error:", e);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
