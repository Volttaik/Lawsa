"use server"

import { Post } from "@/models/post.model";
import connectDB from "./db";
import { revalidatePath } from "next/cache";
import { Comment } from "@/models/comment.model";
import { getServerUser } from "./server-auth";

export const createPostAction = async (content: string, imageBase64?: string) => {
    await connectDB();
    const user = await getServerUser();
    if (!user) throw new Error("User not authenticated");
    if (!content?.trim()) throw new Error("Content is required");

    await Post.create({
        authorId: user.userId,
        authorName: user.name,
        authorUsername: user.username,
        authorImage: user.profileImage || "",
        content: content.trim(),
        images: imageBase64 ? [imageBase64] : [],
        likes: [],
        comments: [],
    });
    revalidatePath("/dashboard");
};

export const getAllPosts = async () => {
    try {
        await connectDB();
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: "comments", options: { sort: { createdAt: -1 } } });
        if (!posts) return [];
        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const deletePostAction = async (postId: string) => {
    await connectDB();
    const user = await getServerUser();
    if (!user) throw new Error("User not authenticated.");
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found.");
    if (post.authorId !== user.userId) throw new Error("Not authorized.");
    await Post.deleteOne({ _id: postId });
    revalidatePath("/dashboard");
};

export const createCommentAction = async (postId: string, content: string) => {
    await connectDB();
    const user = await getServerUser();
    if (!user) throw new Error("User not authenticated");
    if (!content?.trim()) throw new Error("Content required");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    const comment = await Comment.create({
        postId,
        authorId: user.userId,
        authorName: user.name,
        authorUsername: user.username,
        authorImage: user.profileImage || "",
        content: content.trim(),
        likes: [],
    });

    post.comments?.push(comment._id as any);
    await post.save();
    revalidatePath("/dashboard");
};
