import mongoose, { Document, Model } from "mongoose";

export interface IPost {
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorImage?: string;
    content: string;
    images?: string[];
    videos?: string[];
    likes?: string[];
    comments?: mongoose.Types.ObjectId[];
    shares?: string[];
    reshares?: number;
    category?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPostDocument extends IPost, Document {
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPostDocument>({
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorImage: { type: String, default: "" },
    content: { type: String, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
    likes: [{ type: String }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    shares: [{ type: String }],
    reshares: { type: Number, default: 0 },
    category: { type: String, default: "general" },
}, { timestamps: true });

export const Post: Model<IPostDocument> =
    mongoose.models?.Post || mongoose.model<IPostDocument>("Post", postSchema);
