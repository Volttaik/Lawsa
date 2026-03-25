import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Message, Conversation } from "@/models/message.model";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const [messages, conversation] = await Promise.all([
            Message.find({ conversationId: params.conversationId }).sort({ createdAt: 1 }),
            Conversation.findById(params.conversationId),
        ]);

        await Message.updateMany(
            { conversationId: params.conversationId, receiverId: authUser.userId, read: false },
            { read: true }
        );

        let otherUserOnline = false;
        let otherUserLastOnline: Date | null = null;
        let otherUserTyping = false;

        if (conversation) {
            const otherId = conversation.participants.find((p: string) => p !== authUser.userId);
            if (otherId) {
                const otherUser = await User.findById(otherId).select("lastOnline");
                if (otherUser?.lastOnline) {
                    otherUserLastOnline = otherUser.lastOnline;
                    otherUserOnline = (Date.now() - new Date(otherUser.lastOnline).getTime()) < 90 * 1000;
                }
                const typingMap = conversation.typingUsers as Map<string, Date> | undefined;
                if (typingMap) {
                    const typingExpiry = typingMap.get(otherId);
                    if (typingExpiry && new Date(typingExpiry).getTime() > Date.now()) {
                        otherUserTyping = true;
                    }
                }
            }
        }

        return NextResponse.json({
            messages: JSON.parse(JSON.stringify(messages)),
            otherUserOnline,
            otherUserLastOnline: otherUserLastOnline?.toISOString() || null,
            otherUserTyping,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
