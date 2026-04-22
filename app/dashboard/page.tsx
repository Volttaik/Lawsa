"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { cache } from "@/lib/cache";
import {
  Heart, MessageCircle, Share2, Trash2, Send, Loader2, ChevronDown, Play,
  UserPlus, UserCheck, LayoutGrid, Globe, Scale, Cpu, Trophy, Newspaper,
  BookOpen, Briefcase, CalendarDays, HeartPulse, Music, Palette, Sparkles,
  Plus, X, ArrowUp, RefreshCw, Check, ExternalLink, ChevronLeft, ChevronRight,
  ZoomIn, Maximize, Pause, Repeat2,
} from "lucide-react";
import Linkify from "@/components/Linkify";
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

interface RepostedFrom {
  _id: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  content: string;
  images?: string[];
}

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
  reshares?: number;
  repostedFrom?: RepostedFrom;
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

interface LightboxItem {
  url: string;
  type: "image" | "video";
}

/* ── Helpers ── */

function FadeImg({
  src, alt, className, onClick,
}: { src: string; alt: string; className?: string; onClick?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  if (!src || errored) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className || ""} ${onClick ? "cursor-zoom-in" : ""}`}
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
      onClick={onClick}
    />
  );
}

function VideoPlayer({ src, onClick }: { src: string; onClick?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>("16 / 9");

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2800);
  }, []);

  const revealControls = () => {
    setShowControls(true);
    if (playing) scheduleHide();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); scheduleHide(); }
    else { v.pause(); setPlaying(false); setShowControls(true); if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) { onClick(); return; }
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setProgress(v.duration ? v.currentTime / v.duration : 0);
    if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1) / v.duration);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  useEffect(() => () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }, []);

  if (!src || errored) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ aspectRatio, background: "#000" }}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={revealControls}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        muted={muted}
        loop={false}
        className="w-full h-full block object-cover"
        onError={() => setErrored(true)}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (!v) return;
          setDuration(v.duration || 0);
          if (v.videoWidth && v.videoHeight) {
            setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setShowControls(true); setProgress(0); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Big centre play button when paused */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center shadow-[0_2px_24px_0_rgba(0,0,0,0.5)]">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 bottom-0 pointer-events-none"
          >
            {/* Gradient fade */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            {/* Control bar */}
            <div className="relative z-10 flex items-center gap-2.5 px-3 pb-3 pt-2 pointer-events-auto">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-7 h-7 flex items-center justify-center text-white hover:text-white/80 transition-colors flex-shrink-0"
              >
                {playing
                  ? <Pause size={16} fill="white" />
                  : <Play size={16} fill="white" className="ml-0.5" />}
              </button>

              {/* Progress bar */}
              <div
                className="flex-1 h-1 bg-white/25 rounded-full relative cursor-pointer group/bar"
                onClick={handleScrub}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const onMove = (ev: MouseEvent) => {
                    const v = videoRef.current;
                    const el = e.currentTarget as HTMLDivElement;
                    if (!v || !v.duration) return;
                    const rect = el.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                    v.currentTime = ratio * v.duration;
                    setProgress(ratio);
                  };
                  const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                {/* Buffered */}
                <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${buffered * 100}%` }} />
                {/* Played */}
                <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>

              {/* Fullscreen / expand */}
              <button
                onClick={handleFullscreen}
                className="w-7 h-7 flex items-center justify-center text-white hover:text-white/80 transition-colors flex-shrink-0"
              >
                <Maximize size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Lightbox ── */
