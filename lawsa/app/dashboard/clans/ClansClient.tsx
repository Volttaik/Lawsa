"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Users, PaperPlaneTilt, SpinnerGap, X, ArrowLeft,
  Crown, SignOut, Trash, Check, ChatCircle, ShareNetwork, Smiley, Lock,
  Paperclip, Camera, Microphone, Stop, Play, Pause, ArrowBendUpLeft,
} from "@phosphor-icons/react";
import StickerRenderer from "@/components/stickers/StickerRenderer";
import StickerPicker from "@/components/StickerPicker";
import { uploadFile } from "@/lib/uploadClient";

/* ── Same WA_BG as DM chat ── */
const WA_BG: React.CSSProperties = {
  backgroundColor: "#000000",
  backgroundImage: "linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72)), url('/chat-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "local",
};
const noOutline: React.CSSProperties = { outline: "none", boxShadow: "none" };

function fmtSecs(s: number) { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

interface Clan {
  _id: string; name: string; slug: string; logo?: string;
  description?: string; ownerId: string; ownerName: string;
  members: string[]; createdAt: string;
}
interface ClanMember { _id: string; name: string; username: string; profileImage?: string; isOnline: boolean; }
interface WorldChatMsg {
  _id: string; clanId: string; senderId: string; senderName: string;
  senderUsername: string; senderImage?: string; content: string;
  mediaUrl?: string; mediaType?: string; createdAt: string;
}
interface CurrentUser {
  _id?: string; id?: string; name: string; username: string;
  profileImage?: string; clanId?: string; clanName?: string; clanLogo?: string;
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

function ClanLogo({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "CL";
  if (src) return <img src={src} alt={name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: Math.max(12, size * 0.35) }}>{initials}</div>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

/* ── Exact same VoiceNoteBubble as DM chat ── */
function VoiceNoteBubble({ src, isMine }: { src: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };
  return (
    <div className="flex items-center gap-3 w-52">
      <audio ref={audioRef} src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => { const a = audioRef.current; if (!a) return; setCurrent(a.currentTime); setProgress((a.currentTime / a.duration) * 100); }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); }} />
      <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isMine ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.12)" }}>
        {playing ? <Pause size={16} weight="fill" className="text-white" /> : <Play size={16} weight="fill" className="text-white" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <div className="absolute left-0 top-0 h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[11px] text-white/50">{playing ? fmtSecs(Math.floor(current)) : fmtSecs(Math.floor(duration))}</span>
      </div>
    </div>
  );
}

