import { Metadata } from "next";
import { headers } from "next/headers";
import { getPostById } from "@/lib/queries";
import PostRedirectClient from "./PostRedirectClient";

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  try {
    const post = await getPostById(params.postId);

    if (!post) {
      return {
        title: "Post not found — Sosa",
        description: "This post is no longer available.",
      };
    }

    const headersList = headers();
    const host = headersList.get("host") || "sosa.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const authorHandle = post.authorUsername
      ? `@${post.authorUsername}`
      : post.authorName || "Someone";
    const description = post.content?.slice(0, 200) || "View this post on Sosa";
    const title = `${authorHandle} on Sosa`;

    const images: string[] = Array.isArray(post.images) ? post.images : (typeof post.images === "string" ? JSON.parse(post.images || "[]") : []);
    const rawImage = images[0];
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
        siteName: "Sosa",
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
      title: "Sosa — Connect, Share & Grow",
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