function Lightbox({
  items, startIndex, onClose,
}: { items: LightboxItem[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && idx > 0) setIdx(idx - 1);
      if (e.key === "ArrowRight" && idx < items.length - 1) setIdx(idx + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [idx, items.length, onClose]);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
      >
        <X size={20} />
      </button>
      {items.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
          {idx + 1} / {items.length}
        </div>
      )}
      {idx > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {idx < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight size={22} />
        </button>
      )}
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" ? (
          <img
            src={item.url}
            alt="Full view"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <video
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function PostSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-4 border-b border-black/8 dark:border-white/8">
      <div className="skeleton rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-3.5 w-28 rounded-full" />
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-3 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded-full" />
          <div className="skeleton h-3.5 w-4/5 rounded-full" />
          <div className="skeleton h-3.5 w-3/5 rounded-full" />
        </div>
        <div className="skeleton w-full h-48 rounded-2xl" />
        <div className="flex gap-6 pt-1">
          <div className="skeleton h-5 w-10 rounded-full" />
          <div className="skeleton h-5 w-10 rounded-full" />
          <div className="skeleton h-5 w-10 rounded-full" />
          <div className="skeleton h-5 w-8 rounded-full ml-auto" />
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

function PostCard({ post, currentUser, onDelete, onOpenLightbox }: {
  post: Post;
  currentUser: CurrentUser | null;
  onDelete: (id: string) => void;
  onOpenLightbox: (items: LightboxItem[], index: number) => void;
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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [reshareCount, setReshareCount] = useState(post.reshares || 0);
  const isOwner = currentUser && (post.authorId === currentUser._id || post.authorId === currentUser.id);

  const handleRepost = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${post._id}/repost`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setReposted(data.reposted);
        setReshareCount(data.reshares ?? 0);
      }
    } catch {}
  };

  const getVideoThumbnail = (videoUrl: string): Promise<File | null> =>
    new Promise((resolve) => {
      try {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.src = videoUrl;
        video.currentTime = 0.5;
        const onSeeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(blob ? new File([blob], "thumbnail.jpg", { type: "image/jpeg" }) : null);
          }, "image/jpeg", 0.85);
        };
        video.addEventListener("seeked", onSeeked, { once: true });
        video.addEventListener("error", () => resolve(null), { once: true });
        video.load();
      } catch { resolve(null); }
    });

  const getImageFile = async (imageUrl: string): Promise<File | null> => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      return new File([blob], `post.${ext}`, { type: blob.type });
    } catch { return null; }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    const previewText = post.content?.trim()
      ? `"${post.content.slice(0, 120)}${post.content.length > 120 ? "…" : ""}"\n\n`
      : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      setShareLoading(true);
      try {
        let files: File[] = [];
        if (validImages.length > 0) {
          const f = await getImageFile(validImages[0]);
          if (f && navigator.canShare?.({ files: [f] })) files = [f];
        } else if (validVideos.length > 0) {
          const f = await getVideoThumbnail(validVideos[0]);
          if (f && navigator.canShare?.({ files: [f] })) files = [f];
        }
        await navigator.share({
          title: `${post.authorName} on Lawsa Socials`,
          text: previewText,
          url: postUrl,
          ...(files.length > 0 ? { files } : {}),
        } as ShareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setShowShareSheet(true);
      } finally {
        setShareLoading(false);
      }
    } else {
      setShowShareSheet(true);
    }
  };

  const validImages = (post.images || []).filter(Boolean);
  const validVideos = (post.videos || []).filter(Boolean);
  const hasMedia = validImages.length > 0 || validVideos.length > 0;

  const allMediaItems: LightboxItem[] = [
    ...validImages.map((url) => ({ url, type: "image" as const })),
    ...validVideos.map((url) => ({ url, type: "video" as const })),
  ];

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
      id={post._id}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3 px-4 pt-3 border-b border-black/[0.07] dark:border-white/10 hover:bg-black/[0.018] dark:hover:bg-white/[0.025] transition-colors cursor-default post-card-hover"
    >
      {/* Left: Avatar column */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <Link href={`/dashboard/profile/${post.authorId}`} className="block">
          <Avatar src={post.authorImage} name={post.authorName} size={44} />
        </Link>
      </div>

      {/* Right: All content */}
      <div className="flex-1 min-w-0 pb-2.5">
        {/* Repost label */}
        {post.repostedFrom?._id && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            <Repeat2 size={11} />
            <span>{post.authorName} reposted</span>
          </div>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 min-w-0 leading-tight overflow-hidden">
            <Link href={`/dashboard/profile/${post.authorId}`}
              className="font-bold text-[14.5px] text-gray-900 dark:text-white hover:underline truncate post-title">
              {post.authorName}
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-[13px] truncate">@{post.authorUsername}</span>
            <span className="text-gray-400 dark:text-gray-600 text-[13px]">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-[13px] flex-shrink-0 whitespace-nowrap">
              <ReactTimeago date={post.createdAt} />
            </span>
            {post.category && post.category !== "general" && (
              <><span className="text-gray-400 dark:text-gray-600 text-[13px]">·</span><CategoryBadge category={post.category} /></>
            )}
          </div>
          {isOwner && (
            <button onClick={() => onDelete(post._id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0 ml-1">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Text content */}
        {(post.content || !post.repostedFrom?._id) && post.content && (
          <Linkify
            text={post.content}
            className="text-[14.5px] text-gray-900 dark:text-gray-100 leading-[1.45] whitespace-pre-wrap break-words mb-2.5 block post-body"
          />
        )}

        {/* Media */}
        {hasMedia && (
          <div className="rounded-2xl overflow-hidden border border-black/8 dark:border-white/10 mb-2.5">
            {validImages.length > 0 && (
              <div className={`grid gap-0.5 ${validImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {validImages.map((img, i) => (
                  <FadeImg
                    key={i}
                    src={img}
                    alt="Post"
                    className={`w-full block ${validImages.length === 1 ? "max-h-[640px] object-cover" : "aspect-square object-cover"}`}
                    onClick={() => onOpenLightbox(allMediaItems, i)}
                  />
                ))}
              </div>
            )}
            {validVideos.length > 0 && (
              <div className="space-y-0.5">
                {validVideos.map((vid, i) => (
                  <VideoPlayer
                    key={i}
                    src={vid}
                    onClick={() => onOpenLightbox(allMediaItems, validImages.length + i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reposted-from embedded card */}
        {post.repostedFrom?._id && (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-900/60 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Avatar src={post.repostedFrom.authorImage} name={post.repostedFrom.authorName} size={18} />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">@{post.repostedFrom.authorUsername || post.repostedFrom.authorName}</span>
            </div>
            {(post.repostedFrom.images || []).filter(Boolean).length > 0 && (
              <img src={post.repostedFrom.images![0]} alt="" className="w-full max-h-48 object-cover rounded-lg mb-2" />
            )}
            <Linkify
              text={post.repostedFrom.content}
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words line-clamp-5"
            />
          </div>
        )}

        {/* Action bar — X style: just icons + counts */}
        <div className="flex items-center justify-between -ml-2 mt-0.5 mb-0.5">
          {/* Comment */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 600, damping: 25 }}
            onClick={loadComments}
            className="group flex items-center gap-1.5 px-2 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <MessageCircle size={18} />
            {(post.comments?.length || 0) > 0 && <span className="text-[13px]">{post.comments?.length}</span>}
          </motion.button>

          {/* Repost */}
          {!post.repostedFrom?._id && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 600, damping: 25 }}
              onClick={handleRepost}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all ${
                reposted
                  ? "text-green-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
              }`}>
              <motion.div animate={reposted ? { rotate: [0, 180, 360] } : {}} transition={{ duration: 0.45, ease: "easeInOut" }}>
                <Repeat2 size={18} />
              </motion.div>
              {reshareCount > 0 && <span className="text-[13px]">{reshareCount}</span>}
            </motion.button>
          )}

          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            transition={{ type: "spring", stiffness: 600, damping: 25 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all ${
              liked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}>
            <motion.div
              animate={liked ? { scale: [1, 1.5, 0.9, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Heart size={18} className={liked ? "fill-red-500" : ""} />
            </motion.div>
            {likesCount > 0 && (
              <motion.span key={likesCount} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }} className="text-[13px]">
                {likesCount}
              </motion.span>
            )}
          </motion.button>

          {/* Share */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            transition={{ type: "spring", stiffness: 600, damping: 25 }}
            onClick={handleShare}
            disabled={shareLoading}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-60">
            {shareLoading ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
          </motion.button>
        </div>

        {/* Top comment preview */}
        {!showComments && (post.comments as unknown as Comment[])?.length > 0 && (() => {
          const topComment = (post.comments as unknown as Comment[])[0];
          if (!topComment?.content) return null;
          return (
            <div className="mt-2">
              <div className="flex gap-2 items-start">
                <Avatar src={topComment.authorImage} name={topComment.authorName} size={20} />
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-black/5 dark:border-white/5 min-w-0">
                  <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mr-1.5">@{topComment.authorUsername || topComment.authorName}</span>
                  <span className="text-[11px] text-gray-600 dark:text-gray-300 break-words line-clamp-2">{topComment.content}</span>
                </div>
              </div>
              {(post.comments as unknown as Comment[]).length > 1 && (
                <button onClick={loadComments} className="mt-1.5 ml-7 text-[12px] text-blue-500 hover:text-blue-600 font-medium transition-colors">
                  View all {(post.comments as unknown as Comment[]).length} comments
                </button>
              )}
            </div>
          );
        })()}

        {/* Comments panel */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="border-t border-black/5 dark:border-white/5 mt-3 overflow-hidden">
              {currentUser && (
                <div className="py-3 flex items-center gap-3">
                  <Avatar src={currentUser.profileImage} name={currentUser.name} size={28} />
                  <div className="flex-1 relative">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full pl-4 pr-10 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()} />
                  <button onClick={handleComment} disabled={loadingComment || !commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors">
                    {loadingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div className="pb-3 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
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

      {/* ── Share sheet ── */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            onClick={() => setShowShareSheet(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Share post</span>
                <button onClick={() => setShowShareSheet(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <X size={15} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-4 gap-2">
                {[
                  { name: "WhatsApp", bg: "#25D366", label: "WA", url: `https://wa.me/?text=${encodeURIComponent(`${post.content?.slice(0, 100) || ""}\n\n${window.location.origin}/post/${post._id}`)}` },
                  { name: "Telegram", bg: "#229ED9", label: "TG", url: `https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}&text=${encodeURIComponent(post.content?.slice(0, 100) || "")}` },
                  { name: "Twitter", bg: "#000000", label: "𝕏", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.content?.slice(0, 100) || ""}\n${window.location.origin}/post/${post._id}`)}` },
                  { name: "Facebook", bg: "#1877F2", label: "f", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}` },
                ].map(({ name, bg, label, url }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                    onClick={() => setShowShareSheet(false)}
                    className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                      style={{ backgroundColor: bg }}>
                      {label}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{name}</span>
                  </a>
                ))}
              </div>
              <div className="px-4 pb-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/post/${post._id}`;
                    navigator.clipboard?.writeText(url).catch(() => {
                      const ta = document.createElement("textarea");
                      ta.value = url; document.body.appendChild(ta);
                      ta.select(); document.execCommand("copy");
                      document.body.removeChild(ta);
                    });
                    setShowShareSheet(false);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2200);
                  }}
                  className="w-full py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                  {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                  {copied ? "Link copied!" : "Copy link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
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
        className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-black/10 transition-all ${isFollowing ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
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
    if (postId) {
      onPostId(postId);
      window.history.replaceState(null, "", "/dashboard");
    }
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
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const openLightbox = (items: LightboxItem[], index: number) => {
    setLightboxItems(items);
    setLightboxIndex(index);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-4">

      {/* Shared post param reader */}
      <Suspense fallback={null}>
        <SharedPostLoader onPostId={handleSharedPost} />
      </Suspense>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItems && (
          <Lightbox
            items={lightboxItems}
            startIndex={lightboxIndex}
            onClose={() => setLightboxItems(null)}
          />
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-y-auto max-h-[85vh]"
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
                    {(sharedPost.images || []).filter(Boolean).length > 0 && (
                      <img src={(sharedPost.images || [])[0]} alt="Post" className="w-full max-h-56 object-cover rounded-xl mb-3" />
                    )}
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
                    <button onClick={() => {
                        const postId = sharedPost._id;
                        setSharedPost(null);
                        setTimeout(() => {
                          const el = document.getElementById(postId);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.style.transition = "box-shadow 0.3s ease";
                            el.style.boxShadow = "0 0 0 2px #3b82f6";
                            setTimeout(() => { el.style.boxShadow = ""; }, 1800);
                          }
                        }, 300);
                      }}
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
      <div className="sticky top-12 z-30 -mx-4 px-4 py-2.5 bg-[#e8ecf0]/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-black/6 dark:border-white/5 mb-4">
        <div ref={filterScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button key={cat.id}
                whileTap={{ scale: 0.90 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#dde1e7] dark:hover:bg-gray-700 border border-black/8 dark:border-white/8 shadow-soft"
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
                <button onClick={(e) => { e.stopPropagation(); if (viewingStory > 0) setViewingStory(viewingStory - 1); }}
                  disabled={viewingStory === 0}
                  className="text-white/60 disabled:opacity-30 text-sm font-medium px-4 py-2 hover:text-white transition-colors">
                  ← Prev
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (viewingStory < stories.length - 1) setViewingStory(viewingStory + 1); else setViewingStory(null); }}
                  className="text-white/60 text-sm font-medium px-4 py-2 hover:text-white transition-colors">
                  {viewingStory < stories.length - 1 ? "Next →" : "Close"}
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Feed */}
      <div className="overflow-hidden">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No posts yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <div key={post._id}>
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  onDelete={handleDeletePost}
                  onOpenLightbox={openLightbox}
                />
                {i === 3 && recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-black/8 dark:border-white/8"
                  >
                    <div className="px-4 pt-3 pb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">People you may know</h3>
                    </div>
                    <div className="divide-y divide-black/5 dark:divide-white/5 pb-1">
                      {recommendations.slice(0, 4).map((rec) => (
                        <RecommendedCard
                          key={rec._id}
                          user={rec}
                          isFollowing={following.has(rec._id)}
                          onFollow={() => handleFollow(rec._id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-4 border-t border-black/8 dark:border-white/8">
                <button
                  onClick={() => loadPosts(page + 1)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mx-auto px-6 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                  {loadingMore ? "Loading…" : "Load more posts"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
