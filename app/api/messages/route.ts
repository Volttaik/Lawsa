import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Message, Conversation } from "@/models/message.model";
import { User } from "@/models/user.model";
import { Notification } from "@/models/notification.model";
import { saveBase64Media } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const conversations = await Conversation.find({
            participants: { $in: [authUser.userId] }
        }).sort({ lastMessageTime: -1 });

        const enriched = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.participants.find((p: string) => p !== authUser.userId);
            const other = otherId ? await User.findById(otherId).select("name username profileImage") : null;
            return { ...JSON.parse(JSON.stringify(conv)), otherUser: other ? JSON.parse(JSON.stringify(other)) : null };
        }));

        return NextResponse.json({ conversations: enriched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const { recipientId, content, mediaUrl, mediaData, mediaType } = await request.json();

        const hasContent = content?.trim();
        const hasMedia = mediaUrl || mediaData;
        if (!recipientId || (!hasContent && !hasMedia)) {
            return NextResponse.json({ error: "Recipient and content or media required" }, { status: 400 });
        }

        const participants = [authUser.userId, recipientId].sort();

        let savedMediaUrl = "";
        if (mediaUrl) {
            savedMediaUrl = mediaUrl;
        } else if (mediaData && mediaData.startsWith("data:")) {
            savedMediaUrl = await saveBase64Media(mediaData, "messages");
        }

        const lastMsg = content?.trim() || (mediaType === "image" ? "📷 Image" : mediaType === "video" ? "🎥 Video" : mediaType === "audio" ? "🎤 Voice note" : "📎 File");

        let conversation = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });
        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                lastMessage: lastMsg,
                lastMessageTime: new Date(),
            });
        } else {
            conversation.lastMessage = lastMsg;
            conversation.lastMessageTime = new Date();
            await conversation.save();
        }

        const currentUser = await User.findById(authUser.userId).select("profileImage");
        const senderImage = currentUser?.profileImage || "";

        const message = await Message.create({
            conversationId: conversation._id.toString(),
            senderId: authUser.userId,
            senderName: authUser.name,
            senderImage,
            receiverId: recipientId,
            content: content?.trim() || "",
            mediaUrl: savedMediaUrl,
            mediaType: savedMediaUrl ? (mediaType || "file") : "",
        });

        await Notification.create({
            recipientId,
            senderId: authUser.userId,
            senderName: authUser.name,
            senderImage,
            type: "message",
            message: `${authUser.name} sent you a message`,
        });

        return NextResponse.json({ message: JSON.parse(JSON.stringify(message)) }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
