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

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
    // Check cookie first
    let token = request.cookies.get("lawsa-token")?.value;

    // Fall back to Authorization: Bearer <token> header
    if (!token) {
        const authHeader = request.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
    }

    if (!token) return null;
    return await verifyToken(token);
}
