import mongoose, { Document, Model } from "mongoose";

export interface IStory {
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorImage?: string;
    content: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IStoryDocument extends IStory, Document {
    createdAt: Date;
    updatedAt: Date;
}

const storySchema = new mongoose.Schema<IStoryDocument>({
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorImage: { type: String, default: "" },
    content: { type: String, default: "" },
    image: { type: String, default: "" },
}, { timestamps: true });

export const Story: Model<IStoryDocument> =
    mongoose.models?.Story || mongoose.model<IStoryDocument>("Story", storySchema);
