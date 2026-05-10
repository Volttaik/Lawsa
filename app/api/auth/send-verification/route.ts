import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/queries";
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
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified." });
    }

    const token = randomUUID();
    await updateUser(user.id, { emailVerificationToken: token });

    try {
      await sendVerificationEmail(user.email, user.name, token, getBaseUrl(request));
    } catch (emailErr: any) {
      return NextResponse.json(
        { error: emailErr.message || "Failed to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Verification email sent. Please check your inbox." });
  } catch (e) {
    console.error("Send verification error:", e);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 500 });
  }
}
