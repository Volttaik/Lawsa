import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { PaperPlaneTilt, SpinnerGap, ArrowLeft, MagnifyingGlass, Smiley, Image as ImageIcon, X, VideoCamera, Phone, Check, Checks, Trash } from "@phosphor-icons/react";
import Linkify from "@/components/Linkify";
import StickerPicker from "@/components/StickerPicker";
import { useSession } from "@/components/SessionProvider";
import { timeAgo } from "@/lib/utils";
import { uploadFile } from "@/lib/uploadClient";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

export default function MessagesPage() {
  const params = useParams<{ userId?: string }>();
  const [, navigate] = useLocation();
  const { user } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(params?.userId || null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const myId = user?.id || user?._id || "";
  const isMobile = window.innerWidth < 768;

  const fetchConvs = useCallback(async () => {
    const data = await fetch("/api/messages/conversations", { credentials: "include" }).then(r => r.json()).catch(() => ({}));
    if (data.conversations) setConversations(data.conversations);
  }, []);

  const openConversation = useCallback(async (userId: string) => {
    setActiveUserId(userId);
    setLoadingMsgs(true);
    try {
      const [userRes, convRes] = await Promise.all([
        fetch(`/api/users/${userId}`, { credentials: "include" }).then(r => r.json()),
        fetch(`/api/messages/with/${userId}`, { credentials: "include" }).then(r => r.json()),
      ]);
      setOtherUser(userRes.user);
      setConversationId(convRes.conversation?.id || convRes.conversation?._id || null);
      setMessages(convRes.messages || []);
    } catch {}
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingConvs(true);
    fetchConvs().finally(() => setLoadingConvs(false));
  }, [user, fetchConvs]);

  useEffect(() => {
    if (params?.userId && params.userId !== activeUserId) openConversation(params.userId);
  }, [params?.userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  useEffect(() => {
    if (!activeUserId) { if (pollRef.current) clearInterval(pollRef.current); return; }
    const poll = async () => {
      if (!activeUserId) return;
      const data = await fetch(`/api/messages/with/${activeUserId}`, { credentials: "include" }).then(r => r.json()).catch(() => ({}));
      if (data.messages?.length) {
        setMessages(prev => {
          const ids = new Set(prev.map((m: any) => m._id || m.id));
          const newOnes = data.messages.filter((m: any) => !ids.has(m._id || m.id));
          if (!newOnes.length) return prev;
          return [...prev, ...newOnes].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    };
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeUserId]);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const data = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`, { credentials: "include" }).then(r => r.json()).catch(() => ({}));
      setSearchResults(data.users || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const sendMessage = async (content: string, mediaUrl = "", mediaType = "") => {
    if ((!content.trim() && !mediaUrl) || !activeUserId) return;
    setSending(true);
    const text_ = content.trim();
    setText("");
    const tmp = { _id: `tmp-${Date.now()}`, senderId: myId, content: text_, mediaUrl, mediaType, createdAt: new Date().toISOString(), read: false };
    setMessages(prev => [...prev, tmp]);
    const res = await fetch(`/api/messages/with/${activeUserId}`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: text_, mediaUrl, mediaType }) }).then(r => r.json()).catch(() => ({}));
    if (res.message) {
      setMessages(prev => prev.map(m => m._id === tmp._id ? res.message : m));
      setConversationId(res.conversation?.id || res.conversation?._id || conversationId);
      fetchConvs();
    }
    setSending(false);
  };

  const getDisplayUser = (conv: any) => {
    const otherId = (conv.participants || []).find((id: string) => id !== myId);
    return otherId;
  };

  const ConvList = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#222]">
        <h1 className="text-white font-bold text-lg mb-2">Messages</h1>
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people…"
            className="w-full bg-[#111] border border-white/10 rounded-full pl-9 pr-4 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-white/30 transition-colors" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          searching ? <div className="flex items-center justify-center py-8"><SpinnerGap size={20} className="animate-spin text-blue-500" /></div> :
          searchResults.map(u => (
            <button key={u.id || u._id} onClick={() => { setQuery(""); setSearchResults([]); openConversation(u.id || u._id); navigate(`/dashboard/messages/${u.id || u._id}`); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
              <Avatar src={u.profileImage} name={u.name} size={44} />
              <div><p className="text-white font-semibold text-sm">{u.name}</p><p className="text-gray-500 text-xs">@{u.username}</p></div>
            </button>
          ))
        ) : loadingConvs ? <div className="flex items-center justify-center py-8"><SpinnerGap size={20} className="animate-spin text-blue-500" /></div> :
        conversations.length === 0 ? <div className="text-center py-12 text-gray-500 text-sm px-4">No conversations yet.<br />Search for someone to message.</div> :
        conversations.map(conv => {
          const otherId = getDisplayUser(conv);
          const isActive = activeUserId === otherId;
          return (
            <button key={conv._id || conv.id} onClick={() => { setMessages([]); openConversation(otherId); navigate(`/dashboard/messages/${otherId}`); }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${isActive ? "bg-white/5" : ""}`}>
              <Avatar src="" name={otherId || "?"} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm truncate">{otherId}</p>
                  {conv.lastMessageTime && <span className="text-gray-600 text-[11px] flex-shrink-0 ml-2">{timeAgo(conv.lastMessageTime)}</span>}
                </div>
                {conv.lastMessage && <p className="text-gray-500 text-xs truncate">{conv.lastMessage}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222] bg-black flex-shrink-0">
        <button onClick={() => { setActiveUserId(null); navigate("/dashboard/messages"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors md:hidden"><ArrowLeft size={20} /></button>
        {otherUser ? (
          <>
            <Avatar src={otherUser.profileImage} name={otherUser.name} size={36} />
            <div className="flex-1 min-w-0"><p className="text-white font-bold text-sm">{otherUser.name}</p><p className="text-gray-500 text-xs">@{otherUser.username}</p></div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/dashboard/call/${activeUserId}?type=voice`)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Phone size={18} className="text-gray-400" /></button>
              <button onClick={() => navigate(`/dashboard/call/${activeUserId}?type=video`)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><VideoCamera size={18} className="text-gray-400" /></button>
            </div>
          </>
        ) : <p className="text-white font-bold">Chat</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: "#000" }}>
        {loadingMsgs ? <div className="flex items-center justify-center h-full"><SpinnerGap size={24} className="animate-spin text-blue-500" /></div> :
        messages.map(msg => {
          const isMe = msg.senderId === myId;
          if (msg.isDeleted) return <div key={msg._id || msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}><p className="text-gray-600 text-xs italic px-3 py-1">Message deleted</p></div>;
          return (
            <div key={msg._id || msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
              {!isMe && <Avatar src={otherUser?.profileImage} name={otherUser?.name || "?"} size={28} />}
              <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-[#1a1a1a] text-white rounded-bl-sm"}`}>
                  {msg.mediaUrl && msg.mediaType?.startsWith("image") && <img src={msg.mediaUrl} alt="" className="rounded-xl mb-1 max-w-full" style={{ maxHeight: 200 }} />}
                  {msg.mediaUrl && msg.mediaType?.startsWith("video") && <video src={msg.mediaUrl} controls className="rounded-xl mb-1 max-w-full" style={{ maxHeight: 200 }} />}
                  {msg.content && <Linkify text={msg.content} />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-600">{timeAgo(msg.createdAt)}</span>
                  {isMe && (msg.read ? <Checks size={10} className="text-blue-400" /> : <Check size={10} className="text-gray-600" />)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 border-t border-[#222] bg-black px-3 py-2">
        {showPicker && (
          <div className="mb-2">
            <StickerPicker
              onSelectSticker={v => { sendMessage(v); setShowPicker(false); }}
              onSelectEmoji={e => setText(t => t + e)}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => setShowPicker(!showPicker)} className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"><Smiley size={22} /></button>
          <textarea ref={textRef} value={text} onChange={e => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(text); } }}
            placeholder="Send a message…" rows={1}
            className="flex-1 bg-[#111] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-white/30 transition-colors" style={{ maxHeight: 120 }} />
          <button onClick={() => sendMessage(text)} disabled={sending || !text.trim()} className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
            {sending ? <SpinnerGap size={18} className="animate-spin text-white" /> : <PaperPlaneTilt size={18} className="text-white" weight="fill" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white h-screen overflow-hidden flex border-x border-[#222]" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className={`border-r border-[#222] flex-shrink-0 ${activeUserId ? "hidden md:flex md:flex-col" : "flex flex-col w-full"} md:w-72`}>
        <ConvList />
      </div>
      <div className={`flex-1 flex flex-col ${!activeUserId ? "hidden md:flex" : "flex"}`}>
        {activeUserId ? <ChatPanel /> : (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center"><PaperPlaneTilt size={24} className="text-gray-700" /></div>
            <p className="text-sm">Select a conversation or search for someone</p>
          </div>
        )}
      </div>
    </div>
  );
}
