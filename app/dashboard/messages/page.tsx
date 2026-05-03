"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PaperPlaneTilt, ArrowLeft, MagnifyingGlass, Image as ImageIcon, X,
  CheckCircle, Circle, DotsThreeVertical, ArrowBendUpLeft, Trash,
  SpinnerGap, SealCheck, ChatCircleDots, Plus
} from "@phosphor-icons/react";

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  otherUser?: {
    _id: string;
    name: string;
    username: string;
    profileImage?: string;
    isVerified?: boolean;
  };
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
  replyToId?: string;
  replyToContent?: string;
  replyToSender?: string;
  reactions?: Record<string, string[]>;
  createdAt: string;
}

interface UserSuggestion {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  isVerified?: boolean;
}

function Avatar({ src, name, size = 40, online }: { src?: string; name: string; size?: number; online?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="rounded-full object-cover w-full h-full" />
        : <div className="rounded-full w-full h-full bg-[#2a3942] flex items-center justify-center text-white font-bold text-sm">{name?.[0]?.toUpperCase() || "?"}</div>
      }
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B141A]" />}
    </div>
  );
}

function formatTime(d: string) {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#111b21]">
        <SpinnerGap size={32} className="text-gray-400 animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
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
  const [newConvSearch, setNewConvSearch] = useState("");
  const [newConvUsers, setNewConvUsers] = useState<UserSuggestion[]>([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvLoading, setNewConvLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const newConvDebounce = useRef<any>(null);

  // Load current user and conversations
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.user) setMe(d.user); });
    fetchConvs();
  }, []);

  const fetchConvs = async () => {
    const res = await fetch("/api/messages", { credentials: "include" });
    const d = await res.json();
    setConvs(d.conversations || []);
    setLoading(false);
  };

  // Handle ?userId= param to auto-open conversation
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !me) return;
    // Find existing conversation with this user
    const existing = convs.find(c => c.otherUser?._id === targetUserId);
    if (existing) {
      setActive(existing);
    } else {
      // Fetch user info and create a pending conversation
      fetch(`/api/users/${targetUserId}`, { credentials: "include" })
        .then(r => r.json())
        .then(d => {
          if (d.user) {
            const pendingConv: Conversation = {
              _id: `pending-${targetUserId}`,
              participants: [me.id || me._id, targetUserId],
              otherUser: {
                _id: d.user._id,
                name: d.user.name,
                username: d.user.username,
                profileImage: d.user.profileImage,
                isVerified: d.user.isVerified,
              },
            };
            setActive(pendingConv);
          }
        });
    }
  }, [searchParams, me, convs]);

  const loadMessages = useCallback(async (conv: Conversation) => {
    if (conv._id.startsWith("pending-")) {
      setMessages([]);
      setOtherOnline(false);
      setMsgsLoading(false);
      return;
    }
    setMsgsLoading(true);
    const res = await fetch(`/api/messages/${conv._id}`, { credentials: "include" });
    const data = await res.json();
    setMessages(data.messages || []);
    setOtherOnline(data.otherUserOnline || false);
    setOtherTyping(data.otherUserTyping || false);
    setMsgsLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active);
    clearInterval(pollRef.current);
    if (!active._id.startsWith("pending-")) {
      pollRef.current = setInterval(() => loadMessages(active), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [active, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendTyping = useCallback(async () => {
    if (!active || active._id.startsWith("pending-")) return;
    clearTimeout(typingTimer.current);
    await fetch(`/api/messages/${active._id}/typing`, { method: "POST", credentials: "include" });
    typingTimer.current = setTimeout(() => {}, 1500);
  }, [active]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setMediaData(ev.target?.result as string);
      setMediaPreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !mediaData) || !active) return;
    setSending(true);
    const otherId = active.otherUser?._id || active.participants.find(p => p !== (me?.id || me?._id));
    const body: any = { recipientId: otherId, content: text.trim() };
    if (mediaData) {
      body.mediaData = mediaData;
      body.mediaType = mediaData.startsWith("data:image") ? "image" : mediaData.startsWith("data:video") ? "video" : "file";
    }
    if (replyTo) {
      body.replyToId = replyTo._id;
      body.replyToContent = replyTo.content;
      body.replyToSender = replyTo.senderName;
    }
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.message) {
      setMessages(prev => [...prev, data.message]);
      setText("");
      setMediaData(null);
      setMediaPreview(null);
      setReplyTo(null);
      // If this was a pending conversation, refresh convs and update active
      if (active._id.startsWith("pending-")) {
        await fetchConvs();
        const freshConvs = await fetch("/api/messages", { credentials: "include" }).then(r => r.json());
        const newConv = (freshConvs.conversations || []).find((c: Conversation) => c.otherUser?._id === otherId);
        if (newConv) setActive(newConv);
      }
    } else if (data.error) {
      alert(data.error);
    }
    setSending(false);
  };

  const deleteMsg = async (id: string) => {
    await fetch(`/api/messages/message/${id}`, { method: "DELETE", credentials: "include" });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true, content: "" } : m));
  };

  // New conversation search
  useEffect(() => {
    clearTimeout(newConvDebounce.current);
    if (!newConvSearch.trim()) { setNewConvUsers([]); return; }
    setNewConvLoading(true);
    newConvDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(newConvSearch)}&limit=8`, { credentials: "include" });
      const d = await res.json();
      setNewConvUsers(d.users || []);
      setNewConvLoading(false);
    }, 350);
  }, [newConvSearch]);

  const startConversation = (user: UserSuggestion) => {
    const existing = convs.find(c => c.otherUser?._id === user._id);
    if (existing) {
      setActive(existing);
    } else {
      const myId = me?.id || me?._id;
      const pendingConv: Conversation = {
        _id: `pending-${user._id}`,
        participants: [myId, user._id],
        otherUser: user,
      };
      setActive(pendingConv);
    }
    setShowNewConv(false);
    setNewConvSearch("");
    setNewConvUsers([]);
  };

  const myId = me?.id || me?._id || "";
  const filtered = convs.filter(c =>
    !search ||
    c.otherUser?.name.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUser?.username.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  const ConvList = (
    <div className="flex flex-col h-full" style={{ background: "#111b21" }}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button
            onClick={() => setShowNewConv(true)}
            className="p-2 bg-[#00a884] rounded-full text-white hover:bg-[#00c896] transition-colors"
          >
            <Plus size={18} weight="bold" />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-3 py-2">
          <MagnifyingGlass size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading
          ? <div className="flex justify-center pt-8"><SpinnerGap size={20} className="text-gray-400 animate-spin" /></div>
          : filtered.length === 0
            ? <div className="text-center pt-12 text-gray-500 text-sm px-4">
                {search ? "No conversations match your search" : "No conversations yet. Tap + to start one."}
              </div>
            : filtered.map(conv => {
                const other = conv.otherUser;
                const isActive = active?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActive(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}`}
                  >
                    <Avatar src={other?.profileImage} name={other?.name || "?"} size={48} online={isActive} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium text-sm truncate">{other?.name || "Unknown"}</span>
                          {other?.isVerified && <SealCheck size={14} weight="fill" className="text-blue-400 flex-shrink-0" />}
                        </div>
                        {conv.lastMessageTime && (
                          <span className="text-gray-500 text-xs flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{conv.lastMessage || "Start a conversation"}</p>
                    </div>
                  </button>
                );
              })
        }
      </div>
    </div>
  );

  const ChatWindow = active ? (
    <div className="flex flex-col h-full" style={{ background: "#0b141a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3942]" style={{ background: "#202c33" }}>
        <button onClick={() => setActive(null)} className="md:hidden text-gray-400 hover:text-white p-1">
          <ArrowLeft size={20} />
        </button>
        <Avatar src={active.otherUser?.profileImage} name={active.otherUser?.name || "?"} size={40} online={otherOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-white font-semibold text-sm truncate">{active.otherUser?.name}</p>
            {active.otherUser?.isVerified && <SealCheck size={16} weight="fill" className="text-blue-400" />}
          </div>
          <p className="text-xs text-gray-400">
            {otherTyping
              ? <span className="text-green-400">typing...</span>
              : otherOnline
                ? <span className="text-green-400">online</span>
                : active.otherUser?.username ? `@${active.otherUser.username}` : ""}
          </p>
        </div>
        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5">
          <DotsThreeVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {msgsLoading
          ? <div className="flex justify-center pt-8"><SpinnerGap size={20} className="text-gray-400 animate-spin" /></div>
          : messages.length === 0
            ? <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                <ChatCircleDots size={48} className="opacity-30" />
                <p>No messages yet. Say hello!</p>
              </div>
            : messages.map((msg) => {
                const isMine = msg.senderId === myId;
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                    <div className="max-w-[75%] relative">
                      {msg.replyToId && msg.replyToContent && (
                        <div className={`text-xs mb-1 px-3 py-1.5 rounded-lg border-l-2 ${isMine ? "bg-[#004a3a] border-green-400 text-gray-300" : "bg-[#1e2d35] border-gray-500 text-gray-300"}`}>
                          <span className="font-semibold text-green-400">{msg.replyToSender}</span>
                          <p className="truncate">{msg.replyToContent}</p>
                        </div>
                      )}
                      <div
                        className={`relative px-3 py-2 rounded-2xl text-sm ${isMine ? "rounded-tr-sm text-white" : "rounded-tl-sm text-gray-100"}`}
                        style={{ background: isMine ? "#005c4b" : "#1f2c34" }}
                      >
                        {msg.isDeleted ? (
                          <em className="text-gray-500 text-xs">This message was deleted</em>
                        ) : (
                          <>
                            {msg.mediaUrl && (
                              msg.mediaType === "image"
                                ? <img src={msg.mediaUrl} alt="" className="rounded-xl max-w-full mb-1.5 max-h-64 object-cover" />
                                : msg.mediaType === "video"
                                  ? <video src={msg.mediaUrl} controls className="rounded-xl max-w-full mb-1.5 max-h-64" />
                                  : <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline text-xs">View file</a>
                            )}
                            {msg.content && <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>}
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                              {msg.edited && <span className="text-[10px] text-gray-500">edited</span>}
                              <span className="text-[11px] text-gray-400">{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                msg.read
                                  ? <CheckCircle size={14} weight="fill" className="text-blue-400" />
                                  : <Circle size={14} className="text-gray-500" />
                              )}
                            </div>
                          </>
                        )}
                        {!msg.isDeleted && (
                          <div className={`absolute ${isMine ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                            <button onClick={() => setReplyTo(msg)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]">
                              <ArrowBendUpLeft size={14} className="text-gray-300" />
                            </button>
                            {isMine && (
                              <button onClick={() => deleteMsg(msg._id)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]">
                                <Trash size={14} className="text-gray-300" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {Object.entries(msg.reactions || {}).length > 0 && (
                        <div className={`flex gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                          {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                            <span key={emoji} className="text-xs bg-[#1f2c34] px-1.5 py-0.5 rounded-full">
                              {emoji} {(users as string[]).length}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
        }
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2a3942]" style={{ background: "#1f2c34" }}>
          <div className="flex-1 border-l-2 border-green-500 pl-3">
            <p className="text-green-400 text-xs font-semibold">{replyTo.senderName}</p>
            <p className="text-gray-300 text-xs truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t border-[#2a3942]" style={{ background: "#1f2c34" }}>
          <div className="relative inline-block">
            <img src={mediaPreview} alt="" className="h-16 rounded-lg object-cover" />
            <button
              onClick={() => { setMediaData(null); setMediaPreview(null); }}
              className="absolute -top-1 -right-1 bg-black rounded-full p-0.5"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex items-end gap-2 px-3 py-3" style={{ background: "#111b21" }}>
        <button type="button" onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-white flex-shrink-0">
          <ImageIcon size={22} />
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        <div className="flex-1 flex items-end bg-[#2a3942] rounded-2xl px-4 py-2.5 min-h-[44px]">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); sendTyping(); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as any); } }}
            placeholder="Message"
            rows={1}
            className="flex-1 bg-transparent text-gray-100 text-sm outline-none resize-none placeholder-gray-500 max-h-28 leading-relaxed"
          />
        </div>
        <button
          type="submit"
          disabled={(!text.trim() && !mediaData) || sending}
          className="p-3 bg-[#00a884] rounded-full flex-shrink-0 disabled:opacity-50 hover:bg-[#00c896] transition-colors"
        >
          {sending
            ? <SpinnerGap size={16} className="text-white animate-spin" />
            : <PaperPlaneTilt size={16} weight="fill" className="text-white" />
          }
        </button>
      </form>
    </div>
  ) : (
    <div className="hidden md:flex items-center justify-center h-full" style={{ background: "#0b141a" }}>
      <div className="text-center text-gray-500">
        <div className="w-20 h-20 rounded-full bg-[#1f2c34] flex items-center justify-center mx-auto mb-4">
          <ChatCircleDots size={36} className="text-gray-500" />
        </div>
        <p className="text-xl font-semibold text-gray-300 mb-1">Your Messages</p>
        <p className="text-sm">Select a conversation or start a new one</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: "#111b21" }}>
      {/* New Conversation Modal */}
      {showNewConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111b21] rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3942]">
              <h2 className="text-white font-bold">New Message</h2>
              <button onClick={() => { setShowNewConv(false); setNewConvSearch(""); setNewConvUsers([]); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-3 py-2 mb-3">
                <MagnifyingGlass size={16} className="text-gray-400" />
                <input
                  autoFocus
                  value={newConvSearch}
                  onChange={e => setNewConvSearch(e.target.value)}
                  placeholder="Search people to message..."
                  className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {newConvLoading
                  ? <div className="flex justify-center py-4"><SpinnerGap size={20} className="text-gray-400 animate-spin" /></div>
                  : newConvUsers.length === 0 && newConvSearch
                    ? <p className="text-center text-gray-500 text-sm py-4">No users found</p>
                    : newConvUsers.map(u => (
                        <button
                          key={u._id}
                          onClick={() => startConversation(u)}
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#202c33] transition-colors text-left"
                        >
                          <Avatar src={u.profileImage} name={u.name} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-white font-medium text-sm truncate">{u.name}</span>
                              {u.isVerified && <SealCheck size={14} weight="fill" className="text-blue-400" />}
                            </div>
                            <p className="text-gray-400 text-xs">@{u.username}</p>
                          </div>
                        </button>
                      ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${active ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] md:max-w-[380px] border-r border-[#2a3942] flex-shrink-0`}>
        {ConvList}
      </div>
      <div className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {ChatWindow}
      </div>
    </div>
  );
}
