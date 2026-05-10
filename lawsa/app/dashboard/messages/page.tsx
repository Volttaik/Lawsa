"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PaperPlaneTilt, SpinnerGap, ArrowLeft, MagnifyingGlass, X, Checks, Check, DotsThreeVertical, SealCheck, ArrowBendUpLeft, Trash, Plus, Microphone, Stop, Play, Pause, Paperclip, Camera, Smiley } from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import Linkify from "@/components/Linkify";
import { uploadFile } from "@/lib/uploadClient";

interface Conversation { _id: string; participants: string[]; lastMessage?: string; lastMessageTime?: string; otherUser?: { _id: string; name: string; username: string; profileImage?: string; isVerified?: boolean; isSpecial?: boolean; }; }
interface Message { _id: string; senderId: string; senderName: string; senderImage?: string; content: string; mediaUrl?: string; mediaType?: string; read?: boolean; edited?: boolean; isDeleted?: boolean; replyToId?: string; replyToContent?: string; replyToSender?: string; reactions?: Record<string,string[]>; createdAt: string; _pending?: boolean; _failed?: boolean; }
interface UserResult { _id: string; id?: string; name: string; username: string; profileImage?: string; isVerified?: boolean; isSpecial?: boolean; followers?: string[]; following?: string[]; }

const WA_BG: React.CSSProperties = {
  backgroundColor: "#000000",
  backgroundImage: "linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72)), url('/chat-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "local",
};

const noOutline: React.CSSProperties = { outline: "none", boxShadow: "none" };

function Avatar({ src, name, size = 40, online }: { src?: string; name: string; size?: number; online?: boolean }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="rounded-full object-cover w-full h-full" loading="lazy" />
        : <div className={`rounded-full w-full h-full flex items-center justify-center text-white font-bold ${color}`} style={{ fontSize: Math.max(10, size * 0.38) }}>{initials}</div>
      }
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full border-2 border-[#111111]" />}
    </div>
  );
}

