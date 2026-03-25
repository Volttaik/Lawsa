import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const notifications = await Notification.find({ recipientId: authUser.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        return NextResponse.json({ notifications: JSON.parse(JSON.stringify(notifications)) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        await Notification.updateMany({ recipientId: authUser.userId, read: false }, { read: true });
        return NextResponse.json({ message: "All marked as read" });
    } catch {
        return NextResponse.json({ error: "Failed to mark notifications" }, { status: 500 });
    }
}
