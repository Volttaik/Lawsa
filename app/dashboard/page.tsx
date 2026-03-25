"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Trash2, Send, Loader2, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import ReactTimeago from "react-timeago";

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
  createdAt: string;
}

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  content: string;
  likes?: string[];
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  id: string;
  name: string;
  username: string;
  profileImage?: string;
}

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card overflow-hidden">
      <div className="skeleton w-full h-52" />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="skeleton rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-5/6" />
          <div className="skeleton h-3.5 w-4/6" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-7 w-20 rounded-lg" />
          <div className="skeleton h-7 w-14 rounded-lg ml-auto" />
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-900" style={{ minHeight: 200 }}>
      {!loaded && (
        <div className="absolute inset-0 skeleton rounded-xl flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play size={22} className="text-white ml-1" />
          </div>
        </div>
      )}
      <video
        src={src}
        controls
        preload="metadata"
        className={`w-full max-h-80 object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoadedData={() => setLoaded(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
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
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id || currentUser?.id || "") || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const isOwner = currentUser && (post.authorId === currentUser._id || post.authorId === currentUser.id);
  const hasMedia = (post.images && post.images.length > 0) || (post.videos && post.videos.length > 0);

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
    if (data.comment) {
      setComments([data.comment, ...comments]);
      setCommentText("");
    }
    setLoadingComment(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card overflow-hidden transition-shadow"
    >
      {/* Media FIRST before text */}
      {hasMedia && (
        <div className="w-full">
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-0.5 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Post"
                  className={`w-full object-cover ${post.images!.length === 1 ? "max-h-96 rounded-t-2xl" : i === 0 ? "max-h-64" : "max-h-64"}`}
                />
              ))}
            </div>
          )}
          {post.videos && post.videos.length > 0 && (
            <div className="space-y-0.5">
              {post.videos.map((vid, i) => (
                <VideoPlayer key={i} src={vid} />
              ))}
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
              <Link href={`/dashboard/profile/${post.authorId}`} className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 transition-colors">
                {post.authorName}
              </Link>
              <div className="text-xs text-gray-500 dark:text-gray-400">@{post.authorUsername} · <ReactTimeago date={post.createdAt} /></div>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(post._id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-3 leading-relaxed">{post.content}</p>
      </div>

      <div className="px-4 py-2.5 border-t border-black/5 dark:border-white/5 mt-3 flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${liked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"}`}
        >
          <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={14} className={liked ? "fill-red-500" : ""} />
          </motion.div>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span className="hidden sm:block">Like</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={loadComments}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
        >
          <MessageCircle size={14} />
          {(post.comments?.length || 0) > 0 && <span>{post.comments?.length}</span>}
          <span className="hidden sm:block">Comment</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all ml-auto"
        >
          <Share2 size={14} />
          <span className="hidden sm:block">Share</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-black/5 dark:border-white/5 overflow-hidden"
          >
            {currentUser && (
              <div className="px-4 py-3 flex items-center gap-3">
                <Avatar src={currentUser.profileImage} name={currentUser.name} size={28} />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full pl-4 pr-10 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    disabled={loadingComment || !commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors"
                  >
                    {loadingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2.5"
                >
                  <Avatar src={comment.authorImage} name={comment.authorName} size={26} />
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-black/5 dark:border-white/5">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{comment.authorName}</div>
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

export default function DashboardHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/posts?page=1&limit=10").then((r) => r.json()),
    ]).then(([userData, postsData]) => {
      setCurrentUser(userData.user || null);
      setPosts(postsData.posts || []);
      setHasMore(postsData.hasMore || false);
      setPage(1);
      setLoading(false);
    });
  }, []);

  const loadPosts = async (p = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const res = await fetch(`/api/posts?page=${p}&limit=10`);
    const data = await res.json();
    if (p === 1) setPosts(data.posts || []);
    else setPosts((prev) => [...prev, ...(data.posts || [])]);
    setHasMore(data.hasMore || false);
    setPage(p);
    setLoading(false);
    setLoadingMore(false);
  };

  const handleDeletePost = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-12 text-center"
        >
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">No posts yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Tap the <span className="font-semibold text-blue-600">+</span> button below to share something!</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <PostCard
                post={post}
                currentUser={currentUser}
                onDelete={handleDeletePost}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadPosts(page + 1)}
            disabled={loadingMore}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover transition-all"
          >
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
            Load more
          </motion.button>
        </div>
      )}
    </div>
  );
}
