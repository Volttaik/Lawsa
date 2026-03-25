import mongoose, { Document, Model } from "mongoose";

export interface IMessage {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    receiverId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    read?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMessageDocument extends IMessage, Document {
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessageDocument>({
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderImage: { type: String, default: "" },
    receiverId: { type: String, required: true },
    content: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, default: "" },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export const Message: Model<IMessageDocument> =
    mongoose.models?.Message || mongoose.model<IMessageDocument>("Message", messageSchema);


export interface IConversation {
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: Map<string, number>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IConversationDocument extends IConversation, Document {
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new mongoose.Schema<IConversationDocument>({
    participants: [{ type: String, required: true }],
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: { type: Map, of: Number, default: {} },
    typingUsers: { type: Map, of: Date, default: {} },
}, { timestamps: true });

export const Conversation: Model<IConversationDocument> =
    mongoose.models?.Conversation || mongoose.model<IConversationDocument>("Conversation", conversationSchema);
