import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

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
        .setExpirationTime("7d")
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

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
    const token = request.cookies.get("lawsa-token")?.value;
    if (!token) return null;
    return await verifyToken(token);
}
