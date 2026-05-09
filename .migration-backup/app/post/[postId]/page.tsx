import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPostById } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  try {
    const { postId } = await params;
    const post = await getPostById(postId);
    if (!post) return { title: "Post not found — Sosa" };
    const headersList = await headers();
    const host = headersList.get("host") || "sosa.app";
    const baseUrl = `https://${host}`;
    const authorHandle = post.authorUsername ? `@${post.authorUsername}` : post.authorName;
    const description = post.content?.slice(0, 200) || "View this post on Sosa";
    const title = `${authorHandle} on Sosa`;
    const images: string[] = post.images || [];
    const ogImage = images[0]?.startsWith("http") ? images[0] : `${baseUrl}/logo.png`;
    return {
      title,
      description,
      openGraph: { title, description, url: `${baseUrl}/post/${postId}`, siteName: "Sosa", images: [{ url: ogImage }], type: "article" },
      twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    };
  } catch {
    return { title: "Sosa — Connect, Share & Grow" };
  }
}

const AVATAR_COLORS = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];

function Avatar({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const color = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}>
      {initials}
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

async function PostView({ postId }: { postId: string }) {
  const post = await getPostById(postId);
  if (!post) notFound();

  const isRepost = !!post.repostedFrom;
  const authorName: string = isRepost ? post.repostedFrom.authorName : post.authorName;
  const authorUsername: string = isRepost ? post.repostedFrom.authorUsername : post.authorUsername;
  const authorImage: string = isRepost ? post.repostedFrom.authorImage : post.authorImage;
  const content: string = isRepost ? post.repostedFrom.content : post.content;
  const images: string[] = isRepost ? (post.repostedFrom.images || []) : (post.images || []);
  const likesCount = (post.likes || []).length;
  const commentsCount = (post as any).commentsCount || (post.comments || []).length;
  const comments: any[] = post.comments || [];

  const backHref = "/dashboard";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto border-x border-[#222] min-h-screen">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-[#222] px-4 py-3 flex items-center gap-4">
          <Link href={backHref} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Post</h1>
        </div>

        {/* Post */}
        <div className="px-4 pt-4 pb-3 border-b border-[#222]">
          {isRepost && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {post.authorName} reposted
            </div>
          )}

          <div className="flex gap-3 items-start">
            <Link href={`/dashboard/profile/${post.authorId}`}>
              <Avatar src={authorImage} name={authorName} size={48} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/profile/${post.authorId}`} className="hover:underline">
                <p className="font-bold text-white text-[16px] leading-tight">{authorName}</p>
                <p className="text-gray-500 text-sm">@{authorUsername}</p>
              </Link>
            </div>
          </div>

          {content && (
            <p className="text-white text-[18px] mt-4 leading-relaxed whitespace-pre-wrap break-words">{content}</p>
          )}

          {images.length > 0 && (
            <div className={`mt-4 rounded-2xl overflow-hidden border border-[#222] ${images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}`}>
              {images.map((img: string, i: number) => (
                <img key={i} src={img} alt="" className={`w-full object-cover ${images.length === 1 ? "max-h-[510px]" : "h-52"}`} />
              ))}
            </div>
          )}

          <p className="text-gray-500 text-sm mt-4">
            {new Date(post.createdAt).toLocaleString("en", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-b border-[#222] flex gap-6 text-sm">
          <span><strong className="text-white font-bold">{fmt(likesCount)}</strong> <span className="text-gray-500">Likes</span></span>
          <span><strong className="text-white font-bold">{fmt(commentsCount)}</strong> <span className="text-gray-500">Comments</span></span>
          <span><strong className="text-white font-bold">{fmt(post.reshares || 0)}</strong> <span className="text-gray-500">Reposts</span></span>
        </div>

        {/* Action bar */}
        <div className="px-4 py-3 border-b border-[#222]">
          <Link href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-full transition-colors text-sm">
            Open in feed to like, comment &amp; reply
          </Link>
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="divide-y divide-[#222]">
            {comments.map((c: any) => (
              <div key={c._id || c.id} className="px-4 py-3 flex gap-3">
                <Avatar src={c.authorImage} name={c.authorName || "?"} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-sm">{c.authorName}</span>
                    <span className="text-gray-500 text-sm">@{c.authorUsername}</span>
                  </div>
                  <p className="text-white text-sm mt-0.5 whitespace-pre-wrap break-words">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return <PostView postId={postId} />;
}
