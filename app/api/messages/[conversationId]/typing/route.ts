import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Conversation } from "@/models/message.model";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ ok: false });
        await connectDB();
        const expiresAt = new Date(Date.now() + 3500);
        await Conversation.findByIdAndUpdate(
            params.conversationId,
            { $set: { [`typingUsers.${authUser.userId}`]: expiresAt } }
        );
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false });
    }
}
