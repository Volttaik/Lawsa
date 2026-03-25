"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, ArrowLeft, MessageCircle, Users,
  Image as ImageIcon, Film, Paperclip, X, Play, FileText,
  Plus, Mic, StopCircle, Check, CheckCheck, Palette, Upload,
  Pause,
} from "lucide-react";

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  otherUser?: { _id: string; name: string; username: string; profileImage?: string };
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  read?: boolean;
  edited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

interface ConnectedUser {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
}

interface ClanInfo {
  id: string;
  name: string;
  logo?: string;
}

interface ChatBg {
  id: string;
  label: string;
  imgValue: string | null;
  bgColor: string;
  bgSize?: string;
  isCustom?: boolean;
}

const CHAT_BACKGROUNDS: ChatBg[] = [
  { id: "midnight",  label: "Midnight",  imgValue: "linear-gradient(145deg,#0f0c29 0%,#302b63 55%,#24243e 100%)", bgColor: "#0f0c29" },
  { id: "galaxy",   label: "Galaxy",    imgValue: "linear-gradient(160deg,#0d1b2a 0%,#162032 45%,#0f3460 100%)",  bgColor: "#0d1b2a" },
  { id: "noir",     label: "Noir",      imgValue: "linear-gradient(140deg,#111827 0%,#1f2937 100%)",               bgColor: "#111827" },
  { id: "ocean",    label: "Ocean",     imgValue: "linear-gradient(155deg,#004e92 0%,#000428 100%)",               bgColor: "#004e92" },
  { id: "sunset",   label: "Sunset",    imgValue: "linear-gradient(135deg,#f7971e 0%,#e84393 50%,#8b5cf6 100%)",  bgColor: "#f7971e" },
  { id: "forest",   label: "Forest",    imgValue: "linear-gradient(145deg,#0a3d2b 0%,#1a6b47 55%,#2d9966 100%)", bgColor: "#0a3d2b" },
  { id: "rose",     label: "Rose",      imgValue: "linear-gradient(145deg,#c0392b 0%,#e91e8c 55%,#f093fb 100%)", bgColor: "#c0392b" },
  { id: "minimal",  label: "Minimal",   imgValue: "linear-gradient(160deg,#e8edf2 0%,#d1d9e0 100%)",              bgColor: "#e8edf2" },
  { id: "dots",     label: "Dots",      imgValue: "radial-gradient(circle,#3b82f6 1.2px,transparent 1.2px)", bgColor: "#0f172a", bgSize: "18px 18px" },
  { id: "custom",   label: "Custom",    imgValue: null, bgColor: "#0f0c29", isCustom: true },
];

const DEFAULT_BG = CHAT_BACKGROUNDS[0];

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function MessageSkeleton({ isMe }: { isMe: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && <div className="skeleton rounded-full flex-shrink-0" style={{ width: 30, height: 30 }} />}
      <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        <div className={`skeleton h-10 rounded-[18px] ${isMe ? "rounded-br-[4px]" : "rounded-bl-[4px]"}`}
          style={{ width: isMe ? 140 : 180 }} />
      </div>
    </div>
  );
}

function OnlineStatus({ isOnline, lastOnline }: { isOnline: boolean; lastOnline: string | null }) {
  if (isOnline) return <span className="text-[10px] text-green-400 font-medium">Online</span>;
  if (!lastOnline) return <span className="text-[10px] text-gray-400 dark:text-gray-500">Offline</span>;
  const diff = Date.now() - new Date(lastOnline).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const label = mins < 1 ? "Just now" : mins < 60 ? `${mins}m ago` : hours < 24 ? `${hours}h ago` : `${days}d ago`;
  return <span className="text-[10px] text-gray-400 dark:text-gray-500">Last seen {label}</span>;
}

