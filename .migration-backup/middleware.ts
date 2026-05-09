import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRedirectRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If already logged in (cookie present) and visiting login/register, redirect to dashboard
  const token = request.cookies.get("lawsa-token")?.value;
  if (token && authRedirectRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|api).*)"],
};
