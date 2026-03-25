"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { cache } from "@/lib/cache";
import {
  Heart, MessageCircle, Share2, Trash2, Send, Loader2, ChevronDown, Play,
  UserPlus, UserCheck, LayoutGrid, Globe, Scale, Cpu, Trophy, Newspaper,
  BookOpen, Briefcase, CalendarDays, HeartPulse, Music, Palette, Sparkles,
  Plus, X, ArrowUp, RefreshCw, Check, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import ReactTimeago from "react-timeago";

const POLL_INTERVAL = 15000;

interface CategoryDef { id: string; label: string; Icon: React.ElementType }

const CATEGORIES: CategoryDef[] = [
  { id: "all",      label: "All",      Icon: LayoutGrid },
  { id: "general",  label: "General",  Icon: Globe },
  { id: "law",      label: "Law",      Icon: Scale },
  { id: "tech",     label: "Tech",     Icon: Cpu },
  { id: "sports",   label: "Sports",   Icon: Trophy },
  { id: "news",     label: "News",     Icon: Newspaper },
  { id: "lectures", label: "Lectures", Icon: BookOpen },
  { id: "career",   label: "Career",   Icon: Briefcase },
  { id: "events",   label: "Events",   Icon: CalendarDays },
  { id: "health",   label: "Health",   Icon: HeartPulse },
  { id: "music",    label: "Music",    Icon: Music },
  { id: "art",      label: "Art",      Icon: Palette },
];

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  content: string;
  images?: string[];
  videos?: string[];
  likes?: string[];
  comments?: Comment[];
  category?: string;
  createdAt: string;
}

interface Story {
  _id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  content: string;
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  following?: string[];
}

interface RecommendedUser {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  followers?: string[];
}

/* ── Helpers ── */

function FadeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  if (!src || errored) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className || ""}`}
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
    />
  );
}

function VideoPlayer({ src }: { src: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return null;
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-900">
      <video
        src={src}
        controls
        preload="metadata"
        playsInline
        className="w-full max-h-80 block"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card overflow-hidden">
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="skeleton rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-5/6" />
          <div className="skeleton h-3.5 w-3/5" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-7 w-20 rounded-lg" />
          <div className="skeleton h-7 w-14 rounded-lg ml-auto" />
        </div>
      </div>
    </div>
  );
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  if (src) return (
    <img
      src={src}
      alt={name}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat || cat.id === "general") return null;
  const { Icon } = cat;
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
      <Icon size={9} /> {cat.label}
    </span>
  );
}

function PostCard({ post, currentUser, onDelete }: {
  post: Post;
  currentUser: CurrentUser | null;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [liked, setLiked] = useState(
    post.likes?.includes(currentUser?._id || currentUser?.id || "") || false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [copied, setCopied] = useState(false);
  const isOwner = currentUser && (post.authorId === currentUser._id || post.authorId === currentUser.id);

  const handleShare = () => {
    const url = `${window.location.origin}/?post=${post._id}`;
    const copy = (text: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => fallback(text));
      } else {
        fallback(text);
      }
    };
    const fallback = (text: string) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    };
    copy(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const validImages = (post.images || []).filter(Boolean);
  const validVideos = (post.videos || []).filter(Boolean);
  const hasMedia = validImages.length > 0 || validVideos.length > 0;

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    const res = await fetch(`/api/posts/${post._id}/comments`);
    const data = await res.json();
    setComments(data.comments || []);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    const res = await fetch(`/api/posts/${post._id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    const data = await res.json();
    if (data.comment) { setComments([data.comment, ...comments]); setCommentText(""); }
    setLoadingComment(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card overflow-hidden"
    >
      {hasMedia && (
        <div className="w-full">
          {validImages.length > 0 && (
            <div className={`grid gap-0.5 overflow-hidden ${validImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {validImages.map((img, i) => (
                <FadeImg key={i} src={img} alt="Post"
                  className={`w-full object-cover ${validImages.length === 1 ? "max-h-96 rounded-t-2xl" : "max-h-64"}`} />
              ))}
            </div>
          )}
          {validVideos.length > 0 && (
            <div className="space-y-0.5">
              {validVideos.map((vid, i) => <VideoPlayer key={i} src={vid} />)}
            </div>
          )}
        </div>
      )}

      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/profile/${post.authorId}`}>
              <Avatar src={post.authorImage} name={post.authorName} size={40} />
            </Link>
            <div>
              <Link href={`/dashboard/profile/${post.authorId}`}
                className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 transition-colors">
                @{post.authorUsername}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap mt-0.5">
                <ReactTimeago date={post.createdAt} />
                {post.category && post.category !== "general" && (
                  <><span>·</span><CategoryBadge category={post.category} /></>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <button onClick={() => onDelete(post._id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-3 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      <div className="px-4 py-2.5 border-t border-black/5 dark:border-white/5 mt-3 flex items-center gap-1">
        <motion.button whileTap={{ scale: 0.82 }} onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${liked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
          <motion.div animate={liked ? { scale: [1, 1.6, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={14} className={liked ? "fill-red-500" : ""} />
          </motion.div>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span className="hidden sm:block">Like</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.82 }} onClick={loadComments}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          <MessageCircle size={14} />
          {(post.comments?.length || 0) > 0 && <span>{post.comments?.length}</span>}
          <span className="hidden sm:block">Comment</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.82 }} onClick={handleShare}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto ${
            copied
              ? "text-green-600 bg-green-50 dark:bg-green-900/20"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}>
          <motion.div animate={copied ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.25 }}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
          </motion.div>
          <span className="hidden sm:block">{copied ? "Copied!" : "Share"}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-black/5 dark:border-white/5 overflow-hidden">
            {currentUser && (
              <div className="px-4 py-3 flex items-center gap-3">
                <Avatar src={currentUser.profileImage} name={currentUser.name} size={28} />
                <div className="flex-1 relative">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full pl-4 pr-10 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()} />
                  <button onClick={handleComment} disabled={loadingComment || !commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors">
                    {loadingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {comments.map((comment, i) => (
                <motion.div key={comment._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }} className="flex gap-2.5">
                  <Avatar src={comment.authorImage} name={comment.authorName} size={26} />
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-black/5 dark:border-white/5">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">@{comment.authorUsername || comment.authorName}</div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</div>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RecommendedCard({ user, isFollowing, onFollow }: {
  user: RecommendedUser;
  isFollowing: boolean;
  onFollow: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => { setLoading(true); await onFollow(); setLoading(false); };
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <Link href={`/dashboard/profile/${user._id}`} className="flex-shrink-0">
        <Avatar src={user.profileImage} name={user.name} size={40} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/profile/${user._id}`}>
          <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors truncate">{user.name}</p>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
        {(user.followers?.length || 0) > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">{user.followers?.length} followers</p>
        )}
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={handleClick} disabled={loading}
        className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-black/10 transition-all ${isFollowing ? "bg-gray-100 dark:bg-gray-800 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
        {loading ? <Loader2 size={11} className="animate-spin" /> : isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
        {isFollowing ? "Following" : "Follow"}
      </motion.button>
    </motion.div>
  );
}

/* ── Main Page ── */

function SharedPostLoader({ onPostId }: { onPostId: (id: string) => void }) {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");
  useEffect(() => {
    if (postId) onPostId(postId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
  return null;
}

export default function DashboardHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sharedPost, setSharedPost] = useState<Post | null>(null);
  const [sharedPostLoading, setSharedPostLoading] = useState(false);

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topPostIdRef = useRef<string | null>(null);
  const activeCategoryRef = useRef("all");
  activeCategoryRef.current = activeCategory;

  /* ── Fetch helpers ── */

  const fetchPosts = useCallback(async (cat = "all", p = 1) => {
    const res = await fetch(`/api/posts?page=${p}&limit=10&category=${cat}`);
    return res.json();
  }, []);

  const fetchStories = useCallback(async () => {
    const res = await fetch("/api/stories");
    return res.json().catch(() => ({ stories: [] }));
  }, []);

  /* ── Initial load ── */

  useEffect(() => {
    cache.invalidate("dashboard:initial");

    const init = async () => {
      setLoading(true);
      const [userData, postsData, recsData, storiesData] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetchPosts("all", 1),
        fetch("/api/users/recommendations").then((r) => r.json()).catch(() => ({ users: [] })),
        fetchStories(),
      ]);

      const freshPosts: Post[] = postsData.posts || [];
      setCurrentUser(userData.user || null);
      setFollowing(new Set(userData.user?.following || []));
      setPosts(freshPosts);
      setHasMore(postsData.hasMore || false);
      setPage(1);
      setRecommendations(recsData.users || []);
      setStories(storiesData.stories || []);
      setLoading(false);
      topPostIdRef.current = freshPosts[0]?._id || null;
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Background polling ── */

  const checkForNewPosts = useCallback(async () => {
    if (activeCategoryRef.current !== "all") return;
    try {
      const data = await fetch("/api/posts?page=1&limit=1&category=all").then((r) => r.json());
      const latestId = data.posts?.[0]?._id;
      if (latestId && latestId !== topPostIdRef.current && topPostIdRef.current !== null) {
        setNewPostsAvailable(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    pollRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [checkForNewPosts]);

  /* ── Visibility refresh ── */

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        checkForNewPosts();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [checkForNewPosts]);

  /* ── Load new posts (banner tap) ── */

  const loadNewPosts = useCallback(async () => {
    setRefreshing(true);
    setNewPostsAvailable(false);
    try {
      const data = await fetchPosts(activeCategory, 1);
      const freshPosts: Post[] = data.posts || [];
      setPosts(freshPosts);
      setHasMore(data.hasMore || false);
      setPage(1);
      topPostIdRef.current = freshPosts[0]?._id || null;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory, fetchPosts]);

  /* ── Category change ── */

  const loadPosts = useCallback(async (p = 1, cat = activeCategory) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await fetchPosts(cat, p);
      if (p === 1) {
        const freshPosts: Post[] = data.posts || [];
        setPosts(freshPosts);
        topPostIdRef.current = freshPosts[0]?._id || null;
        setNewPostsAvailable(false);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }
      setHasMore(data.hasMore || false);
      setPage(p);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, fetchPosts]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadPosts(1, cat);
  };

  /* ── Actions ── */

  const handleDeletePost = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts((prev) => {
      const next = prev.filter((p) => p._id !== postId);
      topPostIdRef.current = next[0]?._id || null;
      return next;
    });
  };

  const handleFollow = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    const data = await res.json();
    if (data.following) setFollowing((prev) => new Set([...prev, userId]));
    else setFollowing((prev) => { const s = new Set(prev); s.delete(userId); return s; });
  };

  const handleSharedPost = useCallback(async (postId: string) => {
    setSharedPostLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.post) setSharedPost(data.post);
    } catch {}
    setSharedPostLoading(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">

      {/* Shared post param reader */}
      <Suspense fallback={null}>
        <SharedPostLoader onPostId={handleSharedPost} />
      </Suspense>

      {/* Shared post modal */}
      <AnimatePresence>
        {(sharedPost || sharedPostLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setSharedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", damping: 22, stiffness: 320 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {sharedPostLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                </div>
              ) : sharedPost && (
                <>
                  <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <ExternalLink size={13} className="text-blue-500" />
                      Shared post
                    </div>
                    <button onClick={() => setSharedPost(null)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                      <X size={15} />
                    </button>
                  </div>
                  {(sharedPost.images || []).filter(Boolean).length > 0 && (
                    <img src={(sharedPost.images || [])[0]} alt="Post" className="w-full max-h-56 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {sharedPost.authorImage
                        ? <img src={sharedPost.authorImage} alt={sharedPost.authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">{sharedPost.authorName?.[0]?.toUpperCase()}</div>
                      }
                      <div>
                        <Link href={`/dashboard/profile/${sharedPost.authorId}`} onClick={() => setSharedPost(null)}
                          className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                          @{sharedPost.authorUsername || sharedPost.authorName}
                        </Link>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <ReactTimeago date={sharedPost.createdAt} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
                      {sharedPost.content}
                    </p>
                    {((sharedPost.likes?.length || 0) > 0 || (sharedPost.comments?.length || 0) > 0) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-gray-400">
                        {(sharedPost.likes?.length || 0) > 0 && (
                          <span className="flex items-center gap-1"><Heart size={12} className="fill-red-400 text-red-400" /> {sharedPost.likes?.length}</span>
                        )}
                        {(sharedPost.comments?.length || 0) > 0 && (
                          <span className="flex items-center gap-1"><MessageCircle size={12} /> {sharedPost.comments?.length}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => setSharedPost(null)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
                      View in Feed
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New posts banner */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={loadNewPosts}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-2xl transition-all active:scale-95"
            >
              {refreshing
                ? <Loader2 size={15} className="animate-spin" />
                : <ArrowUp size={15} />}
              New posts available
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter Strip */}
      <div className="sticky top-12 z-30 -mx-4 px-4 py-2 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 mb-4">
        <div ref={filterScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button key={cat.id} whileTap={{ scale: 0.93 }}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-btn"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                <Icon size={12} /> {cat.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stories Bar */}
      {stories.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {currentUser && (
              <Link href={`/dashboard/profile/${currentUser._id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                  <Plus size={18} className="text-blue-500" />
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[56px]">Your Story</span>
              </Link>
            )}
            {stories.map((story, i) => (
              <button key={story._id} onClick={() => setViewingStory(i)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5 overflow-hidden">
                  {story.image
                    ? <img src={story.image} alt={story.authorName} className="w-full h-full rounded-full object-cover" />
                    : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        {story.authorImage
                          ? <img src={story.authorImage} alt={story.authorName} className="w-full h-full rounded-full object-cover" />
                          : <span className="text-white font-bold text-lg">{story.authorName?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                    )
                  }
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[56px]">{story.authorName.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory !== null && stories.length > 0 && (() => {
          const story = stories[viewingStory];
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black flex flex-col"
              onClick={() => setViewingStory(null)}
            >
              <div className="flex gap-1 p-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full"
                      style={{ width: i < viewingStory ? "100%" : i === viewingStory ? "50%" : "0%" }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  {story.authorImage
                    ? <img src={story.authorImage} alt={story.authorName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">{story.authorName?.[0]?.toUpperCase()}</div>
                  }
                </div>
                <span className="text-white font-semibold text-sm">{story.authorName}</span>
                <button onClick={(e) => { e.stopPropagation(); setViewingStory(null); }} className="ml-auto text-white/70 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6" onClick={(e) => e.stopPropagation()}>
                {story.image && <img src={story.image} alt="" className="max-w-full max-h-[55vh] rounded-2xl object-contain" />}
                {story.content && <p className="text-white text-xl font-semibold text-center leading-relaxed drop-shadow-lg max-w-sm">{story.content}</p>}
              </div>
              <div className="flex justify-between px-8 pb-10">
                <button onClick={(e) => { e.stopPropagation(); setViewingStory(Math.max(0, viewingStory - 1)); }}
                  className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-xl bg-white/10">‹ Prev</button>
                <button onClick={(e) => { e.stopPropagation(); if (viewingStory < stories.length - 1) setViewingStory(viewingStory + 1); else setViewingStory(null); }}
                  className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-xl bg-white/10">Next ›</button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => <PostSkeleton key={i} />)
        ) : (
          <>
            {posts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Nothing here yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {activeCategory === "all"
                    ? "Tap the + button below to share something!"
                    : `No posts in the "${CATEGORIES.find((c) => c.id === activeCategory)?.label}" category yet.`}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {posts.map((post, i) => (
                  <motion.div key={post._id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <PostCard post={post} currentUser={currentUser} onDelete={handleDeletePost} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {recommendations.length > 0 && posts.length > 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus size={14} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">People you may know</h3>
                </div>
                <div className="space-y-1">
                  {recommendations.slice(0, 4).map((user) => (
                    <RecommendedCard key={user._id} user={user}
                      isFollowing={following.has(user._id)}
                      onFollow={() => handleFollow(user._id)} />
                  ))}
                </div>
                <Link href="/dashboard/connect"
                  className="block text-center text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                  See all suggestions
                </Link>
              </motion.div>
            )}
          </>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center pt-2 pb-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => loadPosts(page + 1)} disabled={loadingMore}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover transition-all">
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
              Load more
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
