"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Share, Loader2, Image as ImageIcon, X, BadgeCheck, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import ReactTimeago from "react-timeago";

interface Post { _id: string; authorId: string; authorName: string; authorUsername: string; authorImage?: string; content: string; images?: string[]; videos?: string[]; likes?: string[]; comments?:[...any[]] & { length: number }; createdAt: string; reshares?: number; views?: number; repostedFrom?: Post; }
interface Me { id: string; _id?: string; name: string; username: string; profileImage?: string; isVerified?: boolean; following?: string[]; }

function Avatar({ src, name, size = 40, gold }: { src?: string; name: string; size?: number; gold?: boolean }) {
  const cls = gold ? "ring-2 ring-amber-400" : "";
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${cls}`} style={{ width: size, height: size }} />;
  return <img src="/logo.jpg" alt="Sosa" className={`rounded-full object-cover flex-shrink-0 ${cls}`} style={{ width: size, height: size }} />;
}

function fmt(n: number) { if (n >= 1000000) return (n/1000000).toFixed(1)+"M"; if (n >= 1000) return (n/1000).toFixed(1)+"K"; return String(n); }

function PostCard({ post, me, onLike, onRepost, onBookmark, onDelete, onEdit }: any) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const liked = (post.likes || []).includes(me?.id || me?._id || "");
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const MAX = 280;
  const isAuthor = (me?.id === post.authorId || me?._id === post.authorId || me?.id === post.repostedFrom?.authorId || me?._id === post.repostedFrom?.authorId);

  const submitComment = async (e: any) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    await fetch(`/api/posts/${post._id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: comment }) });
    setComment(""); setCommenting(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await fetch(`/api/posts/${post._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: editText }) });
    setEditing(false);
    onEdit();
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: "Sosa", text: content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard?post=${post._id}`);
      alert("Link copied to clipboard!");
    }
    setShowMenu(false);
  };

  return (
    <article className="border-b border-slate-700/50 px-4 py-3 hover:bg-slate-900/50 transition-colors">
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 ml-10">
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
              {post.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              <span className="text-gray-500 text-sm">@{post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm"><ReactTimeago date={post.createdAt} /></span>
            </div>
            {isAuthor && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-600 hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-blue-400/10 flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-20 min-w-[150px] overflow-hidden">
                    <button onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={handleShare} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                      <Share className="w-4 h-4" /> Share
                    </button>
                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {editing ? (
            <div className="mt-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-slate-800 text-white text-sm rounded-lg p-2 border border-slate-700 outline-none focus:border-blue-500 resize-none" rows={3} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleEdit} className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-bold transition-all">Save</button>
                <button onClick={() => { setEditing(false); setEditText(post.content); }} className="px-4 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-full transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {content && (
                <p className="text-white text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
                  {!expanded && content.length > MAX ? <>{content.slice(0, MAX)}<button onClick={() => setExpanded(true)} className="text-blue-400 ml-1">...Show more</button></> : content}
                </p>
              )}
            </>
          )}
          {imgs.length > 0 && !editing && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-slate-700/50 relative ${imgs.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
              {imgs.length === 1 ? (
                <img src={imgs[0]} alt="" className="w-full max-h-[500px] object-cover" />
              ) : (
                imgs.slice(0, 4).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-48 object-cover" />
                ))
              )}
            </div>
          )}
          {!editing && (
            <div className="flex items-center justify-between mt-3 max-w-[300px] text-gray-500">
              <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs">{fmt((post.comments || []).length)}</span>
              </button>
              <button onClick={() => onRepost(post._id)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                </div>
                <span className="text-xs">{fmt(post.reshares || 0)}</span>
              </button>
              <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 transition-colors group ${liked ? "text-pink-500" : "hover:text-pink-400"}`}>
                <div className={`p-2 rounded-full transition-colors ${liked ? "bg-pink-500/10" : "group-hover:bg-pink-400/10"}`}>
                  <Heart className={`w-4 h-4 ${liked ? "fill-pink-500" : ""}`} />
                </div>
                <span className="text-xs">{fmt((post.likes || []).length)}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                  <Share className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
          {showComments && !editing && (
            <div className="mt-3 border-t border-slate-700/50 pt-3">
              <form onSubmit={submitComment} className="flex gap-2 mb-3">
                <Avatar src={me?.profileImage} name={me?.name || "Sosa"} size={28} />
                <div className="flex-1 flex gap-2">
                  <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Reply here..." className="flex-1 bg-slate-800 text-white text-sm placeholder-gray-600 outline-none border border-slate-700 rounded-lg px-3 py-1 focus:border-blue-500" />
                  <button type="submit" disabled={!comment.trim() || commenting} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold disabled:opacity-50 hover:bg-blue-600 transition-all">
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
    <form onSubmit={submit} className="border-b border-slate-700/50 px-4 py-3">
      <div className="flex gap-3">
        <Avatar src={me?.profileImage} name={me?.name || "Sosa"} size={40} />
        <div className="flex-1">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={2}
            className="w-full bg-transparent text-white text-lg placeholder-gray-500 outline-none resize-none" />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-black rounded-full p-0.5 hover:bg-slate-800"><X className="w-3 h-3 text-white" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
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
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" });
    if (!res.ok) return;
    await loadPosts(1, true);
  };

  const handleRepost = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/repost`, { method: "POST", credentials: "include" });
    if (!res.ok) return;
    await loadPosts(1, true);
  };

  const handleBookmark = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/bookmark`, { method: "POST", credentials: "include" });
    if (!res.ok) return;
    await loadPosts(1, true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleEdit = () => {
    loadPosts(1, true);
  };

  const handleNewPost = (post: Post) => { setPosts(prev => [post, ...prev]); setShowCompose(false); };

  const displayPosts = tab === "following" && me?.following?.length
    ? posts.filter(p => (me.following || []).includes(p.authorId))
    : posts;

  return (
    <div className="max-w-[600px] mx-auto border-x border-slate-700/50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-700/50">
        <h1 className="px-4 pt-3 pb-0 text-xl font-bold text-white">Home</h1>
        <div className="flex">
          {(["foryou", "following"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${tab === t ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {t === "foryou" ? "For you" : "Following"}
              {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />}
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
              onLike={handleLike} onRepost={handleRepost} onBookmark={handleBookmark} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
          {hasMore && (
            <button onClick={() => { const next = page + 1; setPage(next); loadPosts(next); }} disabled={loadingMore}
              className="w-full py-4 text-blue-400 text-sm hover:bg-slate-800/50 transition-colors">
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Show more"}
            </button>
          )}
        </>
      )}

      {/* Floating compose button (mobile) */}
      <button onClick={() => setShowCompose(true)} className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/50 hover:scale-110 transition-all">
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Mobile compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 md:hidden" onClick={() => setShowCompose(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
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