export default function ClansClient({ initialClans, currentUser: initialUser }: { initialClans: Clan[]; currentUser: CurrentUser | null }) {
  const [clans, setClans] = useState<Clan[]>(initialClans);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(initialUser);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", logo: "", logoPreview: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [chatMessages, setChatMessages] = useState<WorldChatMsg[]>([]);
  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [activeView, setActiveView] = useState<"members" | "chat">("chat");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  /* ── Media / voice / reply state (matches DM chat) ── */
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [videoUploadUrl, setVideoUploadUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [replyTo, setReplyTo] = useState<WorldChatMsg | null>(null);

  const lastMsgTimeRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const selectedClanRef = useRef<Clan | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  selectedClanRef.current = selectedClan;

  useEffect(() => {
    if (!currentUser) {
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(data => {
        if (data?.user) setCurrentUser(data.user);
      }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatMessages.length > 0) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ── Stable poll ── */
  const pollChat = useCallback(async () => {
    const clan = selectedClanRef.current;
    if (!clan) return;
    const url = lastMsgTimeRef.current
      ? `/api/clans/${clan._id}/chat?since=${encodeURIComponent(lastMsgTimeRef.current)}`
      : `/api/clans/${clan._id}/chat`;
    try {
      const data = await fetch(url).then(r => r.json());
      if (data.messages?.length) {
        const fresh = (data.messages as WorldChatMsg[]).filter(m => !seenIdsRef.current.has(m._id));
        if (fresh.length) {
          fresh.forEach(m => seenIdsRef.current.add(m._id));
          lastMsgTimeRef.current = fresh[fresh.length - 1].createdAt;
          setChatMessages(prev => [...prev, ...fresh]);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!selectedClan) return;
    const id = setInterval(pollChat, 3000);
    return () => clearInterval(id);
  }, [selectedClan, pollChat]);

  const openClan = async (clan: Clan) => {
    lastMsgTimeRef.current = null;
    seenIdsRef.current = new Set();
    setSelectedClan(clan);
    setChatMessages([]);
    setActiveView("chat");
    setReplyTo(null);
    setChatText("");
    setMediaPreview(null);
    setMediaData(null);
    setAudioPreviewUrl(null);

    const [clanRes, chatRes] = await Promise.all([
      fetch(`/api/clans/${clan._id}`).then(r => r.json()),
      fetch(`/api/clans/${clan._id}/chat`).then(r => r.json()),
    ]);
    setClanMembers(clanRes.members || []);
    const initialMsgs: WorldChatMsg[] = chatRes.messages || [];
    initialMsgs.forEach(m => seenIdsRef.current.add(m._id));
    if (initialMsgs.length) lastMsgTimeRef.current = initialMsgs[initialMsgs.length - 1].createdAt;
    setChatMessages(initialMsgs);
  };

  const handleJoin = async (clanId: string) => {
    setJoiningId(clanId);
    const res = await fetch(`/api/clans/${clanId}/join`, { method: "POST" });
    const data = await res.json();
    if (!data.error) {
      const [clansRes, meRes] = await Promise.all([
        fetch("/api/clans").then(r => r.json()),
        fetch("/api/auth/me").then(r => r.json()),
      ]);
      setClans(clansRes.clans || []);
      if (meRes.user) setCurrentUser(meRes.user);
    }
    setJoiningId(null);
  };

  /* ── File / camera upload — same logic as DM chat ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const blobUrl = URL.createObjectURL(file);
    setMediaPreview(blobUrl);
    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      setMediaData("__video__");
      setVideoUploadUrl(null);
      setVideoUploading(true);
      setVideoUploadProgress(0);
      try {
        const url = await uploadFile(file, "clan-chat", (p: number) => setVideoUploadProgress(p));
        setVideoUploadUrl(url);
        setMediaData(url);
      } catch { setMediaPreview(null); setMediaData(null); }
      setVideoUploading(false);
    } else {
      const reader = new FileReader();
      reader.onload = ev => setMediaData(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  /* ── Voice recording — same logic as DM chat ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const resolvedMime = mr.mimeType || "audio/mp4";
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: resolvedMime });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSecs(0);
      recordTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);
    } catch {}
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setAudioPreviewUrl(null);
    setAudioBlob(null);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  /* ── Send message ── */
  const handleSendChat = async () => {
    if (!selectedClan) return;
    const hasText = chatText.trim().length > 0;
    const hasMedia = !!mediaData && !(mediaData === "__video__" && !videoUploadUrl);
    const hasAudio = !!audioBlob;
    if (!hasText && !hasMedia && !hasAudio) return;

    setSendingChat(true);

    let finalMediaUrl: string | undefined;
    let finalMediaType: string | undefined;

    if (hasAudio && audioBlob) {
      try {
        const isMP4 = audioBlob.type === "audio/mp4" || audioBlob.type.includes("mp4");
        const ext = isMP4 ? "mp4" : "webm";
        const audioFile = new File([audioBlob], `voice.${ext}`, { type: audioBlob.type || "audio/mp4" });
        finalMediaUrl = await uploadFile(audioFile, "clan-chat", () => {});
        finalMediaType = "audio";
      } catch {}
      setAudioPreviewUrl(null);
      setAudioBlob(null);
    } else if (hasMedia && mediaData && mediaData !== "__video__") {
      if (mediaData.startsWith("data:video") || (videoUploadUrl)) {
        finalMediaUrl = videoUploadUrl || undefined;
        finalMediaType = "video";
      } else if (mediaData.startsWith("http")) {
        finalMediaUrl = mediaData;
        finalMediaType = "video";
      } else {
        try {
          const blob = await fetch(mediaData).then(r => r.blob());
          const imageFile = new File([blob], "image.jpg", { type: blob.type });
          finalMediaUrl = await uploadFile(imageFile, "clan-chat", () => {});
          finalMediaType = "image";
        } catch {}
      }
      setMediaPreview(null);
      setMediaData(null);
      setVideoUploadUrl(null);
    }

    const body: Record<string, string | undefined> = {
      content: chatText,
      mediaUrl: finalMediaUrl,
      mediaType: finalMediaType,
      replyToId: replyTo?._id,
      replyToContent: replyTo?.content,
      replyToSender: replyTo?.senderName,
    };

    const res = await fetch(`/api/clans/${selectedClan._id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.message) {
      const msg: WorldChatMsg = data.message;
      seenIdsRef.current.add(msg._id);
      lastMsgTimeRef.current = msg.createdAt;
      setChatMessages(prev => [...prev, msg]);
      setChatText("");
      setReplyTo(null);
    }
    setSendingChat(false);
  };

  const handleCreateLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const blobUrl = URL.createObjectURL(file);
    setCreateForm(f => ({ ...f, logoPreview: blobUrl, logo: "" }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "clans");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setCreateForm(f => ({ ...f, logo: url }));
    } catch {
      URL.revokeObjectURL(blobUrl);
      setCreateForm(f => ({ ...f, logoPreview: "", logo: "" }));
    }
  };

  const handleCreateClan = async () => {
    if (!createForm.name.trim()) { setCreateError("Name is required"); return; }
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/clans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    if (data.clan) {
      setShowCreate(false);
      setCreateForm({ name: "", description: "", logo: "", logoPreview: "" });
      const [clansRes, meRes] = await Promise.all([
        fetch("/api/clans").then(r => r.json()),
        fetch("/api/auth/me").then(r => r.json()),
      ]);
      setClans(clansRes.clans || []);
      if (meRes.user) setCurrentUser(meRes.user);
    } else {
      setCreateError(data.error || "Failed to create clan");
    }
    setCreating(false);
  };

  const uid = currentUser?._id || (currentUser as any)?.id || "";
  const isMember = (clan: Clan) => clan.members.includes(uid);
  const isInAnyClan = !!currentUser?.clanId;

  /* ── Textarea auto-resize ── */
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const canSend = (chatText.trim().length > 0 || (!!mediaData && !(mediaData === "__video__" && !videoUploadUrl)) || !!audioBlob) && !sendingChat && !videoUploading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Clans</h1>
            <p className="text-xs text-gray-400">Join a community or create your own</p>
          </div>
        </div>
        {!isInAnyClan && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
            <Plus size={15} /> Create
          </button>
        )}
      </div>

      {currentUser?.clanId && (
        <div className="mb-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-800/50 rounded-2xl p-4 flex items-center gap-3">
          <ClanLogo src={currentUser.clanLogo} name={currentUser.clanName || ""} size={44} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-400 font-medium">Your Clan</p>
            <p className="font-bold text-white">{currentUser.clanName}</p>
          </div>
          <button onClick={() => { const clan = clans.find(c => c._id === currentUser.clanId); if (clan) openClan(clan); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
            <ChatCircle size={12} /> Open
          </button>
        </div>
      )}

      {clans.length === 0 ? (
        <div className="border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold text-white mb-2">No clans yet</h3>
          <p className="text-sm text-gray-400 mb-4">Be the first to create one!</p>
          {!isInAnyClan && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all">
              <Plus size={15} /> Create a Clan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {clans.map((clan, i) => (
            <motion.div key={clan._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
              className="border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ClanLogo src={clan.logo} name={clan.name} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{clan.name}</h3>
                    {clan.ownerId === uid && (
                      <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded-full border border-yellow-800/50">
                        <Crown size={9} /> Owner
                      </span>
                    )}
                  </div>
                  {clan.description && <p className="text-xs text-gray-400 truncate mt-0.5">{clan.description}</p>}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <Users size={11} />
                    <span>{clan.members.length} member{clan.members.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isMember(clan) && (
                    <button onClick={() => openClan(clan)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
                      <ChatCircle size={11} /> Chat
                    </button>
                  )}
                  {!isMember(clan) && !isInAnyClan && (
                    <button onClick={() => handleJoin(clan._id)} disabled={joiningId === clan._id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-60">
                      {joiningId === clan._id ? <SpinnerGap size={11} className="animate-spin" /> : <Plus size={11} />} Join
                    </button>
                  )}
                  {isMember(clan) && clan.ownerId !== uid && (
                    <button onClick={() => handleJoin(clan._id)} disabled={joiningId === clan._id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all disabled:opacity-60">
                      {joiningId === clan._id ? <SpinnerGap size={11} className="animate-spin" /> : <SignOut size={11} />} Leave
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create Clan Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Create a Clan</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-200"><X size={20} /></button>
              </div>
              {createError && <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-xl p-3 mb-4">{createError}</div>}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-indigo-900/40 flex items-center justify-center">
                  {(createForm.logoPreview || createForm.logo)
                    ? <img src={createForm.logoPreview || createForm.logo} alt="" className="w-full h-full object-cover" />
                    : <Shield size={24} className="text-indigo-400" />}
                </div>
                <label className="text-xs font-medium text-indigo-400 cursor-pointer px-3 py-2 rounded-xl border border-indigo-800 hover:bg-indigo-900/20 transition-all">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleCreateLogoChange} />
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Clan Name *</label>
                  <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. The Code Warriors"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Description</label>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What is this clan about?"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} />
                </div>
              </div>
              <button onClick={handleCreateClan} disabled={creating || !createForm.name.trim()}
                className="w-full mt-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
                {creating ? <SpinnerGap size={15} className="animate-spin" /> : <Shield size={15} />} Create Clan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clan Chat Overlay — exact DM style ── */}
      <AnimatePresence>
        {selectedClan && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: "#000" }}>

            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur border-b border-white/10">
              <button onClick={() => setSelectedClan(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                <ArrowLeft size={20} />
              </button>
              <ClanLogo src={selectedClan.logo} name={selectedClan.name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{selectedClan.name}</p>
                <p className="text-xs text-white/50">{selectedClan.members.length} members</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveView("chat")} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${activeView === "chat" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Chat</button>
                <button onClick={() => setActiveView("members")} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${activeView === "members" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Members</button>
              </div>
            </div>

            {activeView === "chat" ? (
              <>
                {/* ── Chat messages — WA_BG exactly like DM chat ── */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" style={WA_BG}>
                  {chatMessages.length === 0
                    ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-sm">No messages yet. Say something!</p>
                      </div>
                    )
                    : chatMessages.map((msg, i) => {
                        const isMine = msg.senderId === uid;
                        const prevMsg = chatMessages[i - 1];
                        const nextMsg = chatMessages[i + 1];
                        const showHeader = !isMine && (i === 0 || prevMsg?.senderId !== msg.senderId);
                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                        const isFirstInGroup = i === 0 || prevMsg?.senderId !== msg.senderId;

                        /* Reply snippet */
                        const hasReply = !!(msg as any).replyToContent;

                        return (
                          <div key={msg._id}
                            className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                            {/* Avatar placeholder column */}
                            <div className="flex-shrink-0" style={{ width: 30 }}>
                              {!isMine && isLastInGroup && (
                                <Avatar src={msg.senderImage} name={msg.senderName} size={28} />
                              )}
                            </div>

                            <div className={`max-w-[75%] group relative`}>
                              {/* Sender name */}
                              {showHeader && (
                                <div className={`flex items-center gap-1.5 mb-0.5 ${isMine ? "justify-end" : ""} ml-1`}>
                                  <span className="text-[11px] font-bold text-white/90">{msg.senderName}</span>
                                  <span className="text-[10px] text-white/35">@{msg.senderUsername}</span>
                                </div>
                              )}

                              {/* Bubble */}
                              <div
                                className="px-3 py-2 text-white text-[14px] leading-relaxed"
                                style={{
                                  backgroundColor: isMine ? "#000000" : "#111111",
                                  borderRadius: isMine ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                                  border: isMine ? "1px solid rgba(255,255,255,0.08)" : "none",
                                }}
                              >
                                {/* Reply snippet */}
                                {hasReply && (
                                  <div className="mb-1.5 pl-2 border-l-2 border-white/30 text-white/50 text-xs">
                                    <span className="font-semibold text-white/60">{(msg as any).replyToSender}</span>
                                    <div className="truncate max-w-[200px]">{(msg as any).replyToContent}</div>
                                  </div>
                                )}

                                {/* Voice note */}
                                {msg.mediaType === "audio" && msg.mediaUrl
                                  ? <VoiceNoteBubble src={msg.mediaUrl} isMine={isMine} />
                                  : msg.mediaType === "image" && msg.mediaUrl
                                  ? (
                                    <img src={msg.mediaUrl} alt="media" className="rounded-lg max-w-[240px] max-h-60 object-cover block mb-1" />
                                  )
                                  : msg.mediaType === "video" && msg.mediaUrl
                                  ? (
                                    <video src={msg.mediaUrl} controls className="rounded-lg max-w-[240px] max-h-60 block mb-1" />
                                  )
                                  : null
                                }

                                {/* Text / sticker */}
                                {msg.content && (
                                  <StickerRenderer content={msg.content} className="text-[14px] leading-relaxed whitespace-pre-wrap break-words" />
                                )}
                              </div>

                              {/* Timestamp + reply button */}
                              {isLastInGroup && (
                                <div className={`flex items-center gap-2 mt-0.5 ${isMine ? "justify-end pr-1" : "pl-1"}`}>
                                  <button onClick={() => setReplyTo(msg)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60"
                                    title="Reply">
                                    <ArrowBendUpLeft size={12} />
                                  </button>
                                  <p className="text-[10px] text-white/30">{timeAgo(msg.createdAt)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  }
                  <div ref={chatEndRef} />
                </div>

                {/* ── Input area — exact DM style ── */}
                {isMember(selectedClan) && (
                  <div className="flex-shrink-0" style={{ backgroundColor: "#000" }}>

                    {/* Sticker picker */}
                    {showStickerPicker && (
                      <div className="px-2 pt-2 pb-1">
                        <StickerPicker
                          onSelectSticker={(val) => { setChatText(prev => prev + val); setShowStickerPicker(false); textareaRef.current?.focus(); }}
                          onSelectEmoji={(e) => { setChatText(prev => prev + e); setShowStickerPicker(false); textareaRef.current?.focus(); }}
                          onClose={() => setShowStickerPicker(false)}
                        />
                      </div>
                    )}

                    {/* Reply banner */}
                    {replyTo && (
                      <div className="flex items-center gap-2 px-4 py-2 border-t border-white/10 bg-white/5">
                        <ArrowBendUpLeft size={14} className="text-white/40 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white/50 font-semibold">{replyTo.senderName}</p>
                          <p className="text-xs text-white/40 truncate">{replyTo.content || "Media"}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/60">
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Video upload progress */}
                    {videoUploading && (
                      <div className="px-4 py-2 border-t border-white/10">
                        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Uploading video… {videoUploadProgress}%</p>
                        <div className="h-1 rounded-full overflow-hidden bg-white/10">
                          <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Media preview */}
                    {mediaPreview && !videoUploading && (
                      <div className="px-4 pt-3 pb-1 flex items-start gap-2">
                        <div className="relative">
                          {mediaData === "__video__" || (mediaData?.startsWith("data:video"))
                            ? <video src={mediaPreview} className="h-20 rounded-xl object-cover" />
                            : <img src={mediaPreview} alt="preview" className="h-20 rounded-xl object-cover" />
                          }
                          <button onClick={() => { setMediaPreview(null); setMediaData(null); setVideoUploadUrl(null); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                            <X size={10} className="text-black" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Voice note preview */}
                    {audioPreviewUrl && (
                      <div className="px-4 pt-3 pb-1 flex items-center gap-3">
                        <VoiceNoteBubble src={audioPreviewUrl} isMine={true} />
                        <button onClick={() => { setAudioPreviewUrl(null); setAudioBlob(null); }}
                          className="text-white/30 hover:text-white/60"><X size={14} /></button>
                      </div>
                    )}

                    {/* Main input row */}
                    <div className="flex items-end gap-2 px-3 py-2.5">

                      {/* Smiley */}
                      <button type="button" onClick={() => setShowStickerPicker(v => !v)}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors mb-0.5"
                        style={{ color: showStickerPicker ? "#fff" : "rgba(255,255,255,0.45)" }}>
                        <Smiley size={22} />
                      </button>

                      {/* Textarea pill */}
                      <div className="flex-1 rounded-2xl px-4 py-2 flex items-end gap-2" style={{ backgroundColor: "#111" }}>
                        {isRecording ? (
                          <div className="flex-1 flex items-center gap-2 py-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            <span className="text-white text-sm font-mono flex-shrink-0">{fmtSecs(recordingSecs)}</span>
                            <span className="text-white/40 text-xs">Recording…</span>
                          </div>
                        ) : (
                          <textarea
                            ref={textareaRef}
                            value={chatText}
                            onChange={handleTextInput}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                            placeholder="Message the clan…"
                            rows={1}
                            className="flex-1 bg-transparent text-white text-sm placeholder-white/40 resize-none leading-5"
                            style={{ ...noOutline, maxHeight: 120 }}
                          />
                        )}

                        {/* Paperclip */}
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="flex-shrink-0 p-1 text-white/40 hover:text-white/70 transition-colors mb-0.5">
                          <Paperclip size={18} />
                        </button>
                        {/* Camera */}
                        <button type="button" onClick={() => cameraRef.current?.click()}
                          className="flex-shrink-0 p-1 text-white/40 hover:text-white/70 transition-colors mb-0.5">
                          <Camera size={18} />
                        </button>
                      </div>

                      {/* Mic / Stop / Send */}
                      {isRecording ? (
                        <>
                          <button type="button" onClick={cancelRecording}
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <X size={16} className="text-white" />
                          </button>
                          <button type="button" onClick={stopRecording}
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                            <Stop size={16} weight="fill" className="text-white" />
                          </button>
                        </>
                      ) : canSend ? (
                        <button type="button" onClick={handleSendChat} disabled={!canSend}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all disabled:opacity-40">
                          {sendingChat
                            ? <SpinnerGap size={16} className="animate-spin text-black" />
                            : <PaperPlaneTilt size={16} weight="fill" className="text-black" />}
                        </button>
                      ) : (
                        <button type="button" onMouseDown={startRecording}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all">
                          <Microphone size={16} weight="fill" className="text-black" />
                        </button>
                      )}
                    </div>

                    {/* Hidden file inputs */}
                    <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                  </div>
                )}
              </>
            ) : (
              /* ── Members view ── */
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ backgroundColor: "#000" }}>
                {clanMembers.map(member => (
                  <div key={member._id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#111" }}>
                    <div className="relative">
                      <Avatar src={member.profileImage} name={member.name} size={40} />
                      {member.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{member.name}</p>
                        {member._id === selectedClan.ownerId && <Crown size={12} className="text-yellow-400" />}
                      </div>
                      <p className="text-xs text-white/50">@{member.username}</p>
                    </div>
                    {member.isOnline && <span className="text-xs text-green-400">online</span>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
