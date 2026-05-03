"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, ArrowLeft, Search, Image as ImageIcon, X, CheckCheck, Check, Mic, StopCircle, MoreVertical, Phone, Video, BadgeCheck, Reply, Edit2, Trash2, Smile } from "lucide-react";
import ReactTimeago from "react-timeago";

interface Conversation { _id: string; participants: string[]; lastMessage?: string; lastMessageTime?: string; otherUser?: { _id: string; name: string; username: string; profileImage?: string; isVerified?: boolean; }; }
interface Message { _id: string; senderId: string; senderName: string; senderImage?: string; content: string; mediaUrl?: string; mediaType?: string; read?: boolean; edited?: boolean; isDeleted?: boolean; replyToId?: string; replyToContent?: string; replyToSender?: string; reactions?: Record<string,string[]>; createdAt: string; }

function Avatar({ src, name, size = 40, online }: { src?: string; name: string; size?: number; online?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src ? <img src={src} alt={name} className="rounded-full object-cover w-full h-full" /> :
        <img src="/logo.jpg" alt="Sosa" className="rounded-full object-cover w-full h-full" />}
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B141A]" />}
    </div>
  );
}

function formatTime(d: string) { const dt = new Date(d); return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

export default function MessagesPage() {
  const [me, setMe] = useState<any>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<any>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).then(d => { if (d.user) setMe(d.user); });
    fetch("/api/messages", { credentials: "include" }).then(r => r.json()).then(d => { setConvs(d.conversations || []); setLoading(false); });
  }, []);

  const loadMessages = useCallback(async (conv: Conversation) => {
    setActiveId(conv._id);
    setMsgsLoading(true);
    const res = await fetch(`/api/messages/${conv._id}`, { credentials: "include" });
    const data = await res.json();
    setMessages(data.messages || []);
    setOtherOnline(data.otherUserOnline || false);
    setMsgsLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active);
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(active), 3000);
    return () => clearInterval(pollRef.current);
  }, [active, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendTyping = useCallback(async () => {
    if (!active) return;
    clearTimeout(typingTimer.current);
    setTyping(true);
    await fetch(`/api/messages/${active._id}/typing`, { method: "POST", credentials: "include" });
    typingTimer.current = setTimeout(() => setTyping(false), 1500);
  }, [active]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setMediaData(ev.target?.result as string); setMediaPreview(URL.createObjectURL(file)); };
    reader.readAsDataURL(file);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !mediaData) || !active) return;
    setSending(true);
    const otherId = active.participants.find(p => p !== (me?.id || me?._id));
    const body: any = { recipientId: otherId, content: text.trim() };
    if (mediaData) { body.mediaData = mediaData; body.mediaType = mediaData.startsWith("data:image") ? "image" : mediaData.startsWith("data:video") ? "video" : "file"; }
    if (replyTo) { body.replyToId = replyTo._id; body.replyToContent = replyTo.content; body.replyToSender = replyTo.senderName; }
    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    const data = await res.json();
    if (data.message) { setMessages(prev => [...prev, data.message]); setText(""); setMediaData(null); setMediaPreview(null); setReplyTo(null); }
    setSending(false);
  };

  const deleteMsg = async (id: string) => {
    await fetch(`/api/messages/message/${id}`, { method: "DELETE", credentials: "include" });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true, content: "" } : m));
  };

  const myId = me?.id || me?._id || "";
  const filtered = convs.filter(c => !search || c.otherUser?.name.toLowerCase().includes(search.toLowerCase()) || c.otherUser?.username.toLowerCase().includes(search.toLowerCase()) || c.lastMessage?.toLowerCase().includes(search.toLowerCase()));

  const ConvList = (
    <div className="flex flex-col h-full" style={{ background: "#111b21" }}>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white mb-3">Messages</h1>
        <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations" className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div> :
          filtered.length === 0 ? <div className="text-center pt-12 text-gray-500 text-sm">{search ? "No conversations match your search" : "No conversations yet"}</div> :
          filtered.map(conv => {
            const other = conv.otherUser;
            const isActive = active?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => setActive(conv)} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}`}>
                <Avatar src={other?.profileImage} name={other?.name || "?"} size={48} online={isActive || false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium text-sm truncate">{other?.name || "Unknown"}</span>
                      {other?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                    </div>
                    {conv.lastMessageTime && <span className="text-gray-500 text-xs flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>}
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{conv.lastMessage || "Start a conversation"}</p>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );

  const ChatWindow = active ? (
    <div className="flex flex-col h-full" style={{ background: "#0b141a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3942]" style={{ background: "#202c33" }}>
        <button onClick={() => setActive(null)} className="md:hidden text-gray-400 hover:text-white p-1"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar src={active.otherUser?.profileImage} name={active.otherUser?.name || "?"} size={40} online={otherOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-white font-semibold text-sm truncate">{active.otherUser?.name}</p>
            {active.otherUser?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
          </div>
          <p className="text-xs text-gray-400">{typing ? <span className="text-green-400">typing...</span> : otherOnline ? <span className="text-green-400">online</span> : active.otherUser?.username ? `@${active.otherUser.username}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {msgsLoading ? <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div> :
          messages.map((msg) => {
            const isMine = msg.senderId === myId;
            return (
              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-[75%] relative`}>
                  {msg.replyToId && msg.replyToContent && (
                    <div className={`text-xs mb-1 px-3 py-1.5 rounded-lg border-l-2 ${isMine ? "bg-[#004a3a] border-green-400 text-gray-300" : "bg-[#1e2d35] border-gray-500 text-gray-300"}`}>
                      <span className="font-semibold text-green-400">{msg.replyToSender}</span>
                      <p className="truncate">{msg.replyToContent}</p>
                    </div>
                  )}
                  <div className={`relative px-3 py-2 rounded-2xl text-sm ${isMine ? "rounded-tr-sm text-white" : "rounded-tl-sm text-gray-100"}`}
                    style={{ background: isMine ? "#005c4b" : "#1f2c34" }}>
                    {msg.isDeleted ? (
                      <em className="text-gray-500 text-xs">This message was deleted</em>
                    ) : (
                      <>
                        {msg.mediaUrl && (
                          msg.mediaType === "image" ? <img src={msg.mediaUrl} alt="" className="rounded-xl max-w-full mb-1.5 max-h-64 object-cover" /> :
                          msg.mediaType === "video" ? <video src={msg.mediaUrl} controls className="rounded-xl max-w-full mb-1.5 max-h-64" /> :
                          <a href={msg.mediaUrl} target="_blank" className="text-blue-400 underline text-xs">View file</a>
                        )}
                        {msg.content && <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>}
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                          {msg.edited && <span className="text-[10px] text-gray-500">edited</span>}
                          <span className="text-[11px] text-gray-400">{formatTime(msg.createdAt)}</span>
                          {isMine && (msg.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> : <Check className="w-3.5 h-3.5 text-gray-500" />)}
                        </div>
                      </>
                    )}
                    {!msg.isDeleted && (
                      <div className={`absolute ${isMine ? "left-0 -translate-x-full pl-0 pr-2" : "right-0 translate-x-full pr-0 pl-2"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                        <button onClick={() => setReplyTo(msg)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]"><Reply className="w-3.5 h-3.5 text-gray-300" /></button>
                        {isMine && !msg.isDeleted && <button onClick={() => deleteMsg(msg._id)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]"><Trash2 className="w-3.5 h-3.5 text-gray-300" /></button>}
                      </div>
                    )}
                  </div>
                  {Object.entries(msg.reactions || {}).length > 0 && (
                    <div className={`flex gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                      {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                        <span key={emoji} className="text-xs bg-[#1f2c34] px-1.5 py-0.5 rounded-full">{emoji} {(users as string[]).length}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2a3942]" style={{ background: "#1f2c34" }}>
          <div className="flex-1 border-l-2 border-green-500 pl-3">
            <p className="text-green-400 text-xs font-semibold">{replyTo.senderName}</p>
            <p className="text-gray-300 text-xs truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t border-[#2a3942]" style={{ background: "#1f2c34" }}>
          <div className="relative inline-block">
            <img src={mediaPreview} alt="" className="h-16 rounded-lg object-cover" />
            <button onClick={() => { setMediaData(null); setMediaPreview(null); }} className="absolute -top-1 -right-1 bg-black rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex items-end gap-2 px-3 py-3" style={{ background: "#111b21" }}>
        <button type="button" onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-white flex-shrink-0"><ImageIcon className="w-5 h-5" /></button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        <div className="flex-1 flex items-end bg-[#2a3942] rounded-2xl px-4 py-2.5 min-h-[44px]">
          <textarea value={text} onChange={e => { setText(e.target.value); sendTyping(); }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
            placeholder="Message" rows={1} className="flex-1 bg-transparent text-gray-100 text-sm outline-none resize-none placeholder-gray-500 max-h-28 leading-relaxed" />
        </div>
        <button type="submit" disabled={(!text.trim() && !mediaData) || sending}
          className="p-3 bg-[#00a884] rounded-full flex-shrink-0 disabled:opacity-50 hover:bg-[#00c896] transition-colors">
          {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </form>
    </div>
  ) : (
    <div className="hidden md:flex items-center justify-center h-full" style={{ background: "#0b141a" }}>
      <div className="text-center text-gray-500">
        <div className="w-20 h-20 rounded-full bg-[#1f2c34] flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-xl font-semibold text-gray-300 mb-1">Your Messages</p>
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: "#111b21" }}>
      <div className={`${active ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] md:max-w-[380px] border-r border-[#2a3942] flex-shrink-0`}>
        {ConvList}
      </div>
      <div className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {ChatWindow}
      </div>
    </div>
  );
}
