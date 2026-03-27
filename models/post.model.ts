import mongoose, { Document, Model } from "mongoose";

export interface IRepostedFrom {
    _id: string;
    authorName: string;
    authorUsername: string;
    authorImage?: string;
    content: string;
    images?: string[];
}

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
    repostedFrom?: IRepostedFrom;
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
    content: { type: String, default: "" },
    images: [{ type: String }],
    videos: [{ type: String }],
    likes: [{ type: String }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    shares: [{ type: String }],
    reshares: { type: Number, default: 0 },
    category: { type: String, default: "general" },
    repostedFrom: {
        _id: { type: String },
        authorName: { type: String },
        authorUsername: { type: String },
        authorImage: { type: String },
        content: { type: String },
        images: [{ type: String }],
    },
}, { timestamps: true });

export const Post: Model<IPostDocument> =
    mongoose.models?.Post || mongoose.model<IPostDocument>("Post", postSchema);
