import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationToken, updateUser } from "@/lib/queries";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5000";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/email-verified?status=invalid-token", request.url));
    }

    const user = await getUserByVerificationToken(token);
    if (!user) {
      return NextResponse.redirect(new URL("/email-verified?status=invalid-token", request.url));
    }

    if (user.emailVerified) {
      return NextResponse.redirect(new URL("/email-verified?status=already", request.url));
    }

    await updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: "",
    });

    sendWelcomeEmail(user.email, user.name, getBaseUrl(request)).catch(() => {});

    return NextResponse.redirect(new URL("/email-verified?status=success", request.url));
  } catch (e) {
    console.error("Verify email error:", e);
    return NextResponse.redirect(new URL("/email-verified?status=error", request.url));
  }
}
