import mongoose, { Document, Model } from "mongoose";

export interface IClan {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    ownerId: string;
    ownerName: string;
    members: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IClanDocument extends IClan, Document {
    createdAt: Date;
    updatedAt: Date;
}

const clanSchema = new mongoose.Schema<IClanDocument>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    ownerId: { type: String, required: true },
    ownerName: { type: String, required: true },
    members: [{ type: String }],
}, { timestamps: true });

export const Clan: Model<IClanDocument> =
    mongoose.models?.Clan || mongoose.model<IClanDocument>("Clan", clanSchema);

export interface IWorldChatMessage {
    clanId: string;
    senderId: string;
    senderName: string;
    senderUsername: string;
    senderImage?: string;
    content: string;
    createdAt?: Date;
}

export interface IWorldChatMessageDocument extends IWorldChatMessage, Document {
    createdAt: Date;
}

const worldChatMessageSchema = new mongoose.Schema<IWorldChatMessageDocument>({
    clanId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderUsername: { type: String, required: true },
    senderImage: { type: String, default: "" },
    content: { type: String, required: true },
}, { timestamps: true });

export const WorldChatMessage: Model<IWorldChatMessageDocument> =
    mongoose.models?.WorldChatMessage || mongoose.model<IWorldChatMessageDocument>("WorldChatMessage", worldChatMessageSchema);
