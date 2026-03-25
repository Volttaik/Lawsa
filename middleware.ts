import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard"];
const authPrefixRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("lawsa-token")?.value;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuth = pathname === "/" || authPrefixRoutes.some((r) => pathname.startsWith(r));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "lawsa-socials-secret-key-2024-very-secure");
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("lawsa-token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        path: "/",
      });
      return response;
    }
  }

  if (isAuth && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "lawsa-socials-secret-key-2024-very-secure");
      await jwtVerify(token, secret);
      const dashboardUrl = new URL("/dashboard", request.url);
      const postId = request.nextUrl.searchParams.get("post");
      const profileId = request.nextUrl.searchParams.get("profile");
      if (postId) dashboardUrl.searchParams.set("post", postId);
      if (profileId) dashboardUrl.searchParams.set("profile", profileId);
      return NextResponse.redirect(dashboardUrl);
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|api).*)" ],
};