function formatTime(d: string) { const dt = new Date(d); return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function fmtSecs(s: number) { const mins = Math.floor(s / 60); const secs = Math.floor(s % 60); return `${mins}:${String(secs).padStart(2, "0")}`; }
function formatDate(d: string) {
  const dt = new Date(d); const now = new Date(); const diff = now.getTime() - dt.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return dt.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function VoiceNoteBubble({ src, isMine }: { src: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const toggle = () => { if (!audioRef.current) return; if (playing) { audioRef.current.pause(); setPlaying(false); } else { audioRef.current.play(); setPlaying(true); } };
  return (
    <div className="flex items-center gap-3 w-52">
      <audio ref={audioRef} src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => { const a = audioRef.current; if (!a) return; setCurrent(a.currentTime); setProgress((a.currentTime / a.duration) * 100); }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
      />
      <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 hover:bg-white/30 transition-colors">
        {playing ? <Pause className="w-4 h-4 text-white" weight="fill" /> : <Play className="w-4 h-4 text-white" weight="fill" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative h-1.5 rounded-full bg-white/20 overflow-hidden cursor-pointer"
          onClick={e => { if (!audioRef.current || !duration) return; const rect = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration; }}>
          <div className="absolute left-0 top-0 h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[11px] text-white/50">{playing ? fmtSecs(Math.floor(current)) : fmtSecs(Math.floor(duration))}</span>
      </div>
    </div>
  );
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startWithId = searchParams.get("startWith");

  const [me, setMe] = useState<any>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<UserResult | null>(null);
  const [streamTick, setStreamTick] = useState(0);
  const [sendError, setSendError] = useState("");
  const [videoUploadUrl, setVideoUploadUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<any>(null);
  const searchDebounce = useRef<any>(null);
  const streamRef = useRef<EventSource | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  function groupByDate(msgs: Message[]) {
    const groups: { date: string; messages: Message[] }[] = [];
    for (const msg of msgs) {
      const d = formatDate(msg.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.date === d) last.messages.push(msg);
      else groups.push({ date: d, messages: [msg] });
    }
    return groups;
  }

  useEffect(() => {
    const pollConvs = async () => {
      try { const res = await fetch("/api/messages", { credentials: "include" }); const data = await res.json(); if (data.conversations) setConvs(data.conversations); } catch {}
    };
    const id = setInterval(pollConvs, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const init = async () => {
      const [meRes, convsRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
        fetch("/api/messages", { credentials: "include" }).then(r => r.json()),
      ]);
      if (meRes.user) setMe(meRes.user);
      const convsList = convsRes.conversations || [];
      setConvs(convsList);
      setLoading(false);
      if (startWithId && meRes.user) {
        const existingConv = (convsRes.conversations || []).find((c: Conversation) => c.participants.includes(startWithId));
        if (existingConv) { setActive(existingConv); }
        else {
          const userRes = await fetch(`/api/users/${startWithId}`).then(r => r.json());
          if (userRes.user) {
            const canMessage = (meRes.user.following || []).includes(startWithId) && (userRes.user.following || []).includes(meRes.user._id || meRes.user.id);
            if (canMessage) setPendingRecipient(userRes.user);
          }
        }
        router.replace("/dashboard/messages");
      }
    };
    init();
  }, [startWithId, router]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    if (!userSearch.trim()) { setSearchResults([]); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}&limit=10`).then(r => r.json());
      const mutuals = (res.users || []).filter((u: UserResult) => {
        const myId = me?.id || me?._id;
        return (me?.following || []).includes(u._id || u.id) && (u.followers || []).includes(myId) && (u._id || u.id) !== myId;
      });
      setSearchResults(mutuals); setSearchLoading(false);
    }, 300);
  }, [userSearch, me]);

  const loadMessages = useCallback(async (conv: Conversation, silent = false) => {
    if (!silent) setMsgsLoading(true);
    const res = await fetch(`/api/messages/${conv._id}`, { credentials: "include" });
    const data = await res.json();
    setMessages(data.messages || []); setOtherOnline(data.otherUserOnline || false);
    if (!silent) setMsgsLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => { if (!active) return; loadMessages(active); }, [active, loadMessages]);

  useEffect(() => {
    if (!active) return;
    const onFocus = () => loadMessages(active, true);
    const onVisibility = () => { if (document.visibilityState === "visible") loadMessages(active, true); };
    window.addEventListener("focus", onFocus); document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVisibility); };
  }, [active, loadMessages]);

  useEffect(() => {
    if (streamRef.current) { streamRef.current.close(); streamRef.current = null; }
    if (!active) return;
    const stream = new EventSource(`/api/messages/${active._id}/stream`);
    streamRef.current = stream;
    stream.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "snapshot") {
        setMessages(prev => {
          const serverMsgs: Message[] = payload.messages || [];
          const serverIds = new Set(serverMsgs.map((m: Message) => m._id));
          const stillPending = prev.filter(m => m._pending && !serverIds.has(m._id));
          return [...serverMsgs, ...stillPending];
        });
        setOtherOnline(!!payload.otherUserOnline); setOtherTyping(!!payload.otherUserTyping); return;
      }
      if (payload.type === "message") { setMessages((prev) => (prev.some((m) => m._id === payload.message._id) ? prev : [...prev, payload.message])); return; }
      if (payload.type === "update") {
        setMessages(prev => {
          const serverMsgs: Message[] = payload.messages || [];
          const serverIds = new Set(serverMsgs.map((m: Message) => m._id));
          const stillPending = prev.filter(m => m._pending && !serverIds.has(m._id));
          return [...serverMsgs, ...stillPending];
        });
        setOtherOnline(!!payload.otherUserOnline); setOtherTyping(!!payload.otherUserTyping);
      }
    };
    stream.onerror = () => { stream.close(); if (streamRef.current === stream) streamRef.current = null; };
    return () => { stream.close(); if (streamRef.current === stream) streamRef.current = null; };
  }, [active, streamTick]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) setShowChatMenu(false);
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendTyping = useCallback(async () => {
    if (!active) return;
    await fetch(`/api/messages/${active._id}/typing`, { method: "POST", credentials: "include" });
  }, [active]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    if (file.type.startsWith("video/")) {
      setMediaPreview(URL.createObjectURL(file));
      setVideoUploading(true);
      setVideoUploadProgress(0);
      setVideoUploadUrl(null);
      setMediaData("__video__");
      try {
        const url = await uploadFile(file, "messages", p => setVideoUploadProgress(p));
        setVideoUploadUrl(url);
      } catch {
        setSendError("Video upload failed. Try a smaller file.");
        setMediaPreview(null);
        setMediaData(null);
        setVideoUploadUrl(null);
      }
      setVideoUploading(false);
    } else {
      const reader = new FileReader();
      reader.onload = ev => { setMediaData(ev.target?.result as string); setMediaPreview(URL.createObjectURL(file)); };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob); setAudioPreviewUrl(url);
        const reader = new FileReader(); reader.onload = ev => setAudioData(ev.target?.result as string); reader.readAsDataURL(blob);
      };
      recorder.start(); mediaRecorderRef.current = recorder;
      setIsRecording(true); setRecordingSecs(0);
      recordingTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);
    } catch { alert("Microphone permission denied"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); clearInterval(recordingTimerRef.current); setIsRecording(false); };
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.ondataavailable = null; mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false); setAudioData(null); setAudioPreviewUrl(null); setRecordingSecs(0); audioChunksRef.current = [];
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = text.trim() || mediaData || audioData; if (!hasContent) return;
    if (mediaData === "__video__" && !videoUploadUrl) return;
    const myId = me?.id || me?._id || "";
    const recipientId = pendingRecipient?._id || active?.participants.find(p => p !== myId);
    if (!recipientId) return;
    setSendError("");

    // ── OPTIMISTIC: show message instantly ────────────────────────────────────
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const savedText = text.trim();
    const savedMediaData = mediaData;
    const savedAudioData = audioData;
    const savedReplyTo = replyTo;
    const savedVideoUploadUrl = videoUploadUrl;

    const tempMsg: Message = {
      _id: tempId,
      senderId: myId,
      senderName: me?.name || "",
      senderImage: me?.profileImage,
      content: savedText,
      mediaUrl: savedAudioData || savedVideoUploadUrl || (savedMediaData !== "__video__" ? savedMediaData : "") || "",
      mediaType: savedAudioData ? "audio" : savedVideoUploadUrl ? "video" : savedMediaData?.startsWith("data:image") ? "image" : "",
      read: false,
      edited: false,
      isDeleted: false,
      replyToId: savedReplyTo?._id || undefined,
      replyToContent: savedReplyTo?.content || "",
      replyToSender: savedReplyTo?.senderName || "",
      reactions: {},
      createdAt: new Date().toISOString(),
      _pending: true,
    };

    setMessages(prev => [...prev, tempMsg]);

    // Save to localStorage so message survives network issues
    const convId = active?._id;
    if (convId) {
      try {
        const key = `sosa_pending_${convId}`;
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        stored.push(tempMsg);
        localStorage.setItem(key, JSON.stringify(stored.slice(-50)));
      } catch {}
    }

    // Clear inputs immediately
    setText(""); setMediaData(null); setMediaPreview(null);
    setVideoUploadUrl(null); setVideoUploading(false); setVideoUploadProgress(0);
    setAudioData(null); setAudioPreviewUrl(null); setRecordingSecs(0); setReplyTo(null);

    // ── SEND TO SERVER in background ──────────────────────────────────────────
    const body: any = { recipientId, content: savedText };
    if (savedAudioData) { body.mediaData = savedAudioData; body.mediaType = "audio"; }
    else if (savedVideoUploadUrl) { body.mediaUrl = savedVideoUploadUrl; body.mediaType = "video"; }
    else if (savedMediaData && savedMediaData !== "__video__") { body.mediaData = savedMediaData; body.mediaType = savedMediaData.startsWith("data:image") ? "image" : "file"; }
    if (savedReplyTo) { body.replyToId = savedReplyTo._id; body.replyToContent = savedReplyTo.content; body.replyToSender = savedReplyTo.senderName; }

    try {
      const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const data = await res.json();
      if (data.message) {
        const realMsg = { ...data.message, conversationId: data.conversationId };
        // Replace temp message with confirmed one
        setMessages(prev => prev.map(m => m._id === tempId ? realMsg : m));
        // Remove from pending localStorage
        if (convId) {
          try {
            const key = `sosa_pending_${convId}`;
            const stored = JSON.parse(localStorage.getItem(key) || "[]");
            localStorage.setItem(key, JSON.stringify(stored.filter((m: Message) => m._id !== tempId)));
          } catch {}
        }
        if (pendingRecipient) {
          const convsRes = await fetch("/api/messages", { credentials: "include" }).then(r => r.json());
          setConvs(convsRes.conversations || []);
          const newConv = (convsRes.conversations || []).find((c: Conversation) => c._id === data.conversationId);
          if (newConv) setActive(newConv);
          setPendingRecipient(null);
        }
      } else if (data.error) {
        setSendError(data.error);
        setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _pending: false, _failed: true } : m));
      }
    } catch {
      setSendError("Failed to send. Check your connection.");
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _pending: false, _failed: true } : m));
    }
  };

  const deleteMsg = async (id: string) => {
    await fetch(`/api/messages/message/${id}`, { method: "DELETE", credentials: "include" });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true, content: "" } : m));
  };

  const startConversation = (user: UserResult) => {
    const existing = convs.find(c => c.participants.includes(user._id || user.id || ""));
    if (existing) { setActive(existing); setShowNewConvo(false); setUserSearch(""); }
    else { setPendingRecipient(user); setShowNewConvo(false); setUserSearch(""); }
  };

  const myId = me?.id || me?._id || "";
  const filtered = convs.filter(c => !search || c.otherUser?.name.toLowerCase().includes(search.toLowerCase()) || c.otherUser?.username.toLowerCase().includes(search.toLowerCase()) || c.lastMessage?.toLowerCase().includes(search.toLowerCase()));

  const ConvList = (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: "#080808" }}>
      <div className="px-4 pt-5 pb-3 flex-shrink-0" style={{ backgroundColor: "#111111" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Chats</h1>
          <button onClick={() => setShowNewConvo(true)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <Plus className="w-5 h-5" weight="bold" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "#1a1a1a" }}>
          <MagnifyingGlass className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search or start new chat"
            className="flex-1 bg-transparent text-sm placeholder-white/40"
            style={{ color: "#FFFFFF", outline: "none", boxShadow: "none", border: "none" }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading
          ? <div className="flex justify-center pt-8"><SpinnerGap className="w-5 h-5 animate-spin text-white" /></div>
          : filtered.length === 0
          ? (
            <div className="text-center pt-14 px-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#1a1a1a" }}>
                <PaperPlaneTilt className="w-8 h-8" style={{ color: "rgba(255,255,255,0.45)" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#FFFFFF" }}>{search ? "No conversations match" : "No conversations yet"}</p>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>Start chatting with your mutual followers</p>
              <button onClick={() => setShowNewConvo(true)} className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-black transition-colors hover:bg-gray-200">
                Start a conversation
              </button>
            </div>
          ) : filtered.map(conv => {
            const other = conv.otherUser;
            const isActive = active?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => { setActive(conv); setPendingRecipient(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b"
                style={{ backgroundColor: isActive ? "#1a1a1a" : "transparent", borderColor: "#111111" }}>
                <Avatar src={other?.profileImage} name={other?.name || "?"} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-medium text-sm truncate" style={{ color: "#FFFFFF" }}>{other?.name || "Unknown"}</span>
                      {!other?.isSpecial && other?.isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" weight="fill" />}
                      {other?.isSpecial && <DiamondBadge size={14} />}
                      {other?.isSpecial && other?.isVerified && <SealCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" weight="fill" />}
                    </div>
                    {conv.lastMessageTime && <span className="text-[11px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>{formatTime(conv.lastMessageTime)}</span>}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{conv.lastMessage || "Start a conversation"}</p>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );

  const activeOther = pendingRecipient || active?.otherUser;
  const grouped = groupByDate(messages);

  const ChatWindow = (active || pendingRecipient) ? (
    <div className="relative flex flex-col h-screen min-h-0 overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 flex-shrink-0 z-10" style={{ backgroundColor: "#111111" }}>
        <button onClick={() => { setActive(null); setPendingRecipient(null); }} className="md:hidden w-9 h-9 rounded-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.45)" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={activeOther?.profileImage} name={activeOther?.name || "?"} size={40} online={otherOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-[15px] truncate" style={{ color: "#FFFFFF" }}>{activeOther?.name}</p>
            {!activeOther?.isSpecial && activeOther?.isVerified && <SealCheck className="w-4 h-4 text-blue-400" weight="fill" />}
            {activeOther?.isSpecial && <DiamondBadge size={16} />}
            {activeOther?.isSpecial && activeOther?.isVerified && <SealCheck className="w-4 h-4 text-amber-400 flex-shrink-0" weight="fill" />}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            {pendingRecipient ? "New conversation"
              : otherTyping ? <span className="text-white">typing...</span>
              : otherOnline ? <span className="text-white/70">online</span>
              : activeOther?.username ? `@${activeOther.username}` : ""}
          </p>
        </div>
        <div className="relative" ref={chatMenuRef}>
          <button onClick={() => setShowChatMenu(v => !v)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>
            <DotsThreeVertical className="w-5 h-5" />
          </button>
          {showChatMenu && (
            <div className="absolute right-0 top-11 w-52 rounded-xl shadow-2xl border z-50 overflow-hidden" style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }}>
              {activeOther && (
                <button onClick={() => { setShowChatMenu(false); router.push(`/dashboard/profile/${activeOther._id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors" style={{ color: "#FFFFFF" }}>
                  View profile
                </button>
              )}
              <button onClick={() => { setShowChatMenu(false); setActive(null); setPendingRecipient(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors border-t" style={{ color: "rgba(255,255,255,0.55)", borderColor: "#2a2a2a" }}>
                Close conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 pb-36 space-y-1" style={WA_BG}>
        {pendingRecipient ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Avatar src={pendingRecipient.profileImage} name={pendingRecipient.name} size={80} />
            <h3 className="font-bold text-lg mt-4" style={{ color: "#FFFFFF" }}>{pendingRecipient.name}</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>@{pendingRecipient.username}</p>
            <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.45)" }}>Start a new conversation with {pendingRecipient.name}</p>
          </div>
        ) : msgsLoading ? (
          <div className="flex justify-center pt-8"><SpinnerGap className="w-5 h-5 animate-spin text-white" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p style={{ color: "rgba(255,255,255,0.45)" }}>No messages yet. Say hi!</p>
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={gi}>
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#111111", color: "rgba(255,255,255,0.45)" }}>{group.date}</span>
              </div>
              {group.messages.map((msg) => {
                const isMine = msg.senderId === myId;
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"} group mb-1`}>
                    <div className="max-w-[78%] relative">
                      {msg.replyToId && msg.replyToContent && (
                        <div className="text-xs mb-0.5 px-3 py-1.5 rounded-t-lg border-l-4 border-white/60"
                          style={{ backgroundColor: isMine ? "#054740" : "#1A2830" }}>
                          <span className="font-semibold text-white/80">{msg.replyToSender}</span>
                          <p className="truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{msg.replyToContent}</p>
                        </div>
                      )}
                      <div className="relative px-3 py-2 shadow-md" style={{
                        backgroundColor: isMine ? "#000000" : "#111111",
                        borderRadius: isMine ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        color: "#FFFFFF",
                      }}>
                        {msg.isDeleted ? (
                          <em className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>This message was deleted</em>
                        ) : (
                          <>
                            {msg.mediaType === "audio" && msg.mediaUrl ? (
                              <VoiceNoteBubble src={msg.mediaUrl} isMine={isMine} />
                            ) : msg.mediaUrl ? (
                              msg.mediaType === "image" ? <img src={msg.mediaUrl} alt="" className="rounded-lg max-w-full mb-1 max-h-64 object-cover" loading="lazy" /> :
                              msg.mediaType === "video" ? <video src={msg.mediaUrl} controls className="rounded-lg max-w-full mb-1 max-h-64" /> :
                              <a href={msg.mediaUrl} target="_blank" className="underline text-xs text-white/70">View file</a>
                            ) : null}
                            {msg.content && (
                              <p className="leading-relaxed break-words whitespace-pre-wrap text-[15px]">
                                <Linkify text={msg.content} className="whitespace-pre-wrap break-words" linkClass="text-blue-300 underline break-all" />
                              </p>
                            )}
                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                              {msg.edited && <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>edited</span>}
                              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{formatTime(msg.createdAt)}</span>
                              {isMine && (msg.read
                                ? <Checks className="w-3.5 h-3.5 text-white" />
                                : <Check className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />)}
                            </div>
                          </>
                        )}
                        {!msg.isDeleted && (
                          <div className={`absolute ${isMine ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                            <button onClick={() => setReplyTo(msg)} className="p-1.5 rounded-full" style={{ backgroundColor: "#111111" }}>
                              <ArrowBendUpLeft className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />
                            </button>
                            {isMine && <button onClick={() => deleteMsg(msg._id)} className="p-1.5 rounded-full" style={{ backgroundColor: "#111111" }}>
                              <Trash className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />
                            </button>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="px-4 py-2 flex items-center justify-between gap-2 flex-shrink-0" style={{ backgroundColor: "#111111" }}>
          <p className="text-red-400 text-xs flex-1">{sendError}</p>
          <button onClick={() => setSendError("")} style={{ color: "rgba(255,255,255,0.45)" }}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 border-t" style={{ backgroundColor: "#111111", borderColor: "#1a1a1a" }}>
          <div className="flex-1 border-l-4 border-white/50 pl-3" style={{ backgroundColor: "#1a1a1a", padding: "6px 12px", borderRadius: 4 }}>
            <p className="text-xs font-semibold text-white/80">{replyTo.senderName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{replyTo.content || "🎤 Voice note"}</p>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ color: "rgba(255,255,255,0.45)" }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Input bar — no border, no focus ring */}
      <div className="absolute bottom-0 left-0 right-0 z-30" style={{ backgroundColor: "#000000" }}>

        {/* Media preview — image or video, shown above input */}
        {mediaPreview && (
          <div className="relative w-full border-t" style={{ backgroundColor: "#0d0d0d", borderColor: "#1e1e1e" }}>
            <div className="flex items-end gap-3 px-4 py-3">
              <div className="relative flex-shrink-0">
                {mediaData === "__video__" ? (
                  <video src={mediaPreview} className="rounded-2xl shadow-xl object-cover"
                    style={{ maxHeight: 220, maxWidth: "calc(100vw - 100px)", width: "auto" }} muted playsInline />
                ) : (
                  <img src={mediaPreview} alt="" className="rounded-2xl object-cover shadow-xl"
                    style={{ maxHeight: 220, maxWidth: "calc(100vw - 100px)", width: "auto" }} />
                )}
                <button onClick={() => { setMediaData(null); setMediaPreview(null); setVideoUploadUrl(null); setVideoUploading(false); setVideoUploadProgress(0); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1 pb-2">
                {videoUploading ? (
                  <div className="space-y-1.5">
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Uploading video… {videoUploadProgress}%</p>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {mediaData === "__video__" ? <>Video ready to send.<br />Add a caption below.</> : <>Image ready to send.<br />Add a caption below.</>}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Voice note preview — docked above input, never hidden under it */}
        {audioPreviewUrl && !isRecording && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-t" style={{ backgroundColor: "#0d0d0d", borderColor: "#1e1e1e" }}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Microphone className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <VoiceNoteBubble src={audioPreviewUrl} isMine={true} />
            </div>
            <button onClick={cancelRecording} className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-2 py-2 pb-4">
        <form onSubmit={send} className="flex items-end gap-2" style={noOutline}>
          {isRecording ? (
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-3xl" style={{ backgroundColor: "#111111" }}>
              <button type="button" onClick={cancelRecording} style={{ color: "rgba(255,255,255,0.45)" }}><X className="w-5 h-5" /></button>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-full bg-white/40 animate-pulse"
                    style={{ height: `${20 + Math.sin((Date.now() / 200 + i) * 1.5) * 10}%`, animationDelay: `${i * 50}ms` }} />
                ))}
              </div>
              <span className="text-sm font-mono flex-shrink-0 text-white">{fmtSecs(recordingSecs)}</span>
              <button type="button" onClick={stopRecording} className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Stop className="w-4 h-4 text-black" weight="fill" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-end gap-0 rounded-3xl overflow-hidden" style={{ backgroundColor: "#111111" }}>
              <div className="relative flex-shrink-0" ref={emojiPickerRef}>
                <button type="button" onClick={() => setShowEmojiPicker(v => !v)} className="p-3" style={{ color: showEmojiPicker ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}>
                  <Smiley className="w-6 h-6" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50 w-72 rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: "#111", maxHeight: 280 }}>
                    <div className="p-2 overflow-y-auto" style={{ maxHeight: 280 }}>
                      <div className="grid grid-cols-8 gap-0.5">
                        {["😀","😂","🤣","😊","😍","🥰","😎","🤩","😭","😅","🤔","😤","🥺","😳","🤯","🤫","👋","🔥","❤️","💯","✅","👊","🎉","🙏","💪","👑","💎","⚡","🌊","🎯","🚀","🌟","😈","👀","💀","🫡","🥶","🤗","😴","🤤","😏","😋","🤑","🫢","😬","🙄","😡","🤬"].map(e => (
                          <button key={e} onClick={() => { setText(prev => prev + e); setShowEmojiPicker(false); }}
                            className="text-xl p-1.5 rounded-lg hover:bg-white/10 transition-colors leading-none aspect-square flex items-center justify-center">
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[48px] flex items-center py-1">
                <textarea
                  value={text}
                  onChange={e => { setText(e.target.value); if (active) sendTyping(); }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as any); } }}
                  placeholder="Message"
                  rows={1}
                  className="w-full bg-transparent text-[15px] resize-none max-h-28 leading-relaxed py-2.5 placeholder-white/40"
                  style={{ color: "#FFFFFF", outline: "none", boxShadow: "none", border: "none" }}
                />
              </div>
              {!audioPreviewUrl && (
                <>
                  <button type="button" onClick={() => fileRef.current?.click()} className="p-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()} className="p-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Camera className="w-5 h-5" />
                  </button>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
            </div>
          )}

          {/* White send / mic button */}
          {!isRecording && (
            <button
              type={text.trim() || (mediaData && !videoUploading) || audioPreviewUrl ? "submit" : "button"}
              onClick={!text.trim() && !mediaData && !audioPreviewUrl ? startRecording : undefined}
              disabled={sending || videoUploading}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-lg transition-all hover:bg-gray-200 disabled:opacity-50"
              style={noOutline}
            >
              {sending || videoUploading
                ? <SpinnerGap className="w-5 h-5 text-black animate-spin" />
                : text.trim() || mediaData || audioPreviewUrl
                  ? <PaperPlaneTilt className="w-5 h-5 text-black" weight="fill" />
                  : <Microphone className="w-5 h-5 text-black" weight="fill" />}
            </button>
          )}
        </form>
        </div>
      </div>
    </div>
  ) : (
    <div className="hidden md:flex items-center justify-center h-full" style={{ backgroundColor: "#000000" }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#111111" }}>
          <PaperPlaneTilt className="w-8 h-8" style={{ color: "rgba(255,255,255,0.45)" }} />
        </div>
        <p className="text-xl font-semibold mb-1" style={{ color: "#FFFFFF" }}>Your Messages</p>
        <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>Select a conversation or start a new one</p>
        <button onClick={() => setShowNewConvo(true)} className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">
          Start a conversation
        </button>
      </div>
    </div>
  );

  const NewConvoModal = showNewConvo && (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" style={{ backgroundColor: "#111111" }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#1a1a1a" }}>
          <h2 className="font-bold text-lg" style={{ color: "#FFFFFF" }}>New message</h2>
          <button onClick={() => { setShowNewConvo(false); setUserSearch(""); }} style={{ color: "rgba(255,255,255,0.45)" }}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 mb-4" style={{ backgroundColor: "#1a1a1a" }}>
            <MagnifyingGlass className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search mutual followers"
              className="flex-1 bg-transparent text-sm placeholder-white/40"
              style={{ color: "#FFFFFF", outline: "none", boxShadow: "none", border: "none" }} autoFocus />
          </div>
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>You can only message users who follow you back</p>
          <div className="max-h-[300px] overflow-y-auto">
            {searchLoading ? (
              <div className="flex justify-center py-4"><SpinnerGap className="w-5 h-5 animate-spin text-white" /></div>
            ) : searchResults.length === 0 && userSearch ? (
              <p className="text-center py-4 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>No mutual followers found</p>
            ) : (
              searchResults.map(user => (
                <button key={user._id || user.id} onClick={() => startConversation(user)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:opacity-80">
                  <Avatar src={user.profileImage} name={user.name} size={44} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm truncate" style={{ color: "#FFFFFF" }}>{user.name}</span>
                      {!user.isSpecial && user.isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" weight="fill" />}
                      {user.isSpecial && <DiamondBadge size={14} />}
                      {user.isSpecial && user.isVerified && <SealCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" weight="fill" />}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>@{user.username}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#080808" }}>
      <div className={`${(active || pendingRecipient) ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] md:max-w-[380px] border-r flex-shrink-0 pb-16 md:pb-0`} style={{ borderColor: "#111111" }}>
        {ConvList}
      </div>
      <div className={`${(active || pendingRecipient) ? "fixed inset-0 z-40 flex md:relative md:inset-auto md:z-auto" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {ChatWindow}
      </div>
      {NewConvoModal}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#080808" }}>
        <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    }>
      <MessagesPageInner />
    </Suspense>
  );
}
