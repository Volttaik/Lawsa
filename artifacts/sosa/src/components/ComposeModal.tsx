import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, VideoCamera, SpinnerGap, PaperPlaneTilt } from "@phosphor-icons/react";
import { uploadFile } from "@/lib/uploadClient";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

export default function ComposeModal({ me, open, onClose, onPost }: { me: any; open: boolean; onClose: () => void; onPost?: (post: any) => void }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const mentionStartRef = useRef(-1);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) { setContent(""); setImages([]); setVideos([]); setError(""); setShowMentions(false); setVideoProgress(null); }
    else setTimeout(() => textareaRef.current?.focus(), 120);
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
    const val = e.target.value; setContent(val);
    e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    const cursor = e.target.selectionStart || 0;
    const before = val.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    if (match) { mentionStartRef.current = cursor - match[0].length; setMentionSearch(match[1]); setShowMentions(true); }
    else { setShowMentions(false); setMentionSearch(""); }
  };

  const insertMention = (user: any) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const before = content.slice(0, mentionStartRef.current);
    const after = content.slice(cursor);
    const next = `${before}@${user.username} ${after}`;
    setContent(next); setShowMentions(false); setMentionSearch("");
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + user.username.length + 2;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = pos;
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
    const file = e.target.files?.[0]; if (!file) return; e.target.value = "";
    setVideoProgress(0);
    try { const url = await uploadFile(file, "posts", p => setVideoProgress(p)); setVideos(prev => [...prev, url]); }
    catch { setError("Video upload failed."); }
    setVideoProgress(null);
  };

  const submit = async () => {
    if (!content.trim() && !images.length && !videos.length) return;
    setPosting(true); setError("");
    try {
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content, images, videos }) });
      const data = await res.json();
      if (data.post) { onPost?.(data.post); window.dispatchEvent(new CustomEvent("lawsa-new-post", { detail: data.post })); onClose(); }
      else if (data.requiresEmailVerification) setError("Please verify your email first. Go to Settings → Email Verification.");
      else setError(data.error || "Failed to post");
    } catch { setError("Network error."); }
    setPosting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-lg bg-[#0a0a0a] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white transition-colors" /></button>
          <button onClick={submit} disabled={posting || (!content.trim() && !images.length && !videos.length)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 disabled:opacity-40 transition-all">
            {posting ? <SpinnerGap size={14} className="animate-spin" /> : <PaperPlaneTilt size={14} weight="fill" />}
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
        <div className="px-4 py-3 flex gap-3 relative">
          <Avatar src={me?.profileImage} name={me?.name || "?"} size={40} />
          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={content} onChange={handleInput} placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder-gray-600 text-base resize-none outline-none min-h-[80px]" style={{ height: "auto" }} />
            {showMentions && mentionResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                {mentionResults.map(u => (
                  <button key={u._id || u.id} onClick={() => insertMention(u)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left">
                    <Avatar src={u.profileImage} name={u.name} size={28} />
                    <div><p className="text-white text-xs font-semibold">{u.name}</p><p className="text-gray-500 text-[11px]">@{u.username}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {images.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {images.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <img src={src} className="w-full h-full object-cover" />
                <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"><X size={10} className="text-white" /></button>
              </div>
            ))}
          </div>
        )}
        {videoProgress !== null && <div className="px-4 pb-2"><div className="h-1 bg-white/10 rounded-full"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${videoProgress}%` }} /></div><p className="text-gray-500 text-xs mt-1">Uploading video…</p></div>}
        {error && <p className="px-4 pb-2 text-red-400 text-sm">{error}</p>}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4">
          <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
          <button onClick={() => imageRef.current?.click()} className="text-gray-400 hover:text-white transition-colors"><ImageIcon size={22} /></button>
          <button onClick={() => videoRef.current?.click()} className="text-gray-400 hover:text-white transition-colors"><VideoCamera size={22} /></button>
        </div>
      </div>
    </div>
  );
}
