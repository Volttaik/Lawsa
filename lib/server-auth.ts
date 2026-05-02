import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./auth";

export async function getServerUser(): Promise<JWTPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sosa-token")?.value;
        if (!token) return null;
        return await verifyToken(token);
    } catch {
        return null;
    }
}
