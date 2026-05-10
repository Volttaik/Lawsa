import mongoose, { Document, Model } from "mongoose";

export type NotificationType = "like" | "comment" | "follow" | "connection" | "message" | "reshare" | "reply";

export interface INotification {
    recipientId: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    type: NotificationType;
    postId?: string;
    commentId?: string;
    message?: string;
    read?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotificationDocument extends INotification, Document {
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotificationDocument>({
    recipientId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderImage: { type: String, default: "" },
    type: { type: String, required: true, enum: ["like", "comment", "follow", "connection", "message", "reshare", "reply"] },
    postId: { type: String, default: null },
    commentId: { type: String, default: null },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification: Model<INotificationDocument> =
    mongoose.models?.Notification || mongoose.model<INotificationDocument>("Notification", notificationSchema);
