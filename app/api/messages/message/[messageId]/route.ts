import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Message } from "@/models/message.model";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { messageId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const { content } = await request.json();
        if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

        const message = await Message.findById(params.messageId);
        if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
        if (message.senderId !== authUser.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        message.content = content.trim();
        message.edited = true;
        await message.save();

        return NextResponse.json({ message: JSON.parse(JSON.stringify(message)) });
    } catch {
        return NextResponse.json({ error: "Failed to edit message" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { messageId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const message = await Message.findById(params.messageId);
        if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
        if (message.senderId !== authUser.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        message.isDeleted = true;
        message.content = "";
        message.mediaUrl = "";
        message.mediaType = "";
        await message.save();

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
