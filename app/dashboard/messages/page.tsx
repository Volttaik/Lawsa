"use client";
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
import Linkify from "@/components/Linkify";
import { cache } from "@/lib/cache";
import { uploadFile } from "@/lib/uploadClient";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send, Loader2, ArrowLeft, MessageCircle, Users,
  Image as ImageIcon, Film, Paperclip, X, Play, FileText,
  Plus, Mic, StopCircle, Check, CheckCheck, Palette, Upload,
  Pause, ChevronDown, AlertCircle,
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
  { id: "midnight", label: "Midnight", imgValue: "linear-gradient(145deg,#0f0c29 0%,#302b63 55%,#24243e 100%)", bgColor: "#0f0c29" },
  { id: "galaxy",   label: "Galaxy",   imgValue: "linear-gradient(160deg,#0d1b2a 0%,#162032 45%,#0f3460 100%)",  bgColor: "#0d1b2a" },
  { id: "noir",     label: "Noir",     imgValue: "linear-gradient(140deg,#111827 0%,#1f2937 100%)",               bgColor: "#111827" },
  { id: "ocean",    label: "Ocean",    imgValue: "linear-gradient(155deg,#004e92 0%,#000428 100%)",               bgColor: "#004e92" },
  { id: "sunset",   label: "Sunset",   imgValue: "linear-gradient(135deg,#f7971e 0%,#e84393 50%,#8b5cf6 100%)",  bgColor: "#f7971e" },
  { id: "forest",   label: "Forest",   imgValue: "linear-gradient(145deg,#0a3d2b 0%,#1a6b47 55%,#2d9966 100%)", bgColor: "#0a3d2b" },
  { id: "rose",     label: "Rose",     imgValue: "linear-gradient(145deg,#c0392b 0%,#e91e8c 55%,#f093fb 100%)", bgColor: "#c0392b" },
  { id: "minimal",  label: "Minimal",  imgValue: "linear-gradient(160deg,#e8edf2 0%,#d1d9e0 100%)",              bgColor: "#e8edf2" },
  { id: "dots",     label: "Dots",     imgValue: "radial-gradient(circle,#3b82f6 1.2px,transparent 1.2px)",      bgColor: "#0f172a", bgSize: "18px 18px" },
  { id: "custom",   label: "Custom",   imgValue: null, bgColor: "#0f0c29", isCustom: true },
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
        <div className={`skeleton h-10 rounded-2xl`} style={{ width: isMe ? 140 : 180 }} />
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
      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 flex items-center gap-1">
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

  const knownDuration = duration > 0 && isFinite(duration);
  const progress = knownDuration ? current / duration : 0;
  const playedCount = Math.floor(progress * bars.length);

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-[240px] max-w-[300px] ${
      isMe ? "bg-blue-600" : "bg-white/95 backdrop-blur-sm border border-black/8"
    }`}>
      <audio ref={audioRef} src={url} preload="metadata"
        onLoadedMetadata={handleDuration}
        onDurationChange={handleDuration}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded} />
      <button onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
          isMe ? "bg-white/25 hover:bg-white/35" : "bg-blue-600 hover:bg-blue-700"
        }`}>
        {playing ? <Pause size={15} className="text-white" /> : <Play size={15} className="text-white ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div
          className="flex items-center gap-[2.5px] h-7 cursor-pointer"
          onClick={(e) => {
            if (!knownDuration || !audioRef.current) return;
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * duration;
            setCurrent(ratio * duration);
          }}
        >
          {bars.map((h, i) => (
            <div key={i} className="rounded-full flex-1 transition-all duration-100"
              style={{
                height: `${h * 100}%`,
                backgroundColor: isMe
                  ? i < playedCount ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)"
                  : i < playedCount ? "#2563eb" : "#2563eb55",
              }}
            />
          ))}
        </div>
        <span className={`text-[10px] font-medium tabular-nums self-end leading-none ${isMe ? "text-white/70" : "text-gray-500"}`}>
          {playing || current > 0 ? fmt(current) : knownDuration ? fmt(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}

function MediaPreview({ url, type, isMe }: { url: string; type: string; isMe: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [vidError, setVidError] = useState(false);

  if (!url) return null;

  if (type === "image") {
    if (imgError) return (
      <div className="mt-1 w-[300px] h-40 rounded-2xl bg-white/10 flex items-center justify-center">
        <span className="text-white/40 text-xs">Image unavailable</span>
      </div>
    );
    return (
      <div className="mt-1 max-w-[300px] overflow-hidden rounded-2xl bg-white/5">
        <img
          src={url}
          alt="Image"
          className={`max-w-[300px] max-h-80 object-cover rounded-2xl w-full block transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
        {!imgLoaded && !imgError && (
          <div className="w-[300px] h-40 flex items-center justify-center">
            <Loader2 size={18} className="text-white/40 animate-spin" />
          </div>
        )}
      </div>
    );
  }
  if (type === "video") {
    if (vidError) return (
      <div className="mt-1 w-[320px] h-40 rounded-2xl bg-white/10 flex items-center justify-center">
        <span className="text-white/40 text-xs">Video unavailable</span>
      </div>
    );
    return (
      <div className="mt-1 max-w-[320px] rounded-2xl overflow-hidden bg-black">
        <video src={url} controls preload="metadata" playsInline
          className="rounded-2xl max-w-[320px] max-h-80 block w-full"
          onError={() => setVidError(true)} />
      </div>
    );
  }
  if (type === "audio") return <VoiceNotePlayer url={url} isMe={isMe} />;
  if (type === "file") {
    const filename = url.split("/").pop() || "File";
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className={`mt-1 flex items-center gap-2 px-4 py-3 text-sm hover:opacity-90 transition-opacity max-w-[260px] rounded-2xl ${
          isMe ? "bg-blue-600 text-white" : "bg-white/15 backdrop-blur-sm border border-white/20 text-white"
        }`}>
        <FileText size={16} />
        <span className="truncate">{filename}</span>
      </a>
    );
  }
  return null;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const prevMsgCountRef = useRef(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  selectedConvRef.current = selectedConv;

  const [contextMsg, setContextMsg] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const onVisible = () => { if (document.visibilityState === "visible") loadConversations(true); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(convPoll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open conversation from URL param
  useEffect(() => {
    if (!autoUserId || !users.length) return;
    const user = users.find((u) => u._id === autoUserId);
    if (user) startNewConversation(user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUserId, users]);

  const isNearBottom = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setShowScrollBtn(false);
    setNewMsgCount(0);
  }, []);

  const handleChatScroll = useCallback(() => {
    const near = isNearBottom();
    setShowScrollBtn(!near);
    if (near) setNewMsgCount(0);
  }, [isNearBottom]);

  useEffect(() => {
    const prev = prevMsgCountRef.current;
    const curr = messages.length;
    if (curr === 0) { prevMsgCountRef.current = 0; return; }
    if (prev === 0) {
      scrollToBottom(false);
    } else if (curr > prev) {
      if (isNearBottom()) scrollToBottom(true);
      else { setNewMsgCount((n) => n + (curr - prev)); setShowScrollBtn(true); }
    }
    prevMsgCountRef.current = curr;
  }, [messages, isNearBottom, scrollToBottom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(e.target as Node)) setShowMediaMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selectedConv) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedConv]);

  const pollConversation = useCallback(async () => {
    const conv = selectedConvRef.current;
    if (!conv || conv._id === "new") return;
    const convId = conv._id;
    try {
      if (convId.startsWith("clan-")) {
        const clanId = convId.replace("clan-", "");
        const res = await fetch(`/api/clans/${clanId}/chat`);
        const data = await res.json();
        // discard if user switched away while request was in-flight
        if (selectedConvRef.current?._id !== convId) return;
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            _id: m._id, senderId: m.senderId, senderName: m.senderName,
            senderImage: m.senderImage, content: m.content, createdAt: m.createdAt,
          })));
        }
      } else {
        const res = await fetch(`/api/messages/${convId}`);
        const data = await res.json();
        // discard if user switched away while request was in-flight
        if (selectedConvRef.current?._id !== convId) return;
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
      if (cached && cached.length > 0) {
        setConversations(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      const convs = data.conversations || [];
      cache.set("conversations", convs, 60);
      setConversations(convs);
    } catch {
      // keep whatever is already showing
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const res = await fetch("/api/users?limit=50");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const openConversation = async (conv: Conversation) => {
    const convId = conv._id;
    // Clear immediately so no old messages flash
    setMessages([]);
    setSelectedConv(conv);
    setOtherUserTyping(false);
    setAudioBlob(null);
    setPendingMedia(null);
    setUploadError(null);
    setLoadingMessages(true);
    const isClan = convId.startsWith("clan-");
    setIsClanChat(isClan);
    if (isClan) {
      const clanId = convId.replace("clan-", "");
      try {
        const res = await fetch(`/api/clans/${clanId}/chat`);
        const data = await res.json();
        if (selectedConvRef.current?._id !== convId) return;
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            _id: m._id, senderId: m.senderId, senderName: m.senderName,
            senderImage: m.senderImage, content: m.content, createdAt: m.createdAt,
          })));
        }
      } catch {}
    } else if (convId !== "new") {
      try {
        const res = await fetch(`/api/messages/${convId}`);
        const data = await res.json();
        if (selectedConvRef.current?._id !== convId) return;
        setMessages(data.messages || []);
        if (typeof data.otherUserOnline === "boolean") setOtherUserOnline(data.otherUserOnline);
        if (data.otherUserLastOnline !== undefined) setOtherUserLastOnline(data.otherUserLastOnline);
        if (typeof data.otherUserTyping === "boolean") setOtherUserTyping(data.otherUserTyping);
      } catch {}
    }
    setLoadingMessages(false);
  };

  const closeChat = () => {
    setSelectedConv(null);
    setMessages([]);
    setPendingMedia(null);
    setMessageText("");
    setAudioBlob(null);
    setUploadError(null);
    setIsClanChat(false);
    setShowScrollBtn(false);
    setNewMsgCount(0);
    prevMsgCountRef.current = 0;
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
    setUploadError(null);
    const blobUrl = URL.createObjectURL(file);
    setPendingMedia({ data: blobUrl, serverUrl: "", type, name: file.name, uploading: true });
    try {
      const url = await uploadFile(file, "messages");
      setPendingMedia((prev) => prev ? { ...prev, serverUrl: url, uploading: false } : null);
    } catch (err: any) {
      URL.revokeObjectURL(blobUrl);
      setPendingMedia(null);
      setUploadError(err?.message || "Failed to upload file. Please try again.");
    }
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
    setUploadError(null);

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
        const url = await uploadFile(audioFile, "messages");
        mediaUrlToSend = url;
        mediaTypeToSend = "audio";
      } catch (err: any) {
        setUploadError(err?.message || "Failed to upload voice note.");
        setSendingMsg(false);
        return;
      }
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId, senderId: currentUserId || "", senderName: "",
      content: messageText, mediaUrl: mediaUrlToSend || undefined,
      mediaType: mediaTypeToSend || undefined, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageText("");
    setPendingMedia(null);
    setAudioBlob(null);

    const body: Record<string, string> = { recipientId: selectedConv?.otherUser?._id || "", content: optimisticMsg.content };
    if (mediaUrlToSend) { body.mediaUrl = mediaUrlToSend; body.mediaType = mediaTypeToSend || "file"; }

    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => prev.map((m) => m._id === tempId ? data.message : m));
      cache.invalidate("conversations");
      loadConversations(true);
    } else {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setUploadError("Failed to send message. Please try again.");
    }
    setSendingMsg(false);
  };

  const startLongPress = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      if (msg.senderId === currentUserId && !msg.isDeleted) setContextMsg(msg);
    }, 480);
  };
  const cancelLongPress = () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); };

  const openEdit = (msg: Message) => {
    setContextMsg(null);
    setEditingMsgId(msg._id);
    setEditText(msg.content);
  };

  const submitEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    const res = await fetch(`/api/messages/message/${msgId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
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

      {/* Conversation List */}
      <div className="flex h-[calc(100vh-112px)]">
        <div className="w-full flex flex-col bg-[#e8ecf0] dark:bg-gray-950">
          <div className="px-4 pt-4 pb-3 border-b border-black/8 dark:border-white/10 glass-strong dark:bg-gray-900/95">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">Messages</h2>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={() => setShowNewConv(!showNewConv)}
                className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-[0_2px_10px_rgba(37,99,235,0.4)]">
                <motion.div animate={{ rotate: showNewConv ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <MessageCircle size={16} />
                </motion.div>
              </motion.button>
            </div>
            <AnimatePresence>
              {showNewConv && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search people..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-black/8 dark:border-white/10 bg-[#eef0f4] dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white dark:focus:bg-gray-700 mb-2 transition-all"
                    style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }} />
                  <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                    {filteredUsers.slice(0, 10).map((u) => (
                      <button key={u._id} onClick={() => startNewConversation(u)}
                        className="flex items-center gap-3 w-full p-2.5 rounded-[8px] hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
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
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-transparent border-b border-black/8 dark:border-white/10">
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
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={() => openConversation({ _id: `clan-${clanInfo.id}`, participants: [], otherUser: { _id: clanInfo.id, name: `${clanInfo.name} — World Chat`, username: "world-chat", profileImage: clanInfo.logo } })}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-b border-black/8 dark:border-white/10 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">
                    <div className="relative flex-shrink-0">
                      {clanInfo.logo ? (
                        <img src={clanInfo.logo} alt={clanInfo.name} className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Users size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] text-gray-900 dark:text-white truncate">{clanInfo.name}</div>
                      <div className="text-[12px] text-blue-500 dark:text-blue-400 truncate mt-0.5 font-medium">World Chat</div>
                    </div>
                  </motion.button>
                )}
                {conversations.length === 0 && !clanInfo ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4">
                      <Users className="text-gray-300 dark:text-gray-700" size={28} />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No conversations yet</p>
                    <p className="text-xs mt-1 text-gray-400">Tap the icon above to start one</p>
                  </div>
                ) : conversations.map((conv, idx) => (
                  <motion.button
                    key={conv._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-b border-black/8 dark:border-white/10 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">
                    <Avatar src={conv.otherUser?.profileImage} name={conv.otherUser?.name || "?"} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] text-gray-900 dark:text-white truncate">{conv.otherUser?.name}</div>
                      <div className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{conv.lastMessage || "Start a conversation"}</div>
                    </div>
                  </motion.button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Chat Overlay — rendered via portal so fixed positioning is viewport-relative */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedConv && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-0 z-[200] flex flex-col"
              style={{ backgroundColor: chatBg.bgColor }}
            >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 bg-black/25 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/10"
              style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={closeChat}
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0">
                <ArrowLeft size={20} />
              </motion.button>

              <div className="relative flex-shrink-0">
                {isClanChat && clanInfo?.logo ? (
                  <img src={clanInfo.logo} alt={clanInfo.name} className="w-10 h-10 rounded-[6px] object-cover" />
                ) : isClanChat ? (
                  <div className="w-10 h-10 rounded-[6px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
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

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/dashboard/messages/customize")}
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
                title="Chat customization">
                <Palette size={18} />
              </motion.button>
            </div>

            {/* Messages area */}
            <div className="relative flex-1 overflow-hidden">
              <div ref={chatScrollRef} onScroll={handleChatScroll}
                className="h-full overflow-y-auto scrollbar-hide px-4 py-4 space-y-2"
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
                        <div className="w-16 h-16 rounded-[8px] bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_2px_12px_0_rgba(0,0,0,0.2)]">
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
                            initial={isMe
                              ? { opacity: 0, x: 16, scale: 0.93 }
                              : { opacity: 0, x: -16, scale: 0.93 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: [0.34, 1.2, 0.64, 1] }}
                            className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                            onMouseDown={() => !isClanChat && startLongPress(msg)}
                            onMouseUp={cancelLongPress}
                            onMouseLeave={cancelLongPress}
                            onTouchStart={() => !isClanChat && startLongPress(msg)}
                            onTouchEnd={cancelLongPress}
                            onTouchMove={cancelLongPress}
                          >
                            {!isMe && <Avatar src={msg.senderImage} name={msg.senderName} size={28} />}
                            <div className={`max-w-[76%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                              {isClanChat && !isMe && (
                                <span className="text-[10px] text-white/50 font-medium px-1 mb-0.5 truncate max-w-full">{msg.senderName}</span>
                              )}
                              {msg.isDeleted ? (
                                <div className={`px-3.5 py-2 text-[13px] italic opacity-60 rounded-2xl ${
                                  isMe ? "bg-blue-600/60 text-white" : "bg-white/15 backdrop-blur-md text-white"
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
                                        autoFocus value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") submitEdit(msg._id); if (e.key === "Escape") setEditingMsgId(null); }}
                                        className="px-3.5 py-2 text-[13px] rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 min-w-[160px]"
                                      />
                                      <button onClick={() => submitEdit(msg._id)}
                                        className="px-3 py-2 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors">Save</button>
                                      <button onClick={() => setEditingMsgId(null)}
                                        className="p-2 text-white/50 hover:text-white transition-colors"><X size={14} /></button>
                                    </div>
                                  ) : (
                                    msg.content && (
                                      <div className={`px-3.5 py-2 text-[13px] leading-[1.45] ${msg.mediaUrl ? "mt-1" : ""} rounded-2xl ${
                                        isMe
                                          ? "bg-blue-600 text-white shadow-[0_1px_3px_rgba(37,99,235,0.25)]"
                                          : "bg-white/95 backdrop-blur-sm text-gray-900 border border-white/30"
                                      }`}>
                                        <Linkify text={msg.content} linkClass={isMe ? "text-blue-200 hover:underline break-all" : "text-blue-600 hover:underline break-all"} />
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

              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, y: 12, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-gray-900/90 backdrop-blur-sm border border-white/15 text-white text-xs font-medium shadow-[0_2px_12px_0_rgba(0,0,0,0.3)] z-10 hover:bg-gray-800/90 transition-colors"
                  >
                    <ChevronDown size={13} />
                    {newMsgCount > 0 ? `${newMsgCount} new message${newMsgCount > 1 ? "s" : ""}` : "Scroll to bottom"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Upload error */}
            <AnimatePresence>
              {uploadError && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 px-4 py-2 bg-red-900/80 backdrop-blur-sm border-t border-red-500/30 flex items-center gap-2 overflow-hidden">
                  <AlertCircle size={14} className="text-red-300 flex-shrink-0" />
                  <span className="text-xs text-red-300 flex-1">{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-200"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pending media preview */}
            <AnimatePresence>
              {(pendingMedia || audioBlob) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 px-4 py-2.5 bg-black/30 backdrop-blur-sm border-t border-white/10 flex items-center gap-3 overflow-hidden">
                  {pendingMedia?.type === "image" && <img src={pendingMedia.data} alt="" className="w-12 h-12 rounded-[6px] object-cover shadow-sm" />}
                  {pendingMedia?.type === "video" && (
                    <div className="w-12 h-12 rounded-[6px] bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Film size={18} className="text-purple-300" />
                    </div>
                  )}
                  {pendingMedia?.type === "file" && (
                    <div className="w-12 h-12 rounded-[6px] bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FileText size={18} className="text-green-300" />
                    </div>
                  )}
                  {audioBlob && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[6px] bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <Mic size={14} className="text-blue-300" />
                      </div>
                      <span className="text-xs text-white/70">Voice note ready to send</span>
                    </div>
                  )}
                  {pendingMedia?.uploading && <Loader2 size={14} className="text-white/50 animate-spin flex-shrink-0" />}
                  {pendingMedia && <span className="text-sm text-white/70 truncate flex-1">{pendingMedia.name}</span>}
                  <button onClick={() => { setPendingMedia(null); setAudioBlob(null); }}
                    className="text-white/40 hover:text-red-400 transition-colors p-1">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="flex-shrink-0 px-3 py-3 bg-black/25 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/10"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={cancelRecording}
                    className="w-9 h-9 rounded-[8px] bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0">
                    <X size={18} />
                  </motion.button>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-red-500/20 border border-red-400/30">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-red-400 rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium text-red-300">Recording</span>
                    <span className="text-sm text-red-400 ml-auto">{formatRecording(recordingSeconds)}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={stopRecording}
                    className="w-9 h-9 bg-red-500 text-white rounded-[8px] flex items-center justify-center flex-shrink-0">
                    <StopCircle size={18} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0" ref={mediaMenuRef}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                      onClick={() => setShowMediaMenu(!showMediaMenu)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showMediaMenu ? "bg-blue-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}>
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
                          className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-xl rounded-[8px] shadow-[0_4px_20px_0_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden z-10 w-44"
                        >
                          {[
                            { label: "Photo", type: "image" as const, icon: ImageIcon, color: "text-blue-400", bg: "bg-blue-500/20" },
                            { label: "Video", type: "video" as const, icon: Film, color: "text-purple-400", bg: "bg-purple-500/20" },
                            { label: "File", type: "file" as const, icon: Paperclip, color: "text-green-400", bg: "bg-green-500/20" },
                          ].map(({ label, type, icon: Icon, color, bg }) => (
                            <button key={type} onClick={() => handleMediaMenuSelect(type)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors">
                              <div className={`w-8 h-8 rounded-[6px] ${bg} flex items-center justify-center ${color}`}>
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
                    className="flex-1 px-4 py-2.5 text-[14px] rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/15 transition-all"
                  />

                  <AnimatePresence mode="wait">
                    {messageText.trim() || pendingMedia || audioBlob ? (
                      <motion.button key="send"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onClick={sendMessage} disabled={sendingMsg || !!pendingMedia?.uploading}
                        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors shadow-[0_2px_10px_rgba(37,99,235,0.4)] disabled:opacity-50 flex-shrink-0">
                        {sendingMsg ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      </motion.button>
                    ) : (
                      <motion.button key="mic"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onMouseDown={startRecording} onTouchStart={startRecording}
                        className="w-10 h-10 bg-white/10 text-white/80 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
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
        </AnimatePresence>,
        document.body
      )}

      {/* Long-press context menu — also portaled so fixed positioning works correctly */}
      {typeof window !== "undefined" && createPortal(
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
              className="fixed bottom-0 left-0 right-0 z-[301] bg-gray-900 rounded-t-2xl border-t border-white/10 p-4 pb-8"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold px-1 mb-3">Message</p>
              {contextMsg.content && (
                <button onClick={() => openEdit(contextMsg)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-[8px] hover:bg-white/8 transition-colors text-left mb-1">
                  <div className="w-9 h-9 rounded-[8px] bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Edit</div>
                    <div className="text-[11px] text-white/40">Change message text</div>
                  </div>
                </button>
              )}
              <button onClick={() => deleteMessage(contextMsg._id)}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-[8px] hover:bg-red-500/10 transition-colors text-left">
                <div className="w-9 h-9 rounded-[8px] bg-red-500/20 flex items-center justify-center">
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
