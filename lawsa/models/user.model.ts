import mongoose, { Document, Model } from "mongoose";

export interface IUser {
    name: string;
    username: string;
    email: string;
    password: string;
    profileImage?: string;
    bannerImage?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    skills?: string[];
    followers?: string[];
    following?: string[];
    connections?: string[];
    pendingConnections?: string[];
    lastOnline?: Date;
    clanId?: string;
    clanName?: string;
    clanLogo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    skills: [{ type: String }],
    followers: [{ type: String }],
    following: [{ type: String }],
    connections: [{ type: String }],
    pendingConnections: [{ type: String }],
    lastOnline: { type: Date, default: Date.now },
    clanId: { type: String, default: "" },
    clanName: { type: String, default: "" },
    clanLogo: { type: String, default: "" },
}, { timestamps: true });

export const User: Model<IUserDocument> =
    mongoose.models?.User || mongoose.model<IUserDocument>("User", userSchema);
