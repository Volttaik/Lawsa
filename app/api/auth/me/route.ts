import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getUserById, updateUserLastOnline } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sosa-socials-secret-key-2024-very-secure");

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sosa-token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let payload: { userId?: string } | null = null;
    try {
      const result = await jwtVerify(token, SECRET);
      payload = result.payload as { userId?: string };
    } catch {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!payload?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await updateUserLastOnline(payload.userId);
    const { password: _pw, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error("[/api/auth/me]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
