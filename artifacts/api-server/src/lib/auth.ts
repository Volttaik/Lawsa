import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lawsa-socials-secret-key-2024-very-secure"
);

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  name: string;
  profileImage?: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: Request): Promise<JWTPayload | null> {
  let token = req.cookies?.["lawsa-token"];
  if (!token) {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) token = auth.slice(7);
  }
  if (!token) return null;
  return verifyToken(token);
}
