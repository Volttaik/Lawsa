import { Metadata } from "next";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import PostRedirectClient from "./PostRedirectClient";

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  try {
    await connectDB();
    const post = await Post.findById(params.postId).lean() as {
      authorName?: string;
      authorUsername?: string;
      content?: string;
      images?: string[];
    } | null;

    if (!post) {
      return {
        title: "Post not found — Lawsa Socials",
        description: "This post is no longer available.",
      };
    }

    const headersList = headers();
    const host = headersList.get("host") || "lawsa.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const authorHandle = post.authorUsername
      ? `@${post.authorUsername}`
      : post.authorName || "Someone";
    const description = post.content?.slice(0, 200) || "View this post on Lawsa Socials";
    const title = `${authorHandle} on Lawsa Socials`;

    const rawImage = post.images?.[0];
    const ogImage = rawImage
      ? rawImage.startsWith("http")
        ? rawImage
        : `${baseUrl}${rawImage}`
      : `${baseUrl}/logo.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/post/${params.postId}`,
        siteName: "Lawsa Socials",
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Lawsa Socials — Connect, Share & Grow",
      description:
        "A modern social networking platform for students and professionals.",
    };
  }
}

export default function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  return <PostRedirectClient postId={params.postId} />;
}