function ReadReceipt({ isMe, read }: { isMe: boolean; read?: boolean }) {
  if (!isMe) return null;
  return (
    <span className={`flex-shrink-0 ${read ? "text-blue-400" : "text-gray-400"}`}>
      {read ? <CheckCheck size={12} /> : <Check size={12} />}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[18px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Voice Note Player ---------- */
const WAVEFORM_TEMPLATE = [0.4,0.6,0.8,0.5,0.9,0.65,0.75,0.45,0.85,0.55,0.7,0.4,0.95,0.6,0.5,0.8,0.35,0.7,0.9,0.55,0.65,0.45,0.8,0.6,0.7,0.5,0.4,0.85,0.65,0.75];

function VoiceNotePlayer({ url, isMe }: { url: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < url.length; i++) seed = (seed * 31 + url.charCodeAt(i)) & 0xffff;
    return WAVEFORM_TEMPLATE.map((h) => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      const rand = (seed & 0xffff) / 0xffff;
      return Math.max(0.15, Math.min(1.0, h * 0.65 + rand * 0.35));
    });
  }, [url]);

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const handleDuration = () => {
    const d = audioRef.current?.duration;
    if (d && isFinite(d)) setDuration(d);
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => { if (audioRef.current) setCurrent(audioRef.current.currentTime); };
  const handleEnded = () => { setPlaying(false); setCurrent(0); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrent(val);
  };

  const knownDuration = duration > 0 && isFinite(duration);
  const progress = knownDuration ? current / duration : 0;
  const playedCount = Math.floor(progress * bars.length);

  const sent = isMe;

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[22px] min-w-[220px] max-w-[280px] ${
      sent ? "rounded-br-[6px] bg-blue-600" : "rounded-bl-[6px] bg-white border border-black/10 shadow-sm"
    }`}>
      <audio ref={audioRef} src={url} preload="metadata"
        onLoadedMetadata={handleDuration}
        onDurationChange={handleDuration}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded} />

      <button onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
          sent ? "bg-white/25 hover:bg-white/35" : "bg-blue-600 hover:bg-blue-700"
        }`}>
        {playing
          ? <Pause size={15} className="text-white" />
          : <Play size={15} className="text-white ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <input
          type="range" min={0} max={knownDuration ? duration : 100} step={0.01}
          value={knownDuration ? current : 0} onChange={handleSeek}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
        <div
          className="flex items-center gap-[2.5px] h-7 cursor-pointer"
          onClick={(e) => {
            if (!knownDuration || !audioRef.current) return;
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const newTime = ratio * duration;
            audioRef.current.currentTime = newTime;
            setCurrent(newTime);
          }}
        >
          {bars.map((h, i) => (
            <div key={i} className="rounded-full flex-1 transition-all duration-100"
              style={{
                height: `${h * 100}%`,
                backgroundColor: sent
                  ? i < playedCount ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)"
                  : i < playedCount ? "#2563eb" : "#2563eb55",
              }}
            />
          ))}
        </div>
        <span className={`text-[10px] font-medium tabular-nums self-end leading-none ${sent ? "text-white/70" : "text-gray-500"}`}>
          {playing || current > 0 ? fmt(current) : knownDuration ? fmt(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}

/* ---------- Media Preview ---------- */
function MediaPreview({ url, type, isMe }: { url: string; type: string; isMe: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [vidError, setVidError] = useState(false);
  const bubble = isMe
    ? "bg-blue-600 text-white rounded-[18px] rounded-br-[4px]"
    : "bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-[18px] rounded-bl-[4px]";

  if (!url) return null;

  if (type === "image") {
    if (imgError) return (
      <div className="mt-1 w-[220px] h-32 rounded-2xl bg-white/10 flex items-center justify-center">
        <span className="text-white/40 text-xs">Image unavailable</span>
      </div>
    );
    return (
      <div className="mt-1 max-w-[220px] overflow-hidden rounded-2xl bg-white/5">
        <img
          src={url}
          alt="Image"
          className={`max-w-[220px] max-h-56 object-cover rounded-2xl w-full block transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
        {!imgLoaded && !imgError && (
          <div className="w-[220px] h-32 flex items-center justify-center">
            <Loader2 size={18} className="text-white/40 animate-spin" />
          </div>
        )}
      </div>
    );
  }
  if (type === "video") {
    if (vidError) return (
      <div className="mt-1 w-[260px] h-32 rounded-2xl bg-white/10 flex items-center justify-center">
        <span className="text-white/40 text-xs">Video unavailable</span>
      </div>
    );
    return (
      <div className="mt-1 max-w-[260px] rounded-2xl overflow-hidden bg-black">
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          className="rounded-2xl max-w-[260px] max-h-56 block w-full"
          onError={() => setVidError(true)}
        />
      </div>
    );
  }
  if (type === "audio") {
    return <VoiceNotePlayer url={url} isMe={isMe} />;
  }
  if (type === "file") {
    const filename = url.split("/").pop() || "File";
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className={`mt-1 flex items-center gap-2 px-4 py-3 text-sm hover:opacity-90 transition-opacity max-w-[220px] ${bubble}`}>
        <FileText size={16} />
        <span className="truncate">{filename}</span>
      </a>
    );
  }
  return null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{ data: string; serverUrl: string; type: string; name: string; uploading: boolean } | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserLastOnline, setOtherUserLastOnline] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatBg, setChatBg] = useState<ChatBg>(DEFAULT_BG);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  const [clanInfo, setClanInfo] = useState<ClanInfo | null>(null);
  const [isClanChat, setIsClanChat] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  selectedConvRef.current = selectedConv;

  const [contextMsg, setContextMsg] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Load persisted chat background ---- */
  useEffect(() => {
    try {
      const savedId = localStorage.getItem("chatBgId");
      const savedCustomUrl = localStorage.getItem("chatBgCustomUrl");
      if (savedId === "custom" && savedCustomUrl) {
        setCustomBgUrl(savedCustomUrl);
        setChatBg({ ...CHAT_BACKGROUNDS[CHAT_BACKGROUNDS.length - 1], imgValue: null, isCustom: true });
      } else if (savedId) {
        const bg = CHAT_BACKGROUNDS.find((b) => b.id === savedId);
        if (bg) setChatBg(bg);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setCurrentUserId(d.user?._id || d.user?.id || null);
      if (d.user?.clanId) {
        setClanInfo({ id: d.user.clanId, name: d.user.clanName || "World Chat", logo: d.user.clanLogo || "" });
      }
    });
    loadConversations();
    loadUsers();
    const convPoll = setInterval(() => loadConversations(true), 10000);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadConversations(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(convPoll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(e.target as Node)) setShowMediaMenu(false);
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node)) setShowBgPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selectedConv) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [selectedConv]);

  const pollConversation = useCallback(async () => {
    const conv = selectedConvRef.current;
    if (!conv || conv._id === "new") return;
    try {
      if (conv._id.startsWith("clan-")) {
        const clanId = conv._id.replace("clan-", "");
        const res = await fetch(`/api/clans/${clanId}/chat`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            _id: m._id, senderId: m.senderId, senderName: m.senderName,
            senderImage: m.senderImage, content: m.content, createdAt: m.createdAt,
          })));
        }
      } else {
        const res = await fetch(`/api/messages/${conv._id}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
        if (typeof data.otherUserOnline === "boolean") setOtherUserOnline(data.otherUserOnline);
        if (data.otherUserLastOnline !== undefined) setOtherUserLastOnline(data.otherUserLastOnline);
        if (typeof data.otherUserTyping === "boolean") setOtherUserTyping(data.otherUserTyping);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedConv && selectedConv._id !== "new") {
      pollRef.current = setInterval(pollConversation, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv, pollConversation]);

  const sendTypingSignal = useCallback(async () => {
    const conv = selectedConvRef.current;
    if (!conv || conv._id === "new") return;
    try { await fetch(`/api/messages/${conv._id}/typing`, { method: "POST" }); } catch {}
  }, []);

  const handleTextChange = (val: string) => {
    setMessageText(val);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (val) sendTypingSignal();
  };

  const loadConversations = async (silent = false) => {
    if (!silent) {
      const cached = cache.get<any[]>("conversations");
      if (cached) {
        setConversations(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
    const res = await fetch("/api/messages");
    const data = await res.json();
    cache.set("conversations", data.conversations || [], 60);
    setConversations(data.conversations || []);
    setLoading(false);
  };

  const loadUsers = async () => {
    const res = await fetch("/api/users?limit=50");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setMessages([]);
    setOtherUserTyping(false);
    setAudioBlob(null);
    setPendingMedia(null);
    setLoadingMessages(true);
    const isClan = conv._id.startsWith("clan-");
    setIsClanChat(isClan);
    if (isClan) {
      const clanId = conv._id.replace("clan-", "");
      try {
        const res = await fetch(`/api/clans/${clanId}/chat`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            _id: m._id, senderId: m.senderId, senderName: m.senderName,
            senderImage: m.senderImage, content: m.content, createdAt: m.createdAt,
          })));
        }
      } catch {}
    } else if (conv._id !== "new") {
      const res = await fetch(`/api/messages/${conv._id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      if (typeof data.otherUserOnline === "boolean") setOtherUserOnline(data.otherUserOnline);
      if (data.otherUserLastOnline !== undefined) setOtherUserLastOnline(data.otherUserLastOnline);
      if (typeof data.otherUserTyping === "boolean") setOtherUserTyping(data.otherUserTyping);
    }
    setLoadingMessages(false);
  };

  const closeChat = () => {
    setSelectedConv(null);
    setMessages([]);
    setPendingMedia(null);
    setMessageText("");
    setAudioBlob(null);
    setShowBgPicker(false);
    setIsClanChat(false);
    stopRecording();
  };

  const startNewConversation = async (user: ConnectedUser) => {
    setShowNewConv(false);
    setUserSearch("");
    const existing = conversations.find((c) => c.participants.includes(user._id));
    if (existing) { openConversation(existing); return; }
    openConversation({ _id: "new", participants: [currentUserId || "", user._id], otherUser: user });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const blobUrl = URL.createObjectURL(file);
    setPendingMedia({ data: blobUrl, serverUrl: "", type, name: file.name, uploading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "messages");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setPendingMedia((prev) => prev ? { ...prev, serverUrl: url, uploading: false } : null);
    } catch {
      URL.revokeObjectURL(blobUrl);
      setPendingMedia(null);
    }
  };

  const handleCustomBgSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setCustomBgUrl(dataUrl);
      setChatBg({ ...CHAT_BACKGROUNDS[CHAT_BACKGROUNDS.length - 1], imgValue: null, isCustom: true });
      try {
        localStorage.setItem("chatBgId", "custom");
        localStorage.setItem("chatBgCustomUrl", dataUrl);
      } catch {}
      setShowBgPicker(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const selectBg = (bg: ChatBg) => {
    setChatBg(bg);
    try {
      localStorage.setItem("chatBgId", bg.id);
      localStorage.removeItem("chatBgCustomUrl");
    } catch {}
    setShowBgPicker(false);
  };

  const handleMediaMenuSelect = (type: "image" | "video" | "file") => {
    setShowMediaMenu(false);
    setTimeout(() => {
      if (type === "image") imageInputRef.current?.click();
      else if (type === "video") videoInputRef.current?.click();
      else fileInputRef.current?.click();
    }, 80);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch { alert("Microphone permission denied"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelRecording = () => { stopRecording(); setAudioBlob(null); audioChunksRef.current = []; };

  const sendMessage = async () => {
    const hasText = messageText.trim();
    const hasMedia = pendingMedia || audioBlob;
    if (!hasText && !hasMedia) return;
    if (!isClanChat && !selectedConv?.otherUser) return;
    if (pendingMedia?.uploading) return;
    setSendingMsg(true);

    if (isClanChat && selectedConv?._id.startsWith("clan-")) {
      const clanId = selectedConv._id.replace("clan-", "");
      if (!hasText) { setSendingMsg(false); return; }
      try {
        const res = await fetch(`/api/clans/${clanId}/chat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageText.trim() }),
        });
        const data = await res.json();
        if (data.message) {
          const m = data.message;
          setMessages((prev) => [...prev, {
            _id: m._id, senderId: m.senderId, senderName: m.senderName,
            senderImage: m.senderImage, content: m.content, createdAt: m.createdAt,
          }]);
          setMessageText("");
        }
      } catch {}
      setSendingMsg(false);
      return;
    }

    let mediaUrlToSend = pendingMedia?.serverUrl || "";
    let mediaTypeToSend = pendingMedia?.type || "";

    if (audioBlob && !pendingMedia) {
      try {
        const audioFile = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("subfolder", "messages");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          mediaUrlToSend = url;
          mediaTypeToSend = "audio";
        }
      } catch {
        setSendingMsg(false);
        return;
      }
    }

    const body: Record<string, string> = { recipientId: selectedConv?.otherUser?._id || "", content: messageText };
    if (mediaUrlToSend) { body.mediaUrl = mediaUrlToSend; body.mediaType = mediaTypeToSend || "file"; }

    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setMessageText("");
      setPendingMedia(null);
      setAudioBlob(null);
      cache.invalidate("conversations");
      loadConversations(true);
    }
    setSendingMsg(false);
  };

  const startLongPress = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      if (msg.senderId === currentUserId && !msg.isDeleted) setContextMsg(msg);
    }, 480);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const openEdit = (msg: Message) => {
    setContextMsg(null);
    setEditingMsgId(msg._id);
    setEditText(msg.content);
  };

  const submitEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    const res = await fetch(`/api/messages/message/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText.trim() }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => prev.map((m) => m._id === msgId ? { ...m, content: data.message.content, edited: true } : m));
    }
    setEditingMsgId(null);
    setEditText("");
  };

  const deleteMessage = async (msgId: string) => {
    setContextMsg(null);
    const res = await fetch(`/api/messages/message/${msgId}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => m._id === msgId ? { ...m, isDeleted: true, content: "", mediaUrl: "", mediaType: "" } : m));
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const formatRecording = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const skeletonRows = [false, true, false, true, true, false];

  const chatAreaStyle: React.CSSProperties = {
    backgroundColor: chatBg.bgColor,
    backgroundImage: chatBg.isCustom && customBgUrl
      ? `url(${customBgUrl})`
      : (chatBg.imgValue ?? undefined),
    backgroundSize: chatBg.isCustom && customBgUrl ? "cover" : (chatBg.bgSize ?? (chatBg.imgValue ? "cover" : undefined)),
    backgroundPosition: "center",
  };

  return (
    <>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "file")} />
      <input ref={customBgInputRef} type="file" accept="image/*" className="hidden" onChange={handleCustomBgSelect} />

      {/* Conversation List */}
      <div className="flex h-[calc(100vh-112px)]">
        <div className="w-full flex flex-col bg-white dark:bg-gray-900">
          <div className="px-4 pt-4 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white text-xl">Messages</h2>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewConv(!showNewConv)}
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-btn">
                <MessageCircle size={16} />
              </motion.button>
            </div>
            <AnimatePresence>
              {showNewConv && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search people..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                  <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                    {filteredUsers.slice(0, 10).map((u) => (
                      <button key={u._id} onClick={() => startNewConversation(u)}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                        <Avatar src={u.profileImage} name={u.name} size={34} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-1">
                    <div className="skeleton rounded-full flex-shrink-0" style={{ width: 48, height: 48 }} />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3.5 w-2/5" />
                      <div className="skeleton h-3 w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {clanInfo && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openConversation({ _id: `clan-${clanInfo.id}`, participants: [], otherUser: { _id: clanInfo.id, name: `${clanInfo.name} — World Chat`, username: "world-chat", profileImage: clanInfo.logo } })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left border-b border-black/5 dark:border-white/5">
                    <div className="relative flex-shrink-0">
                      {clanInfo.logo ? (
                        <img src={clanInfo.logo} alt={clanInfo.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Users size={22} className="text-white" />
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                        <Users size={8} className="text-white" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{clanInfo.name}</div>
                      <div className="text-xs text-blue-500 dark:text-blue-400 truncate mt-0.5 font-medium">World Chat</div>
                    </div>
                  </motion.button>
                )}
                {conversations.length === 0 && !clanInfo ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={36} />
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-xs mt-1 text-gray-400">Tap the icon above to start one</p>
                  </div>
                ) : conversations.map((conv) => (
                  <motion.button key={conv._id} whileTap={{ scale: 0.98 }}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left border-b border-black/5 dark:border-white/5">
                    <Avatar src={conv.otherUser?.profileImage} name={conv.otherUser?.name || "?"} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{conv.otherUser?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage || "Start a conversation"}</div>
                    </div>
                  </motion.button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Chat Overlay */}
      <AnimatePresence>
        {selectedConv && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-white/10"
              style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={closeChat}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0">
                <ArrowLeft size={20} />
              </motion.button>

              <div className="relative flex-shrink-0">
                {isClanChat && clanInfo?.logo ? (
                  <img src={clanInfo.logo} alt={clanInfo.name} className="w-10 h-10 rounded-full object-cover" />
                ) : isClanChat ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                ) : (
                  <Avatar src={selectedConv.otherUser?.profileImage} name={selectedConv.otherUser?.name || "?"} size={40} />
                )}
                {!isClanChat && otherUserOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white/20 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {isClanChat ? clanInfo?.name : selectedConv.otherUser?.name}
                </div>
                {isClanChat ? (
                  <span className="text-[10px] text-blue-300 font-medium">World Chat</span>
                ) : otherUserTyping ? (
                  <motion.span key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] text-blue-300 font-medium italic">typing...</motion.span>
                ) : (
                  <OnlineStatus isOnline={otherUserOnline} lastOnline={otherUserLastOnline} />
                )}
              </div>

              {/* Background picker */}
              <div className="relative flex-shrink-0" ref={bgPickerRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBgPicker(!showBgPicker)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showBgPicker ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
                  title="Chat background">
                  <Palette size={18} />
                </motion.button>
                <AnimatePresence>
                  {showBgPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-3 z-10 w-60"
                    >
                      <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2.5 px-1">Chat Background</p>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {CHAT_BACKGROUNDS.filter((b) => !b.isCustom).map((bg) => (
                          <button key={bg.id}
                            onClick={() => selectBg(bg)}
                            className={`relative h-10 w-10 rounded-xl border-2 transition-all overflow-hidden ${chatBg.id === bg.id ? "border-blue-400 scale-110" : "border-white/10 hover:border-white/30"}`}
                            style={{
                              backgroundColor: bg.bgColor,
                              backgroundImage: bg.imgValue ?? undefined,
                              backgroundSize: bg.bgSize ?? "cover",
                            }}
                            title={bg.label}
                          >
                            {chatBg.id === bg.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow">
                                  <Check size={9} className="text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-[10px] text-white/40 mb-2">{chatBg.label}</p>
                      <button
                        onClick={() => customBgInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 text-xs font-medium transition-all"
                      >
                        <Upload size={13} />
                        {chatBg.isCustom && customBgUrl ? "Change custom image" : "Upload custom image"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3"
              style={chatAreaStyle}>
              {loadingMessages ? (
                <div className="space-y-4">
                  {skeletonRows.map((isMe, i) => <MessageSkeleton key={i} isMe={isMe} />)}
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        {isClanChat ? <Users size={28} className="text-white/80" /> : <MessageCircle size={28} className="text-white/80" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm drop-shadow">
                          {isClanChat ? `Welcome to ${clanInfo?.name} World Chat!` : `Say hello to ${selectedConv.otherUser?.name?.split(" ")[0]}!`}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">
                          {isClanChat ? "Be the first to say something" : "Start the conversation below"}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;
                      const isEditing = editingMsgId === msg._id;
                      return (
                        <motion.div key={msg._id}
                          initial={{ opacity: 0, y: 14, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.22 }}
                          className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                          onMouseDown={() => !isClanChat && startLongPress(msg)}
                          onMouseUp={cancelLongPress}
                          onMouseLeave={cancelLongPress}
                          onTouchStart={() => !isClanChat && startLongPress(msg)}
                          onTouchEnd={cancelLongPress}
                          onTouchMove={cancelLongPress}
                        >
                          {!isMe && <Avatar src={msg.senderImage} name={msg.senderName} size={30} />}
                          <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {isClanChat && !isMe && (
                              <span className="text-[10px] text-white/50 font-medium px-1 mb-0.5 truncate max-w-full">{msg.senderName}</span>
                            )}
                            {msg.isDeleted ? (
                              <div className={`px-4 py-2.5 text-sm italic opacity-50 rounded-[18px] ${
                                isMe ? "bg-blue-600/60 text-white rounded-br-[4px]" : "bg-white/10 text-white rounded-bl-[4px]"
                              }`}>
                                Message deleted
                              </div>
                            ) : (
                              <>
                                {msg.mediaUrl && (
                                  <MediaPreview url={msg.mediaUrl} type={msg.mediaType || "file"} isMe={isMe} />
                                )}
                                {isEditing ? (
                                  <div className="flex gap-2 items-center mt-1">
                                    <input
                                      autoFocus
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") submitEdit(msg._id); if (e.key === "Escape") setEditingMsgId(null); }}
                                      className="px-3 py-2 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 min-w-[160px]"
                                    />
                                    <button onClick={() => submitEdit(msg._id)}
                                      className="px-3 py-2 text-xs bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors">Save</button>
                                    <button onClick={() => setEditingMsgId(null)}
                                      className="p-2 text-white/50 hover:text-white transition-colors"><X size={14} /></button>
                                  </div>
                                ) : (
                                  msg.content && (
                                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${msg.mediaUrl ? "mt-1" : ""} ${
                                      isMe
                                        ? "bg-blue-600 text-white rounded-[18px] rounded-br-[4px]"
                                        : "bg-white/15 backdrop-blur-sm border border-white/15 text-white rounded-[18px] rounded-bl-[4px]"
                                    }`}>
                                      {msg.content}
                                      {msg.edited && <span className="text-[9px] opacity-50 ml-1">edited</span>}
                                    </div>
                                  )
                                )}
                              </>
                            )}
                            {isMe && !msg.isDeleted && (
                              <div className="flex items-center gap-1 mt-0.5 pr-1">
                                <ReadReceipt isMe={isMe} read={msg.read} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {otherUserTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Pending media/audio preview */}
            <AnimatePresence>
              {(pendingMedia || audioBlob) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 px-4 py-2.5 bg-black/30 backdrop-blur-sm border-t border-white/10 flex items-center gap-3 overflow-hidden">
                  {pendingMedia?.type === "image" && <img src={pendingMedia.data} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                  {pendingMedia?.type === "video" && (
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Film size={18} className="text-purple-300" />
                    </div>
                  )}
                  {pendingMedia?.type === "file" && (
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-green-300" />
                    </div>
                  )}
                  {audioBlob && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <Mic size={14} className="text-blue-300" />
                      </div>
                      <span className="text-xs text-white/70">Voice note ready to send</span>
                    </div>
                  )}
                  {pendingMedia && <span className="text-sm text-white/70 truncate flex-1">{pendingMedia.name}</span>}
                  <button onClick={() => { setPendingMedia(null); setAudioBlob(null); }}
                    className="text-white/40 hover:text-red-400 transition-colors p-1">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="flex-shrink-0 px-3 py-3 bg-black/20 backdrop-blur-xl border-t border-white/10"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={cancelRecording}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0">
                    <X size={18} />
                  </motion.button>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/20 border border-red-400/30">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-red-400 rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium text-red-300">Recording</span>
                    <span className="text-sm text-red-400 ml-auto">{formatRecording(recordingSeconds)}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={stopRecording}
                    className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <StopCircle size={18} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0" ref={mediaMenuRef}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                      onClick={() => setShowMediaMenu(!showMediaMenu)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showMediaMenu ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      <motion.div animate={{ rotate: showMediaMenu ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={18} />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {showMediaMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.88, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden z-10 w-44"
                        >
                          {[
                            { label: "Photo", type: "image" as const, icon: ImageIcon, color: "text-blue-400", bg: "bg-blue-500/20" },
                            { label: "Video", type: "video" as const, icon: Film, color: "text-purple-400", bg: "bg-purple-500/20" },
                            { label: "File", type: "file" as const, icon: Paperclip, color: "text-green-400", bg: "bg-green-500/20" },
                          ].map(({ label, type, icon: Icon, color, bg }) => (
                            <button key={type} onClick={() => handleMediaMenuSelect(type)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors">
                              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                                <Icon size={15} />
                              </div>
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input type="text" value={messageText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Message..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/15 transition-all"
                  />

                  <AnimatePresence mode="wait">
                    {messageText.trim() || pendingMedia || audioBlob ? (
                      <motion.button key="send"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onClick={sendMessage} disabled={sendingMsg || !!pendingMedia?.uploading}
                        className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors shadow-btn disabled:opacity-50 flex-shrink-0">
                        {sendingMsg ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      </motion.button>
                    ) : (
                      <motion.button key="mic"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onMouseDown={startRecording} onTouchStart={startRecording}
                        className="w-9 h-9 bg-white/10 text-white/70 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                        title="Hold to record">
                        <Mic size={17} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Long-press context menu */}
      <AnimatePresence>
        {contextMsg && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/40"
              onClick={() => setContextMsg(null)}
            />
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[301] bg-gray-900 rounded-t-3xl border-t border-white/10 p-4 pb-8"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold px-1 mb-3">Message</p>
              {contextMsg.content && (
                <button
                  onClick={() => openEdit(contextMsg)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl hover:bg-white/8 transition-colors text-left mb-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Edit</div>
                    <div className="text-[11px] text-white/40">Change message text</div>
                  </div>
                </button>
              )}
              <button
                onClick={() => deleteMessage(contextMsg._id)}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl hover:bg-red-500/10 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <X size={16} className="text-red-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-red-400">Delete</div>
                  <div className="text-[11px] text-white/40">Remove for everyone</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
