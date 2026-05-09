import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Heart, ChatCircle, ArrowsClockwise, ShareNetwork, DotsThree, Trash, SpinnerGap, PencilSimpleLine } from "@phosphor-icons/react";
import { SealCheck } from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import Linkify from "@/components/Linkify";
import { useSession } from "@/components/SessionProvider";
import { timeAgo, fmtCount } from "@/lib/utils";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

function PostCard({ post, me, onLike, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const myId = me?.id || me?._id || "";
  const liked = (post.likes || []).includes(myId);
  const isAuthor = myId === post.authorId;
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const authorName = post.repostedFrom ? post.repostedFrom.authorName : post.authorName;
  const authorUsername = post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername;
  const authorImage = post.repostedFrom ? post.repostedFrom.authorImage : post.authorImage;
  const authorId = post.repostedFrom ? post.repostedFrom.authorId : post.authorId;
  const isSpecial = post.repostedFrom ? false : post.authorIsSpecial;
  const isVerified = post.repostedFrom ? false : post.authorIsVerified;

  const share = () => {
    const url = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(url).then(() => { setShareMsg("Link copied!"); setTimeout(() => setShareMsg(""), 2000); });
  };

  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.02] transition-colors">
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-12">
          <ArrowsClockwise className="w-3.5 h-3.5 text-green-500" /><span>Reposted</span>
        </div>
      )}
      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${authorId}`} className="flex-shrink-0">
          <Avatar src={authorImage} name={authorName} size={40} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Link href={`/dashboard/profile/${authorId}`} className="flex items-center gap-1 group">
              <span className="text-white font-bold text-sm group-hover:underline truncate">{authorName}</span>
              {isSpecial && <DiamondBadge size={14} />}
              {!isSpecial && isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400" weight="fill" />}
              <span className="text-gray-500 text-xs">@{authorUsername}</span>
              <span className="text-gray-600 text-xs">· {timeAgo(post.createdAt)}</span>
            </Link>
            {isAuthor && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                  <DotsThree size={18} weight="bold" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }} className="flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm hover:bg-white/10 w-full text-left">
                      <Trash size={14} />Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {content && <p className="text-white text-sm leading-relaxed mb-2 whitespace-pre-wrap"><Linkify text={content} /></p>}
          {imgs.length > 0 && (
            <div className={`grid gap-1 mb-2 rounded-xl overflow-hidden ${imgs.length === 1 ? "grid-cols-1" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {imgs.slice(0, 4).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-full object-cover rounded" style={{ maxHeight: imgs.length === 1 ? 400 : 200 }} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-6 mt-2">
            <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 text-sm transition-colors group ${liked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}>
              <Heart size={17} weight={liked ? "fill" : "regular"} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs">{fmtCount(post.likes?.length || 0)}</span>
            </button>
            <Link href={`/dashboard/profile/${authorId}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors">
              <ChatCircle size={17} /><span className="text-xs">{fmtCount(post.comments?.length || 0)}</span>
            </Link>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors">
              <ArrowsClockwise size={17} /><span className="text-xs">{fmtCount(post.reshares || 0)}</span>
            </button>
            <button onClick={share} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
              <ShareNetwork size={17} />
              {shareMsg && <span className="text-xs text-green-400">{shareMsg}</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const { user } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return;
    const off = reset ? 0 : offset;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?offset=${off}&limit=20`, { credentials: "include" });
      const data = await res.json();
      const newPosts = data.posts || [];
      if (reset) setPosts(newPosts); else setPosts(p => [...p, ...newPosts]);
      if (newPosts.length < 20) setHasMore(false);
      setOffset(off + newPosts.length);
    } catch {}
    setLoading(false);
  }, [offset, hasMore]);

  useEffect(() => { loadPosts(true); }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const post = (e as CustomEvent).detail;
      if (post) setPosts(p => [post, ...p]);
    };
    window.addEventListener("lawsa-new-post", handler);
    return () => window.removeEventListener("lawsa-new-post", handler);
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) return;
    const myId = user.id || user._id;
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const likes: string[] = p.likes || [];
      const liked = likes.includes(myId);
      return { ...p, likes: liked ? likes.filter((id: string) => id !== myId) : [...likes, myId] };
    }));
    fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  const handleDelete = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="max-w-[600px] mx-auto min-h-screen border-x border-[#2f3336]">
      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#2f3336] px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </div>
      {user && (
        <div className="border-b border-[#2f3336] px-4 py-3 flex gap-3">
          <Avatar src={user.profileImage} name={user.name} size={40} />
          <button onClick={() => window.dispatchEvent(new CustomEvent("lawsa-compose"))} className="flex-1 text-left text-gray-500 text-base hover:text-white transition-colors py-2">
            What's on your mind?
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent("lawsa-compose"))} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
            <PencilSimpleLine size={14} weight="bold" />Post
          </button>
        </div>
      )}
      {loading && posts.length === 0 ? (
        <div className="flex items-center justify-center py-16"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No posts yet. Be the first to post!</div>
      ) : (
        <>
          {posts.map(post => <PostCard key={post._id} post={post} me={user} onLike={handleLike} onDelete={handleDelete} />)}
          {hasMore && (
            <div className="py-6 text-center">
              <button onClick={() => loadPosts()} disabled={loading} className="px-6 py-2 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors disabled:opacity-50">
                {loading ? <SpinnerGap size={16} className="animate-spin inline" /> : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
