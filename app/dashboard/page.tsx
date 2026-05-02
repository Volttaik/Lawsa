"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, BarChart2, Bookmark, Share, Loader2, Image as ImageIcon, X, Send, BadgeCheck, MoreHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import ReactTimeago from "react-timeago";

interface Post { _id: string; authorId: string; authorName: string; authorUsername: string; authorImage?: string; content: string; images?: string[]; videos?: string[]; likes?: string[]; comments?: any[]; reshares?: number; views?: number; repostedFrom?: any; createdAt: string; }
interface Me { id: string; _id?: string; name: string; username: string; profileImage?: string; isVerified?: boolean; following?: string[]; }

function Avatar({ src, name, size = 40, gold }: { src?: string; name: string; size?: number; gold?: boolean }) {
  const cls = gold ? "ring-2 ring-amber-400" : "";
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${cls}`} style={{ width: size, height: size }} />;
  return <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 ${cls}`} style={{ width: size, height: size, fontSize: size / 2.6 }}>{name?.[0]?.toUpperCase() || "S"}</div>;
}

function fmt(n: number) { if (n >= 1000000) return (n/1000000).toFixed(1)+"M"; if (n >= 1000) return (n/1000).toFixed(1)+"K"; return String(n); }

function PostCard({ post, me, onLike, onRepost, onBookmark, onDelete }: any) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const liked = (post.likes || []).includes(me?.id || me?._id || "");
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const MAX = 280;

  const submitComment = async (e: any) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    await fetch(`/api/posts/${post._id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: comment }) });
    setComment(""); setCommenting(false);
  };

  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-[#080808] transition-colors">
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-10">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>{post.authorName} reposted</span>
        </div>
      )}
      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${post.repostedFrom ? post.repostedFrom.authorId || post.authorId : post.authorId}`} className="flex-shrink-0">
          <Avatar src={post.repostedFrom ? post.repostedFrom.authorImage : post.authorImage} name={post.repostedFrom ? post.repostedFrom.authorName : post.authorName} size={40} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <Link href={`/dashboard/profile/${post.authorId}`} className="font-bold text-white hover:underline text-sm">{post.repostedFrom ? post.repostedFrom.authorName : post.authorName}</Link>
              <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-500 text-sm">@{post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm"><ReactTimeago date={post.createdAt} /></span>
            </div>
            {(me?.id === post.authorId || me?._id === post.authorId) && (
              <button onClick={() => onDelete(post._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-400/10 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
          {content && (
            <p className="text-white text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
              {!expanded && content.length > MAX ? <>{content.slice(0, MAX)}<button onClick={() => setExpanded(true)} className="text-blue-400 ml-1">...Show more</button></> : content}
            </p>
          )}
          {imgs.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-[#2f3336] relative ${imgs.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
              {imgs.length === 1 ? (
                <img src={imgs[0]} alt="" className="w-full max-h-[500px] object-cover" />
              ) : (
                imgs.slice(0, 4).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-48 object-cover" />
                ))
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 max-w-[300px]">
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs">{fmt((post.comments || []).length)}</span>
            </button>
            <button onClick={() => onRepost(post._id)} className="flex items-center gap-1.5 text-gray-500 hover:text-green-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-xs">{fmt(post.reshares || 0)}</span>
            </button>
            <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 transition-colors group ${liked ? "text-pink-500" : "text-gray-500 hover:text-pink-400"}`}>
              <div className={`p-2 rounded-full transition-colors ${liked ? "bg-pink-500/10" : "group-hover:bg-pink-400/10"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-pink-500" : ""}`} />
              </div>
              <span className="text-xs">{fmt((post.likes || []).length)}</span>
            </button>
            <button onClick={() => onBookmark(post._id)} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs">{fmt(post.views || 0)}</span>
            </button>
            <button onClick={() => onBookmark(post._id)} className="text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <Bookmark className="w-4 h-4" />
              </div>
            </button>
          </div>
          {showComments && (
            <div className="mt-3 border-t border-[#2f3336] pt-3">
              <form onSubmit={submitComment} className="flex gap-2 mb-3">
                <Avatar src={me?.profileImage} name={me?.name || "S"} size={28} />
                <div className="flex-1 flex gap-2">
                  <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Post your reply" className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none" />
                  <button type="submit" disabled={!comment.trim() || commenting} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold disabled:opacity-50">
                    {commenting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reply"}
                  </button>
                </div>
              </form>
              {(post.comments || []).slice(0, 3).map((c: any) => (
                <div key={c._id} className="flex gap-2 mb-2">
                  <Avatar src={c.authorImage} name={c.authorName} size={28} />
                  <div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-white font-bold">{c.authorName}</span>
                      <span className="text-gray-500">@{c.authorUsername}</span>
                    </div>
                    <p className="text-white text-xs mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ComposeBox({ me, onPost }: any) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !images.length) return;
    setPosting(true);
    const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content, images }) });
    const data = await res.json();
    if (data.post) { setContent(""); setImages([]); onPost(data.post); }
    setPosting(false);
  };

  return (
    <form onSubmit={submit} className="border-b border-[#2f3336] px-4 py-3">
      <div className="flex gap-3">
        <Avatar src={me?.profileImage} name={me?.name || "S"} size={40} />
        <div className="flex-1">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's happening?" rows={2}
            className="w-full bg-transparent text-white text-lg placeholder-gray-600 outline-none resize-none" />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-black rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2f3336]">
            <button type="button" onClick={() => fileRef.current?.click()} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
            <div className="flex items-center gap-3">
              {content.length > 0 && <span className={`text-sm ${content.length > 270 ? "text-red-400" : "text-gray-500"}`}>{280 - content.length}</span>}
              <button type="submit" disabled={(!content.trim() && !images.length) || posting || content.length > 280}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-full text-sm disabled:opacity-50 transition-colors flex items-center gap-1.5">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function FeedPage() {
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).then(d => { if (d.user) setMe(d.user); });
  }, []);

  const loadPosts = useCallback(async (pg: number, replace = false) => {
    pg === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await fetch(`/api/posts?page=${pg}&limit=15`);
      const data = await res.json();
      const newPosts: Post[] = data.posts || [];
      setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
      setHasMore(data.hasMore || false);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPosts(1, true); }, [loadPosts]);

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" });
    const uid = me?.id || me?._id || "";
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const liked = (p.likes || []).includes(uid);
      return { ...p, likes: liked ? (p.likes || []).filter(id => id !== uid) : [...(p.likes || []), uid] };
    }));
  };

  const handleRepost = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/repost`, { method: "POST", credentials: "include" });
    const data = await res.json();
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, reshares: data.reshares || p.reshares } : p));
  };

  const handleBookmark = async (postId: string) => {
    await fetch(`/api/posts/${postId}/bookmark`, { method: "POST", credentials: "include" });
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleNewPost = (post: Post) => { setPosts(prev => [post, ...prev]); setShowCompose(false); };

  const displayPosts = tab === "following" && me?.following?.length
    ? posts.filter(p => (me.following || []).includes(p.authorId))
    : posts;

  return (
    <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2f3336]">
        <h1 className="px-4 pt-3 pb-0 text-xl font-bold text-white">Home</h1>
        <div className="flex">
          {(["foryou", "following"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${tab === t ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {t === "foryou" ? "For you" : "Following"}
              {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      {me && <ComposeBox me={me} onPost={handleNewPost} />}

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">{tab === "following" ? "Follow people to see their posts" : "No posts yet"}</p>
        </div>
      ) : (
        <>
          {displayPosts.map(post => (
            <PostCard key={post._id} post={post} me={me}
              onLike={handleLike} onRepost={handleRepost} onBookmark={handleBookmark} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <button onClick={() => { const next = page + 1; setPage(next); loadPosts(next); }} disabled={loadingMore}
              className="w-full py-4 text-blue-400 text-sm hover:bg-[#0a0a0a] transition-colors">
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Show more"}
            </button>
          )}
        </>
      )}

      {/* Floating compose button (mobile) */}
      <button onClick={() => setShowCompose(true)} className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-20">
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Mobile compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 md:hidden" onClick={() => setShowCompose(false)}>
          <div className="bg-black border border-[#333] rounded-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <button onClick={() => setShowCompose(false)}><X className="w-5 h-5 text-gray-400" /></button>
              <span className="font-bold text-white">New post</span>
              <div />
            </div>
            {me && <ComposeBox me={me} onPost={handleNewPost} />}
          </div>
        </div>
      )}

      <div className="h-20 md:h-8" />
    </div>
  );
}
