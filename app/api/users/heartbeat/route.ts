import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ ok: false }, { status: 401 });
        await connectDB();
        await User.findByIdAndUpdate(authUser.userId, { lastOnline: new Date() });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
