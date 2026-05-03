"use server";
import { revalidatePath } from "next/cache";
import { getServerUser } from "./server-auth";
import { createPost, deletePost, createComment } from "./queries";

export const createPostAction = async (content: string, imageBase64?: string) => {
  const user = await getServerUser();
  if (!user) throw new Error("User not authenticated");
  if (!content?.trim()) throw new Error("Content is required");

  await createPost({
    authorId: user.userId,
    authorName: user.name,
    authorUsername: user.username,
    authorImage: user.profileImage || "",
    content: content.trim(),
    images: imageBase64 ? [imageBase64] : [],
  });
  revalidatePath("/dashboard");
};

export const getAllPosts = async () => {
  try {
    const { getPosts } = await import("./queries");
    return await getPosts({ limit: 50 });
  } catch {
    return [];
  }
};

export const deletePostAction = async (postId: string) => {
  const user = await getServerUser();
  if (!user) throw new Error("User not authenticated.");
  await deletePost(postId);
  revalidatePath("/dashboard");
};

export const createCommentAction = async (postId: string, content: string) => {
  const user = await getServerUser();
  if (!user) throw new Error("User not authenticated");
  if (!content?.trim()) throw new Error("Content required");

  await createComment({
    postId,
    authorId: user.userId,
    authorName: user.name,
    authorUsername: user.username,
    authorImage: user.profileImage || "",
    content: content.trim(),
  });
  revalidatePath("/dashboard");
};
