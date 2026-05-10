"use client";
import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, VideoCamera, SpinnerGap, PaperPlaneTilt, At } from "@phosphor-icons/react";
import { uploadFile } from "@/lib/uploadClient";

interface UserResult { _id?: string; id?: string; name: string; username: string; profileImage?: string; }

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

export default function ComposeModal({
  me,
  open,
  onClose,
  onPost,
}: {
  me: any;
  open: boolean;
  onClose: () => void;
  onPost?: (post: any) => void;
}) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionResults, setMentionResults] = useState<UserResult[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const mentionStartRef = useRef(-1);

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setContent(""); setImages([]); setVideos([]);
      setError(""); setShowMentions(false);
      setVideoUploadProgress(null);
    } else {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (!mentionSearch.trim()) { setMentionResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}&limit=6`, { credentials: "include" }).catch(() => null);
      const data = await res?.json().catch(() => ({}));
      setMentionResults(data.users || []);
    }, 250);
    return () => clearTimeout(t);
  }, [mentionSearch]);

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

  const insertMention = (user: UserResult) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setVideoUploadProgress(0);
    try {
      const url = await uploadFile(file, "posts", p => setVideoUploadProgress(p));
      setVideos(prev => [...prev, url]);
    } catch {
      setError("Video upload failed. Try a smaller file.");
    }
    setVideoUploadProgress(null);
  };

  const submit = async () => {
    if (!content.trim() && !images.length && !videos.length) return;
    setPosting(true); setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, images, videos }),
      });
      const data = await res.json();
      if (data.post) {
        onPost?.(data.post);
        window.dispatchEvent(new CustomEvent("lawsa-new-post", { detail: data.post }));
        onClose();
      } else if (data.requiresEmailVerification) {
        setError("Please verify your email first. Go to Settings → Email Verification.");
      } else {
        setError(data.error || "Failed to post");
      }
    } catch { setError("Network error. Please try again."); }
    setPosting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center pt-16 sm:pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[600px] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-visible"
        onClick={e => e.stopPropagation()}
        style={{ animation: "pop-in 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={submit}
            disabled={(!content.trim() && !images.length && !videos.length) || posting || videoUploadProgress !== null}
            className="bg-white text-black font-bold text-sm px-5 py-1.5 rounded-full hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {posting
              ? <SpinnerGap className="w-4 h-4 animate-spin" />
              : <PaperPlaneTilt className="w-4 h-4" weight="fill" />}
            Post
          </button>
        </div>

        <div className="flex gap-3 px-4 pt-4 pb-2">
          <Avatar src={me?.profileImage} name={me?.name || "User"} size={42} />
          <div className="flex-1 min-w-0 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onKeyDown={e => {
                if (showMentions && (e.key === "Escape" || e.key === "Tab")) { setShowMentions(false); }
              }}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-transparent text-white text-[17px] placeholder-gray-600 outline-none resize-none leading-relaxed"
              style={{ minHeight: "80px" }}
            />

            {showMentions && mentionResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {mentionResults.map(u => (
                  <button
                    key={u._id || u.id}
                    onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <Avatar src={u.profileImage} name={u.name} size={32} />
                    <div>
                      <p className="text-white text-sm font-semibold">{u.name}</p>
                      <p className="text-gray-500 text-xs">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className={`mt-3 rounded-2xl overflow-hidden ${images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}`}>
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className={`w-full object-cover rounded-2xl ${images.length === 1 ? "max-h-72" : "h-36"}`} />
                    <button
                      type="button"
                      onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {videos.length > 0 && (
              <div className="mt-3 space-y-2">
                {videos.map((vid, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden bg-black">
                    <video src={vid} className="w-full max-h-64 rounded-2xl" controls />
                    <button
                      type="button"
                      onClick={() => setVideos(p => p.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {videoUploadProgress !== null && (
              <div className="mt-3 rounded-xl bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">Uploading video…</span>
                  <span className="text-white/60 text-xs">{videoUploadProgress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${videoUploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="px-4 pb-2 text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-0.5 px-3 py-2.5 border-t border-white/[0.08]">
          <button type="button" onClick={() => imageRef.current?.click()} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-blue-400" title="Add image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => videoRef.current?.click()} disabled={videoUploadProgress !== null} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-blue-400 disabled:opacity-40" title="Add video">
            <VideoCamera className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => { const cur = textareaRef.current; if (!cur) return; const pos = cur.selectionStart || cur.value.length; const v = cur.value; setContent(v.slice(0, pos) + "@" + v.slice(pos)); setTimeout(() => { cur.focus(); cur.selectionStart = pos + 1; cur.selectionEnd = pos + 1; }, 30); }} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-blue-400" title="Tag someone">
            <At className="w-5 h-5" />
          </button>
          <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
          <span className="ml-auto text-gray-600 text-xs pr-1">{content.length}/500</span>
        </div>
      </div>
    </div>
  );
}
