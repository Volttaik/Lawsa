"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, ArrowLeft, MessageCircle, Users,
  Image as ImageIcon, Film, Paperclip, X, Play, FileText,
  Plus, Mic, StopCircle, Check, CheckCheck, Palette,
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
  createdAt: string;
}

interface ConnectedUser {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
}

const CHAT_BACKGROUNDS = [
  { id: "default", label: "Default", value: "" },
  { id: "blue", label: "Ocean", value: "linear-gradient(135deg,#e0f2fe 0%,#bfdbfe 100%)" },
  { id: "purple", label: "Dusk", value: "linear-gradient(135deg,#ede9fe 0%,#ddd6fe 100%)" },
  { id: "rose", label: "Rose", value: "linear-gradient(135deg,#ffe4e6 0%,#fecdd3 100%)" },
  { id: "green", label: "Forest", value: "linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)" },
  { id: "amber", label: "Sand", value: "linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)" },
  { id: "dark", label: "Night", value: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)" },
  { id: "pattern1", label: "Dots", value: "radial-gradient(circle,#dbeafe 1px,transparent 1px)", bgSize: "20px 20px", bgColor: "#f8fafc" },
  { id: "pattern2", label: "Lines", value: "repeating-linear-gradient(45deg,#f1f5f9 0,#f1f5f9 1px,transparent 0,transparent 50%)", bgSize: "10px 10px", bgColor: "#ffffff" },
];

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
  if (isOnline) return <span className="text-[10px] text-green-500 font-medium">Online</span>;
  if (!lastOnline) return <span className="text-[10px] text-gray-400">Offline</span>;
  const diff = Date.now() - new Date(lastOnline).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const label = mins < 1 ? "Just now" : mins < 60 ? `${mins}m ago` : hours < 24 ? `${hours}h ago` : `${days}d ago`;
  return <span className="text-[10px] text-gray-400">Last seen {label}</span>;
}

