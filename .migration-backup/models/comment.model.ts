import mongoose, { Document, Model } from "mongoose";

export interface IComment {
    postId: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorImage?: string;
    content: string;
    likes?: string[];
    parentId?: string;
    replies?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICommentDocument extends IComment, Document {
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema<ICommentDocument>({
    postId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorImage: { type: String, default: "" },
    content: { type: String, required: true },
    likes: [{ type: String }],
    parentId: { type: String, default: null },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

export const Comment: Model<ICommentDocument> =
    mongoose.models?.Comment || mongoose.model<ICommentDocument>("Comment", commentSchema);
