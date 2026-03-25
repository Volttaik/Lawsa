import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "lawsa-socials-secret-key-2024-very-secure"
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("lawsa-token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        let payload: { userId?: string } | null = null;
        try {
            const result = await jwtVerify(token, SECRET);
            payload = result.payload as { userId?: string };
        } catch {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        if (!payload?.userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(
            payload.userId,
            { lastOnline: new Date() },
            { new: true, select: "-password" }
        );
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[/api/auth/me] Error:", msg);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
