import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ count: 0 });
        await connectDB();
        const count = await Notification.countDocuments({ recipientId: authUser.userId, read: false });
        return NextResponse.json({ count });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}
