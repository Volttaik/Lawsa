"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart, ChatCircle, ArrowsClockwise, ShareNetwork, SpinnerGap,
  Image as ImageIcon, X, SealCheck, DotsThree, PencilSimple, Trash, VideoCamera,
  CaretLeft, CaretRight,
} from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import AvatarRing from "@/components/cosmetics/AvatarRing";
import UsernameCosmetic from "@/components/cosmetics/UsernameCosmetic";
import CosmeticBadge from "@/components/cosmetics/CosmeticBadge";
import ReactTimeago from "react-timeago";
import Linkify from "@/components/Linkify";
import ProgressiveImage from "@/components/ProgressiveImage";
import ShareModal from "@/components/ShareModal";
import VideoPlayer from "@/components/VideoPlayer";
import { uploadFile } from "@/lib/uploadClient";
import { Post, Me } from "@/types";
import { useSession } from "@/components/SessionProvider";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} loading="lazy" decoding="async" className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>
      {initials}
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function PostSkeleton() {
  return (
    <div className="border-b border-slate-700/50 px-4 py-4 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" style={{ animation: "shimmer 1.6s linear infinite", background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "200% 100%" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded-full bg-slate-800 w-1/3" style={{ animation: "shimmer 1.6s linear infinite", background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "200% 100%" }} />
        <div className="h-3 rounded-full bg-slate-800 w-full" style={{ animation: "shimmer 1.6s linear infinite", background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "200% 100%" }} />
        <div className="h-3 rounded-full bg-slate-800 w-4/5" style={{ animation: "shimmer 1.6s linear infinite", background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );
}

function LoginPrompt({ action }: { action: string }) {
  return (
    <div className="mt-3 border border-white/10 rounded-2xl p-4 text-center bg-black/40">
      <p className="text-gray-400 text-sm mb-3">Sign in to {action}</p>
      <div className="flex gap-2 justify-center">
        <Link href="/login" className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
          Sign in
        </Link>
        <Link href="/register" className="px-4 py-1.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}

function PostCard({ post, me, onLike, onRepost, onDelete, onEdit, onComment }: any) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [localComments, setLocalComments] = useState<any[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState<number>(
    typeof post.commentsCount === "number" ? post.commentsCount : (post.comments || []).length
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const myId = me?.id || me?._id || "";
  const liked = (post.likes || []).includes(myId);
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const isAuthor = myId && myId === post.authorId;
  const isLoggedIn = !!me;
  const cosm = post.repostedFrom ? undefined : (post.authorCosmetics as any);

  const POST_BORDER_COLOR: Record<string, string> = {
    post_border_gold: "#fbbf24", post_border_neon: "#22d3ee",
    post_border_rainbow: "#818cf8", post_glow_elite: "#f59e0b",
  };

  const BADGE_ACCENT: Record<string, string> = {
    badge_sovereign: "#f97316", badge_herald_purple: "#a855f7",
    badge_lion: "#fbbf24", badge_fist: "#b45309",
    badge_crown: "#fbbf24", badge_diamond: "#67e8f9",
    badge_fire: "#f97316", badge_lightning: "#a78bfa",
    badge_star: "#facc15", badge_crystal: "#38bdf8",
    badge_verified_plus: "#3b82f6", badge_amethyst: "#a855f7",
    badge_phoenix: "#f97316", badge_dragon: "#e879f9",
    badge_royal: "#8b5cf6", badge_warrior: "#ef4444",
    badge_azure: "#38bdf8", badge_inferno: "#fb923c",
    badge_frost: "#7dd3fc", badge_storm: "#a78bfa",
    badge_tidal: "#0ea5e9", badge_earth: "#22c55e",
    badge_galaxy: "#818cf8", badge_nova: "#fb923c",
    badge_solar: "#fbbf24", badge_lunar: "#e2e8f0",
    badge_void: "#7c3aed", badge_shadow: "#64748b",
    badge_demon: "#dc2626", badge_skull: "#94a3b8",
    badge_angel: "#fde68a", badge_divine: "#fbbf24",
    badge_tech: "#22d3ee", badge_neon: "#22d3ee",
    badge_matrix: "#22c55e", badge_gold: "#fbbf24",
    badge_ruby: "#f87171", badge_obsidian: "#7c3aed",
    badge_wind: "#34d399", badge_cosmic: "#818cf8",
    badge_crystal_herald: "#7dd3fc",
  };

  const badgeAccent = cosm?.badge ? BADGE_ACCENT[cosm.badge] : null;

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    if (!showComments) return;
    fetch(`/api/posts/${post._id}/comments`)
      .then(r => r.json())
      .then(d => { if (d.comments) { setLocalComments(d.comments); setCommentsCount(d.comments.length); } })
      .catch(() => {});
  }, [showComments, post._id]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !isLoggedIn) return;
    setCommenting(true);
    const res = await fetch(`/api/posts/${post._id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: comment }),
    });
    if (!res.ok) { setCommenting(false); return; }
    const data = await res.json();
    setComment(""); setCommenting(false);
    if (data.comment) {
      setLocalComments(prev => [data.comment, ...prev]);
      setCommentsCount(c => c + 1);
      onComment(post._id, data.comment);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await fetch(`/api/posts/${post._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: editText }),
    });
    setEditing(false);
    onEdit();
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/post/${post._id}`
    : `/post/${post._id}`;

  const handleLikeClick = () => {
    // Likes work without login — optimistic toggle, API call if logged in
    onLike(post._id);
  };

  const handleRepostClick = () => {
    if (!isLoggedIn) return;
    onRepost(post._id);
  };

  const borderColor = cosm?.postBorder ? POST_BORDER_COLOR[cosm.postBorder] : null;
  const postBgStyle: React.CSSProperties = borderColor
    ? { boxShadow: `inset 0 0 0 1px ${borderColor}55, 0 0 18px 2px ${borderColor}22`, borderColor: `${borderColor}66` }
    : {};

  const isSovereign = cosm?.badge === "badge_sovereign";

  return (
    <article
      className="relative border-b border-slate-700/50 px-4 py-3 hover:bg-slate-900/40 transition-colors"
      style={postBgStyle}
    >
      {isSovereign && <div className="fire-line-top" />}
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-12">
          <ArrowsClockwise className="w-3.5 h-3.5 text-green-500" />
          <span>{post.authorName} reposted</span>
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${post.repostedFrom ? post.repostedFrom.authorId || post.authorId : post.authorId}`} className="flex-shrink-0">
          <AvatarRing effectType={cosm?.avatarRing || ""} size={40}>
            <Avatar
              src={post.repostedFrom ? post.repostedFrom.authorImage : post.authorImage}
              name={post.repostedFrom ? post.repostedFrom.authorName : post.authorName}
              size={40}
            />
          </AvatarRing>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              <Link href={`/dashboard/profile/${post.authorId}`} className="font-bold text-white hover:underline text-[15px] truncate">
                <UsernameCosmetic effectType={cosm?.usernameEffect || ""} className="font-bold text-[15px]">
                  {post.repostedFrom ? post.repostedFrom.authorName : post.authorName}
                </UsernameCosmetic>
              </Link>
              {cosm?.badge && <CosmeticBadge effectType={cosm.badge} size={36} />}
              {!post.authorIsSpecial && post.authorIsVerified && <SealCheck className="w-4 h-4 text-yellow-400 flex-shrink-0" weight="fill" />}
              {!post.authorIsSpecial && !post.authorIsVerified && post.authorEmailVerified && <SealCheck className="w-4 h-4 text-amber-700 flex-shrink-0" weight="fill" />}
              {post.authorIsSpecial && <DiamondBadge size={16} />}
              {post.authorIsSpecial && post.authorIsVerified && <SealCheck className="w-4 h-4 text-amber-400 flex-shrink-0" weight="fill" />}
              <span className="text-gray-500 text-sm truncate">@{post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername}</span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-gray-500 text-sm flex-shrink-0"><ReactTimeago date={post.createdAt} /></span>
            </div>

            {isAuthor && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="text-gray-600 hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-400/10 transition-colors"
                >
                  <DotsThree className="w-4 h-4" weight="bold" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-20 min-w-[150px] overflow-hidden">
                    <button onClick={() => { setEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <PencilSimple className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => { setShareOpen(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <ShareNetwork className="w-4 h-4" /> Share
                    </button>
                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded-2xl p-3 border border-slate-700 outline-none focus:border-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleEdit} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full font-bold transition-colors">Save</button>
                <button onClick={() => { setEditing(false); setEditText(post.content); }} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-full transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            content && (
              <p className="text-white text-[15px] mt-0.5 leading-normal whitespace-pre-wrap break-words">
                <Linkify text={content} className="whitespace-pre-wrap break-words" linkClass="text-blue-400 hover:underline break-all" />
              </p>
            )
          )}

          {!editing && imgs.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-slate-700/40 ${imgs.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
              {imgs.length === 1 ? (
                <button type="button" className="w-full block cursor-zoom-in" onClick={() => setLightboxIdx(0)}>
                  <ProgressiveImage src={imgs[0]} alt="" className="w-full max-h-[500px]" imgClassName="max-h-[500px]" />
                </button>
              ) : (
                imgs.slice(0, 4).map((img: string, i: number) => (
                  <button key={i} type="button" className="w-full block cursor-zoom-in" onClick={() => setLightboxIdx(i)}>
                    <ProgressiveImage src={img} alt="" className="w-full h-48" imgClassName="h-48" />
                  </button>
                ))
              )}
            </div>
          )}

          {!editing && (() => {
            const vids = post.repostedFrom?.videos || post.videos || [];
            return vids.length > 0 ? (
              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-700/40 space-y-1">
                {vids.map((vid: string, i: number) => (
                  <VideoPlayer key={i} src={vid} />
                ))}
              </div>
            ) : null;
          })()}

          {!editing && (
            <div className="flex items-center justify-between mt-3 max-w-[380px] text-gray-500">
              <button
                onClick={() => setShowComments(v => !v)}
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                  <ChatCircle className="w-4 h-4" />
                </div>
                <span className="text-xs">{fmt(showComments ? localComments.length : commentsCount)}</span>
              </button>

              <button
                onClick={handleRepostClick}
                className={`flex items-center gap-1.5 transition-colors group ${!isLoggedIn ? "opacity-50 cursor-default" : "hover:text-green-400"}`}
              >
                <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                  <ArrowsClockwise className="w-4 h-4" />
                </div>
                <span className="text-xs">{fmt(post.reshares || 0)}</span>
              </button>

              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 transition-colors group ${liked ? "text-pink-500" : "hover:text-pink-400"}`}
              >
                <div className={`p-2 rounded-full transition-colors ${liked ? "bg-pink-500/10" : "group-hover:bg-pink-400/10"}`}>
                  <Heart className="w-4 h-4" weight={liked ? "fill" : "regular"} />
                </div>
                <span className="text-xs">{fmt((post.likes || []).length)}</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                  <ShareNetwork className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {showComments && !editing && (
            <div className="mt-2 border-t border-slate-700/30 pt-2">
              {isLoggedIn ? (
                <form onSubmit={submitComment} className="flex items-center gap-1.5 mb-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a reply..."
                    className="flex-1 bg-slate-800/60 text-white text-xs placeholder-gray-600 outline-none border border-slate-700/60 rounded-2xl px-3 py-1.5 focus:border-blue-500/70 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || commenting}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-xs font-semibold disabled:opacity-40 hover:bg-blue-600 transition-colors flex-shrink-0"
                  >
                    {commenting ? <SpinnerGap className="w-3 h-3 animate-spin" /> : "Reply"}
                  </button>
                </form>
              ) : (
                <LoginPrompt action="reply" />
              )}
              {localComments.slice(0, 5).map((c: any) => (
                <div key={c._id} className="flex gap-2 mb-1.5">
                  <Avatar src={c.authorImage} name={c.authorName} size={22} />
                  <div className="min-w-0 bg-slate-800/50 rounded-2xl px-2.5 py-1.5">
                    <span className="text-white font-semibold text-xs mr-1">{c.authorName}</span>
                    <span className="text-gray-300 text-xs break-words">{c.content}</span>
                  </div>
                </div>
              ))}
              {localComments.length > 5 && (
                <p className="text-gray-500 text-xs mt-1 pl-1">+{localComments.length - 5} more replies</p>
              )}
            </div>
          )}
        </div>
      </div>

      {lightboxIdx !== null && imgs.length > 0 && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          {imgs.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? (i - 1 + imgs.length) % imgs.length : 0); }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
                <CaretLeft className="w-5 h-5 text-white" weight="bold" />
              </button>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? (i + 1) % imgs.length : 0); }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
                <CaretRight className="w-5 h-5 text-white" weight="bold" />
              </button>
            </>
          )}
          <img src={imgs[lightboxIdx]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          {imgs.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {imgs.map((_img: string, idx: number) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === lightboxIdx ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>
      )}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={`Post by ${post.authorName}`}
        text={content?.slice(0, 100) || ""}
      />
    </article>
  );
}

function VerifyCodeModal({ onVerified, onClose }: { onVerified: () => void; onClose: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    setSending(true); setError("");
    const res = await fetch("/api/auth/send-code", { method: "POST", credentials: "include" });
    const data = await res.json();
    if (res.ok) setSent(true);
    else setError(data.error || "Failed to send code");
    setSending(false);
  };

  const verifyCode = async () => {
    if (!code.trim()) return;
    setVerifying(true); setError("");
    const res = await fetch("/api/auth/verify-code", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok) { onVerified(); }
    else { setError(data.error || "Invalid code"); setVerifying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Verify your identity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-5">
          A one-time code will be sent to your email. Verify once to unlock posting and earn your bronze verified badge.
        </p>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!sent ? (
          <button onClick={sendCode} disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {sending ? <SpinnerGap className="w-4 h-4 animate-spin" /> : null}
            {sending ? "Sending…" : "Send verification code"}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-green-400 text-sm">Code sent! Check your inbox.</p>
            <input
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={verifyCode} disabled={verifying || code.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {verifying ? <SpinnerGap className="w-4 h-4 animate-spin" /> : null}
              {verifying ? "Verifying…" : "Confirm & get verified"}
            </button>
            <button onClick={() => { setSent(false); setCode(""); }} className="w-full text-gray-500 text-xs hover:text-gray-300 transition-colors">
              Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ComposeBox({ me, onPost }: any) {
  const { updateUser } = useSession();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [posting, setPosting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingPost, setPendingPost] = useState<{ content: string; images: string[]; videos: string[] } | null>(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const mentionStartRef = useRef(-1);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!mentionSearch.trim()) { setMentionResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}&limit=5`, { credentials: "include" }).catch(() => null);
      const data = await res?.json().catch(() => ({}));
      setMentionResults(data.users || []);
    }, 300);
    return () => clearTimeout(t);
  }, [mentionSearch]);

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const addVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setVideoProgress(0);
    try {
      const url = await uploadFile(file, "posts", p => setVideoProgress(p));
      setVideos(prev => [...prev, url]);
    } catch {
      alert("Video upload failed. Please check your connection and try again.");
    }
    setVideoProgress(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    const cursor = e.target.selectionStart || 0;
    const before = val.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    if (match) {
      mentionStartRef.current = cursor - match[0].length;
      setMentionSearch(match[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

  const insertMention = (user: any) => {
    const username = user.username;
    const cursorNow = textareaRef.current?.selectionStart || 0;
    const before = content.slice(0, mentionStartRef.current);
    const after = content.slice(cursorNow);
    const next = `${before}@${username} ${after}`;
    setContent(next);
    setShowMentions(false);
    setMentionSearch("");
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + username.length + 2;
        textareaRef.current.selectionStart = pos;
        textareaRef.current.selectionEnd = pos;
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, 30);
  };

  const doPost = async (c: string, imgs: string[], vids: string[]) => {
    setPosting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: c, images: imgs, videos: vids }),
    });
    const data = await res.json();
    if (data.requiresEmailVerification) {
      setPendingPost({ content: c, images: imgs, videos: vids });
      setShowVerifyModal(true);
      setPosting(false);
      return;
    }
    if (data.post) {
      setContent(""); setImages([]); setVideos([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onPost(data.post);
    }
    setPosting(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !images.length && !videos.length) return;
    await doPost(content, images, videos);
  };

  const handleVerified = async () => {
    updateUser({ emailVerified: true });
    setShowVerifyModal(false);
    if (pendingPost) {
      await doPost(pendingPost.content, pendingPost.images, pendingPost.videos);
      setPendingPost(null);
    }
  };

  return (
    <>
    {showVerifyModal && <VerifyCodeModal onVerified={handleVerified} onClose={() => setShowVerifyModal(false)} />}
    <form onSubmit={submit} className="border-b border-slate-700/50 px-4 py-4">
      <div className="flex gap-3">
        <Avatar src={me?.profileImage} name={me?.name || "User"} size={40} />
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={e => { if (showMentions && e.key === "Escape") setShowMentions(false); }}
            placeholder="What's on your mind?"
            rows={2}
            className="w-full bg-transparent text-white text-lg placeholder-gray-600 outline-none resize-none leading-relaxed"
            style={{ minHeight: "52px" }}
          />
          {showMentions && mentionResults.length > 0 && (
            <div className="absolute left-0 right-0 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {mentionResults.map((u: any) => (
                <button key={u._id || u.id} type="button"
                  onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left">
                  <Avatar src={u.profileImage} name={u.name} size={30} />
                  <div>
                    <p className="text-white text-sm font-semibold">{u.name}</p>
                    <p className="text-gray-500 text-[11px]">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <div className={`mt-2 rounded-2xl overflow-hidden border border-slate-700/40 ${images.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <ProgressiveImage src={img} alt="" className={`w-full ${images.length === 1 ? "max-h-72" : "h-36"}`} />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 bg-black border border-white/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {videos.map((vid, i) => (
                <div key={i} className="relative group rounded-2xl overflow-hidden border border-slate-700/40">
                  <VideoPlayer src={vid} />
                  <button type="button" onClick={() => setVideos(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {videoProgress !== null && (
            <div className="mt-2 rounded-xl bg-slate-800/60 px-3 py-2 border border-slate-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">Uploading video…</span>
                <span className="text-gray-400 text-xs">{videoProgress}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${videoProgress}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/40">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => imageRef.current?.click()} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => videoRef.current?.click()} disabled={videoProgress !== null} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors disabled:opacity-40">
                <VideoCamera className="w-5 h-5" />
              </button>
              <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={addVideo} />
            </div>
            <button
              type="submit"
              disabled={(!content.trim() && !images.length && !videos.length) || posting || videoProgress !== null}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold px-5 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1.5"
            >
              {posting ? <SpinnerGap className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
    </>
  );
}

function VerifyEmailBanner() {
  return (
    <div className="border-b border-yellow-800/40 px-4 py-3 bg-gradient-to-r from-yellow-950/40 to-transparent">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-yellow-400 text-lg flex-shrink-0">✉️</span>
          <div className="min-w-0">
            <p className="text-yellow-300 font-semibold text-sm">Verify your email to post</p>
            <p className="text-gray-500 text-xs truncate">Go to Settings → Email Verification and verify once.</p>
          </div>
        </div>
        <Link href="/dashboard/settings" className="flex-shrink-0 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-600/50 text-yellow-300 text-xs font-semibold hover:bg-yellow-500/30 transition-colors whitespace-nowrap">
          Verify now
        </Link>
      </div>
    </div>
  );
}

function GuestBanner() {
  return (
    <div className="border-b border-slate-700/50 px-4 py-4 bg-gradient-to-r from-blue-950/30 to-transparent">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-white font-semibold text-sm">Join the conversation</p>
          <p className="text-gray-500 text-xs">Sign in to post, comment, and follow people</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/login" className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors">Sign in</Link>
          <Link href="/register" className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default function FeedClient({ initialPosts, isLoggedIn }: { initialPosts: Post[]; isLoggedIn: boolean }) {
  const { user: sessionUser } = useSession();
  const meState = sessionUser as Me | null;
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialPosts.length === 10);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(initialPosts.length === 10);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      pageRef.current = next;
      const res = await fetch(`/api/posts?page=${next}&limit=10`, { credentials: "include" });
      const data = await res.json();
      const newPosts: Post[] = data.posts || [];
      const more = data.hasMore ?? newPosts.length === 10;
      setPosts(prev => {
        const ids = new Set(prev.map(p => p._id));
        return [...prev, ...newPosts.filter(p => !ids.has(p._id))];
      });
      setHasMore(more);
      hasMoreRef.current = more;
    } catch {}
    setLoadingMore(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "400px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [loadMore]);

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  useEffect(() => {
    const handler = (e: Event) => {
      const post = (e as CustomEvent).detail;
      if (post) setPosts(prev => {
        if (prev.some(p => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    };
    window.addEventListener("lawsa-new-post", handler);
    return () => window.removeEventListener("lawsa-new-post", handler);
  }, []);

  const handleLike = (postId: string) => {
    const myId = meState?.id || meState?._id || "";
    // Optimistic toggle — works for guests too (visual only)
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const likes = p.likes || [];
      if (!myId) {
        // Guest: visual-only toggle (no persistence)
        const guestLiked = likes.includes("guest");
        return { ...p, likes: guestLiked ? likes.filter(id => id !== "guest") : [...likes, "guest"] };
      }
      const liked = likes.includes(myId);
      return { ...p, likes: liked ? likes.filter(id => id !== myId) : [...likes, myId] };
    }));
    if (myId) {
      fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" }).catch(() => {});
    }
  };

  const handleRepost = (postId: string) => {
    if (!meState) return;
    fetch(`/api/posts/${postId}/repost`, { method: "POST", credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.reshares !== undefined) {
          setPosts(prev => prev.map(p => p._id !== postId ? p : { ...p, reshares: d.reshares }));
        }
      })
      .catch(() => {});
    setPosts(prev => prev.map(p => p._id !== postId ? p : { ...p, reshares: (p.reshares || 0) + 1 }));
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleEdit = () => {
    fetch("/api/posts?page=1&limit=20", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.posts) setPosts(d.posts); })
      .catch(() => {});
  };

  const handleComment = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p._id !== postId ? p : { ...p, commentsCount: (p.commentsCount || 0) + 1 }
    ));
  };

  const handleNewPost = (post: Post) => setPosts(prev => [post, ...prev]);

  return (
    <div className="max-w-[600px] mx-auto border-x border-slate-700/50 min-h-screen">
      {meState ? (
        <ComposeBox me={meState} onPost={handleNewPost} />
      ) : (
        <GuestBanner />
      )}
      {meState && !meState.emailVerified && <VerifyEmailBanner />}

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <ChatCircle className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-gray-400">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share something</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              me={meState}
              onLike={handleLike}
              onRepost={handleRepost}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onComment={handleComment}
            />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="flex justify-center py-6">
              {[0,1,2].map(i => <PostSkeleton key={i} />)}
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-700 text-xs py-8">You&apos;re all caught up</p>
          )}
        </>
      )}
    </div>
  );
}