function ReadReceipt({ isMe, read }: { isMe: boolean; read?: boolean }) {
  if (!isMe) return null;
  return (
    <span className={`flex-shrink-0 ${read ? "text-blue-500" : "text-gray-400"}`}>
      {read ? <CheckCheck size={12} /> : <Check size={12} />}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="bg-white dark:bg-gray-800 rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-sm flex items-center gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function FadeImg({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`transition-all duration-400 ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"} ${className || ""}`}
      style={style}
      onLoad={() => setLoaded(true)}
    />
  );
}

function MediaPreview({ url, type, isMe }: { url: string; type: string; isMe: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const bubbleBase = isMe
    ? "bg-blue-600 text-white rounded-[18px] rounded-br-[4px]"
    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-[18px] rounded-bl-[4px] shadow-sm";

  if (type === "image") {
    return (
      <div className="relative mt-1 max-w-[220px] overflow-hidden rounded-2xl">
        {!loaded && <div className="skeleton w-[220px] h-32 rounded-2xl" />}
        <FadeImg
          src={url}
          alt="Image"
          className={`max-w-[220px] max-h-56 object-cover rounded-2xl ${loaded ? "block" : "hidden"}`}
        />
      </div>
    );
  }
  if (type === "video") {
    return (
      <div className="relative mt-1 max-w-[260px]">
        {!loaded && (
          <div className="skeleton w-[260px] h-40 rounded-2xl flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
              <Play size={18} className="text-white ml-0.5" />
            </div>
          </div>
        )}
        <video src={url} controls preload="metadata" onLoadedData={() => setLoaded(true)}
          className={`rounded-2xl max-w-[260px] max-h-56 ${loaded ? "block" : "hidden"}`} />
      </div>
    );
  }
  if (type === "audio") {
    return (
      <div className={`mt-1 px-3 py-2.5 min-w-[200px] max-w-[260px] flex items-center gap-3 ${bubbleBase}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/40"}`}>
          <Mic size={14} className={isMe ? "text-white" : "text-blue-600"} />
        </div>
        <div className="flex-1 min-w-0">
          <audio src={url} controls className="w-full h-8 rounded-lg" />
        </div>
      </div>
    );
  }
  if (type === "file") {
    const filename = url.split("/").pop() || "File";
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className={`mt-1 flex items-center gap-2 px-4 py-3 text-sm hover:opacity-90 transition-opacity max-w-[220px] ${bubbleBase}`}>
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
  const [pendingMedia, setPendingMedia] = useState<{ data: string; type: string; name: string } | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserLastOnline, setOtherUserLastOnline] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatBg, setChatBg] = useState<typeof CHAT_BACKGROUNDS[0]>(CHAT_BACKGROUNDS[0]);
  const [showBgPicker, setShowBgPicker] = useState(false);

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
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  selectedConvRef.current = selectedConv;

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setCurrentUserId(d.user?._id || d.user?.id || null));
    loadConversations();
    loadUsers();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
    if (selectedConv) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedConv]);

  const pollConversation = useCallback(async () => {
    const conv = selectedConvRef.current;
    if (!conv || conv._id === "new") return;
    try {
      const res = await fetch(`/api/messages/${conv._id}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      if (typeof data.otherUserOnline === "boolean") setOtherUserOnline(data.otherUserOnline);
      if (data.otherUserLastOnline !== undefined) setOtherUserLastOnline(data.otherUserLastOnline);
      if (typeof data.otherUserTyping === "boolean") setOtherUserTyping(data.otherUserTyping);
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
    if (val) {
      sendTypingSignal();
      typingTimeoutRef.current = setTimeout(() => {}, 3000);
    }
  };

  const loadConversations = async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
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
    if (conv._id !== "new") {
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
    stopRecording();
  };

  const startNewConversation = async (user: ConnectedUser) => {
    setShowNewConv(false);
    setUserSearch("");
    const existing = conversations.find((c) => c.participants.includes(user._id));
    if (existing) { openConversation(existing); return; }
    const fakeConv: Conversation = {
      _id: "new",
      participants: [currentUserId || "", user._id],
      otherUser: user,
    };
    openConversation(fakeConv);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingMedia({ data: reader.result as string, type, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      alert("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  const sendMessage = async () => {
    const hasText = messageText.trim();
    const hasMedia = pendingMedia || audioBlob;
    if (!hasText && !hasMedia) return;
    if (!selectedConv?.otherUser) return;
    setSendingMsg(true);

    let mediaDataToSend = pendingMedia?.data;
    let mediaTypeToSend = pendingMedia?.type;

    if (audioBlob && !pendingMedia) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      mediaDataToSend = dataUrl;
      mediaTypeToSend = "audio";
    }

    const body: Record<string, string> = {
      recipientId: selectedConv.otherUser._id,
      content: messageText,
    };
    if (mediaDataToSend) {
      body.mediaData = mediaDataToSend;
      body.mediaType = mediaTypeToSend || "file";
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setMessageText("");
      setPendingMedia(null);
      setAudioBlob(null);
      loadConversations();
    }
    setSendingMsg(false);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const formatRecording = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const skeletonRows = [false, true, false, true, true, false];

  const chatBgStyle: React.CSSProperties = chatBg.id === "default"
    ? {}
    : {
        background: chatBg.value,
        backgroundSize: (chatBg as { bgSize?: string }).bgSize || "auto",
        backgroundColor: (chatBg as { bgColor?: string }).bgColor || undefined,
      };

  return (
    <>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "file")} />

      {/* Conversation List */}
      <div className="flex h-[calc(100vh-112px)]">
        <div className="w-full flex flex-col bg-white dark:bg-gray-900">
          <div className="px-4 pt-4 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white text-xl">Messages</h2>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewConv(!showNewConv)}
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-btn"
              >
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
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <Users className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={36} />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1 text-gray-400">Tap the chat icon above to start one</p>
              </div>
            ) : conversations.map((conv) => (
              <motion.button key={conv._id} whileTap={{ scale: 0.98 }}
                onClick={() => openConversation(conv)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left border-b border-black/5 dark:border-white/5"
              >
                <Avatar src={conv.otherUser?.profileImage} name={conv.otherUser?.name || "?"} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{conv.otherUser?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage || "Start a conversation"}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen Chat Overlay — covers nav bar completely */}
      <AnimatePresence>
        {selectedConv && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10 shadow-soft"
              style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={closeChat}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                <ArrowLeft size={20} />
              </motion.button>

              <div className="relative flex-shrink-0">
                <Avatar src={selectedConv.otherUser?.profileImage} name={selectedConv.otherUser?.name || "?"} size={40} />
                {otherUserOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">{selectedConv.otherUser?.name}</div>
                {otherUserTyping ? (
                  <motion.span key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] text-blue-500 font-medium italic">typing...</motion.span>
                ) : (
                  <OnlineStatus isOnline={otherUserOnline} lastOnline={otherUserLastOnline} />
                )}
              </div>

              {/* Background picker button */}
              <div className="relative flex-shrink-0" ref={bgPickerRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBgPicker(!showBgPicker)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showBgPicker ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  title="Chat background">
                  <Palette size={18} />
                </motion.button>
                <AnimatePresence>
                  {showBgPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 p-3 z-10 w-56"
                    >
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">Chat Background</p>
                      <div className="grid grid-cols-3 gap-2">
                        {CHAT_BACKGROUNDS.map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => { setChatBg(bg); setShowBgPicker(false); }}
                            className={`relative h-12 rounded-xl border-2 transition-all overflow-hidden ${chatBg.id === bg.id ? "border-blue-500 scale-105" : "border-transparent hover:border-gray-300"}`}
                            style={{
                              background: bg.id === "default" ? "#f8fafc" : bg.value,
                              backgroundSize: (bg as { bgSize?: string }).bgSize || "auto",
                              backgroundColor: (bg as { bgColor?: string }).bgColor || undefined,
                            }}
                            title={bg.label}
                          >
                            {bg.id === "default" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] text-gray-500 font-medium">None</span>
                              </div>
                            )}
                            {chatBg.id === bg.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Check size={9} className="text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-center text-gray-400 mt-2">{chatBg.label}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3"
              style={chatBg.id === "default"
                ? { background: "var(--chat-bg, #f9fafb)" }
                : chatBgStyle}
            >
              {loadingMessages ? (
                <div className="space-y-4">
                  {skeletonRows.map((isMe, i) => <MessageSkeleton key={i} isMe={isMe} />)}
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <MessageCircle size={28} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Say hello to {selectedConv.otherUser?.name?.split(" ")[0]}!
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Start the conversation below</p>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;
                      const hasOnlyMedia = !msg.content && msg.mediaUrl;
                      return (
                        <motion.div key={msg._id}
                          initial={{ opacity: 0, y: 14, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.22 }}
                          className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          {!isMe && <Avatar src={msg.senderImage} name={msg.senderName} size={30} />}
                          <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {msg.mediaUrl && msg.mediaType !== "audio" && (
                              <MediaPreview url={msg.mediaUrl} type={msg.mediaType || "file"} isMe={isMe} />
                            )}
                            {msg.mediaUrl && msg.mediaType === "audio" && (
                              <MediaPreview url={msg.mediaUrl} type="audio" isMe={isMe} />
                            )}
                            {msg.content && (
                              <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                                msg.mediaUrl && msg.mediaType !== "audio" ? "mt-1" : ""
                              } ${
                                isMe
                                  ? "bg-blue-600 text-white rounded-[18px] rounded-br-[4px]"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-[18px] rounded-bl-[4px] shadow-sm"
                              }`}>
                                {msg.content}
                              </div>
                            )}
                            {hasOnlyMedia && !msg.content && msg.mediaType !== "audio" && msg.mediaType !== "image" && msg.mediaType !== "video" && (
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                {msg.mediaType === "file" ? "📎 File" : "Media"}
                              </span>
                            )}
                            {isMe && (
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
                  className="flex-shrink-0 px-4 py-2.5 bg-white dark:bg-gray-900 border-t border-black/10 dark:border-white/10 flex items-center gap-3 overflow-hidden">
                  {pendingMedia?.type === "image" && <img src={pendingMedia.data} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                  {pendingMedia?.type === "video" && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Film size={18} className="text-purple-500" />
                    </div>
                  )}
                  {pendingMedia?.type === "file" && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-green-500" />
                    </div>
                  )}
                  {audioBlob && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Mic size={14} className="text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Voice note ready to send</span>
                    </div>
                  )}
                  {pendingMedia && <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{pendingMedia.name}</span>}
                  <button onClick={() => { setPendingMedia(null); setAudioBlob(null); }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar — always at bottom, never moves */}
            <div
              className="flex-shrink-0 px-3 py-3 bg-white dark:bg-gray-900 border-t border-black/10 dark:border-white/10"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={cancelRecording}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <X size={18} />
                  </motion.button>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Recording</span>
                    <span className="text-sm text-red-500 ml-auto">{formatRecording(recordingSeconds)}</span>
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
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        showMediaMenu ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                      }`}>
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
                          className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-10 w-44"
                        >
                          {[
                            { label: "Photo", type: "image" as const, icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/40" },
                            { label: "Video", type: "video" as const, icon: Film, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/40" },
                            { label: "File", type: "file" as const, icon: Paperclip, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/40" },
                          ].map(({ label, type, icon: Icon, color, bg }) => (
                            <button key={type} onClick={() => handleMediaMenuSelect(type)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
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

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Message..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />

                  <AnimatePresence mode="wait">
                    {messageText.trim() || pendingMedia || audioBlob ? (
                      <motion.button key="send"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onClick={sendMessage}
                        disabled={sendingMsg}
                        className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-btn disabled:opacity-50 flex-shrink-0"
                      >
                        {sendingMsg ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      </motion.button>
                    ) : (
                      <motion.button key="mic"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                        onMouseDown={startRecording}
                        onTouchStart={startRecording}
                        className="w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors flex-shrink-0"
                        title="Hold to record"
                      >
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
    </>
  );
}
