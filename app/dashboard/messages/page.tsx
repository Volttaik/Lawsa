"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PaperPlaneTilt, SpinnerGap, ArrowLeft, MagnifyingGlass, Image as ImageIcon, X, Checks, Check, DotsThreeVertical, SealCheck, ArrowBendUpLeft, Trash, Plus, UserPlus } from "@phosphor-icons/react";
import ReactTimeago from "react-timeago";

interface Conversation { _id: string; participants: string[]; lastMessage?: string; lastMessageTime?: string; otherUser?: { _id: string; name: string; username: string; profileImage?: string; isVerified?: boolean; }; }
interface Message { _id: string; senderId: string; senderName: string; senderImage?: string; content: string; mediaUrl?: string; mediaType?: string; read?: boolean; edited?: boolean; isDeleted?: boolean; replyToId?: string; replyToContent?: string; replyToSender?: string; reactions?: Record<string,string[]>; createdAt: string; }
interface UserResult { _id: string; id?: string; name: string; username: string; profileImage?: string; isVerified?: boolean; followers?: string[]; following?: string[]; }

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
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  
  // New conversation modal
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<UserResult | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const searchDebounce = useRef<any>(null);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const [meRes, convsRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
        fetch("/api/messages", { credentials: "include" }).then(r => r.json()),
      ]);
      if (meRes.user) setMe(meRes.user);
      setConvs(convsRes.conversations || []);
      setLoading(false);

      // Handle startWith param - start new conversation with user
      if (startWithId && meRes.user) {
        const existingConv = (convsRes.conversations || []).find((c: Conversation) => 
          c.participants.includes(startWithId)
        );
        if (existingConv) {
          setActive(existingConv);
        } else {
          // Fetch user info and open new conversation mode
          const userRes = await fetch(`/api/users/${startWithId}`).then(r => r.json());
          if (userRes.user) {
            const canMessage = (meRes.user.following || []).includes(startWithId) && 
                               (userRes.user.following || []).includes(meRes.user._id || meRes.user.id);
            if (canMessage) {
              setPendingRecipient(userRes.user);
            }
          }
        }
        // Clear the URL param
        router.replace("/dashboard/messages");
      }
    };
    init();
  }, [startWithId, router]);

  // Search users for new conversation
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    if (!userSearch.trim()) {
      setSearchResults([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}&limit=10`).then(r => r.json());
      // Filter to only show mutual followers
      const mutuals = (res.users || []).filter((u: UserResult) => {
        const myId = me?.id || me?._id;
        const iFollow = (me?.following || []).includes(u._id || u.id);
        const theyFollow = (u.followers || []).includes(myId);
        return iFollow && theyFollow && (u._id || u.id) !== myId;
      });
      setSearchResults(mutuals);
      setSearchLoading(false);
    }, 300);
  }, [userSearch, me]);

  const loadMessages = useCallback(async (conv: Conversation) => {
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
    if ((!text.trim() && !mediaData)) return;
    
    const recipientId = pendingRecipient?._id || active?.participants.find(p => p !== (me?.id || me?._id));
    if (!recipientId) return;

    setSending(true);
    const body: any = { recipientId, content: text.trim() };
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
      body: JSON.stringify(body) 
    });
    const data = await res.json();

    if (data.message) {
      if (pendingRecipient) {
        // Refresh conversations list and select the new one
        const convsRes = await fetch("/api/messages", { credentials: "include" }).then(r => r.json());
        setConvs(convsRes.conversations || []);
        const newConv = (convsRes.conversations || []).find((c: Conversation) => c._id === data.conversationId);
        if (newConv) setActive(newConv);
        setPendingRecipient(null);
      } else {
        setMessages(prev => [...prev, data.message]);
      }
      setText(""); 
      setMediaData(null); 
      setMediaPreview(null); 
      setReplyTo(null);
    }
    setSending(false);
  };

  const deleteMsg = async (id: string) => {
    await fetch(`/api/messages/message/${id}`, { method: "DELETE", credentials: "include" });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true, content: "" } : m));
  };

  const startConversation = (user: UserResult) => {
    // Check if conversation already exists
    const existing = convs.find(c => c.participants.includes(user._id || user.id || ""));
    if (existing) {
      setActive(existing);
      setShowNewConvo(false);
      setUserSearch("");
    } else {
      setPendingRecipient(user);
      setShowNewConvo(false);
      setUserSearch("");
    }
  };

  const myId = me?.id || me?._id || "";
  const filtered = convs.filter(c => !search || c.otherUser?.name.toLowerCase().includes(search.toLowerCase()) || c.otherUser?.username.toLowerCase().includes(search.toLowerCase()) || c.lastMessage?.toLowerCase().includes(search.toLowerCase()));

  const ConvList = (
    <div className="flex flex-col h-full bg-[#111b21]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button 
            onClick={() => setShowNewConvo(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" weight="bold" />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-3 py-2">
          <MagnifyingGlass className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations" className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? <div className="flex justify-center pt-8"><SpinnerGap className="w-5 h-5 text-gray-400 animate-spin" /></div> :
          filtered.length === 0 ? (
            <div className="text-center pt-12 px-4">
              <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center mx-auto mb-4">
                <PaperPlaneTilt className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-300 font-semibold mb-1">{search ? "No conversations match" : "No conversations yet"}</p>
              <p className="text-gray-500 text-sm mb-4">Start chatting with your mutual followers</p>
              <button 
                onClick={() => setShowNewConvo(true)}
                className="px-4 py-2 bg-[#00a884] text-white rounded-full text-sm font-semibold hover:bg-[#00c896] transition-colors"
              >
                Start a conversation
              </button>
            </div>
          ) :
          filtered.map(conv => {
            const other = conv.otherUser;
            const isActive = active?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => { setActive(conv); setPendingRecipient(null); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}`}>
                <Avatar src={other?.profileImage} name={other?.name || "?"} size={48} online={isActive} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium text-sm truncate">{other?.name || "Unknown"}</span>
                      {other?.isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" weight="fill" />}
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

  const activeOther = pendingRecipient || active?.otherUser;

  const ChatWindow = (active || pendingRecipient) ? (
    <div className="flex flex-col h-full bg-[#0b141a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3942] bg-[#202c33]">
        <button onClick={() => { setActive(null); setPendingRecipient(null); }} className="md:hidden text-gray-400 hover:text-white p-1"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar src={activeOther?.profileImage} name={activeOther?.name || "?"} size={40} online={otherOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-white font-semibold text-sm truncate">{activeOther?.name}</p>
            {activeOther?.isVerified && <SealCheck className="w-4 h-4 text-blue-400" weight="fill" />}
          </div>
          <p className="text-xs text-gray-400">
            {pendingRecipient ? "New conversation" : typing ? <span className="text-green-400">typing...</span> : otherOnline ? <span className="text-green-400">online</span> : activeOther?.username ? `@${activeOther.username}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5"><DotsThreeVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {pendingRecipient ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Avatar src={pendingRecipient.profileImage} name={pendingRecipient.name} size={80} />
            <h3 className="text-white font-bold text-lg mt-4">{pendingRecipient.name}</h3>
            <p className="text-gray-500 text-sm">@{pendingRecipient.username}</p>
            <p className="text-gray-400 text-sm mt-4">Start a new conversation with {pendingRecipient.name}</p>
          </div>
        ) : msgsLoading ? (
          <div className="flex justify-center pt-8"><SpinnerGap className="w-5 h-5 text-gray-400 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
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
                  <div className={`relative px-3 py-2 rounded-2xl text-sm ${isMine ? "rounded-tr-sm text-white bg-[#005c4b]" : "rounded-tl-sm text-gray-100 bg-[#1f2c34]"}`}>
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
                          {isMine && (msg.read ? <Checks className="w-3.5 h-3.5 text-blue-400" /> : <Check className="w-3.5 h-3.5 text-gray-500" />)}
                        </div>
                      </>
                    )}
                    {!msg.isDeleted && (
                      <div className={`absolute ${isMine ? "left-0 -translate-x-full pl-0 pr-2" : "right-0 translate-x-full pr-0 pl-2"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                        <button onClick={() => setReplyTo(msg)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]"><ArrowBendUpLeft className="w-3.5 h-3.5 text-gray-300" /></button>
                        {isMine && !msg.isDeleted && <button onClick={() => deleteMsg(msg._id)} className="p-1.5 bg-[#1f2c34] rounded-full hover:bg-[#2a3942]"><Trash className="w-3.5 h-3.5 text-gray-300" /></button>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2a3942] bg-[#1f2c34]">
          <div className="flex-1 border-l-2 border-green-500 pl-3">
            <p className="text-green-400 text-xs font-semibold">{replyTo.senderName}</p>
            <p className="text-gray-300 text-xs truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t border-[#2a3942] bg-[#1f2c34]">
          <div className="relative inline-block">
            <img src={mediaPreview} alt="" className="h-16 rounded-lg object-cover" />
            <button onClick={() => { setMediaData(null); setMediaPreview(null); }} className="absolute -top-1 -right-1 bg-black rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex items-end gap-2 px-3 py-3 bg-[#111b21]">
        <button type="button" onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-white flex-shrink-0"><ImageIcon className="w-5 h-5" /></button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        <div className="flex-1 flex items-end bg-[#2a3942] rounded-2xl px-4 py-2.5 min-h-[44px]">
          <textarea value={text} onChange={e => { setText(e.target.value); if (active) sendTyping(); }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
            placeholder="Message" rows={1} className="flex-1 bg-transparent text-gray-100 text-sm outline-none resize-none placeholder-gray-500 max-h-28 leading-relaxed" />
        </div>
        <button type="submit" disabled={(!text.trim() && !mediaData) || sending}
          className="p-3 bg-[#00a884] rounded-full flex-shrink-0 disabled:opacity-50 hover:bg-[#00c896] transition-colors">
          {sending ? <SpinnerGap className="w-4 h-4 text-white animate-spin" /> : <PaperPlaneTilt className="w-4 h-4 text-white" />}
        </button>
      </form>
    </div>
  ) : (
    <div className="hidden md:flex items-center justify-center h-full bg-[#0b141a]">
      <div className="text-center text-gray-500">
        <div className="w-20 h-20 rounded-full bg-[#1f2c34] flex items-center justify-center mx-auto mb-4">
          <PaperPlaneTilt className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-xl font-semibold text-gray-300 mb-1">Your Messages</p>
        <p className="text-sm mb-4">Select a conversation or start a new one</p>
        <button 
          onClick={() => setShowNewConvo(true)}
          className="px-4 py-2 bg-[#00a884] text-white rounded-full text-sm font-semibold hover:bg-[#00c896] transition-colors"
        >
          Start a conversation
        </button>
      </div>
    </div>
  );

  // New conversation modal
  const NewConvoModal = showNewConvo && (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20">
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3942]">
          <h2 className="text-white font-bold text-lg">New message</h2>
          <button onClick={() => { setShowNewConvo(false); setUserSearch(""); }} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-4 py-2.5 mb-4">
            <MagnifyingGlass className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input 
              value={userSearch} 
              onChange={e => setUserSearch(e.target.value)} 
              placeholder="Search mutual followers" 
              className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500" 
              autoFocus 
            />
          </div>
          <p className="text-gray-500 text-xs mb-3">You can only message users who follow you back</p>
          <div className="max-h-[300px] overflow-y-auto">
            {searchLoading ? (
              <div className="flex justify-center py-4"><SpinnerGap className="w-5 h-5 text-gray-400 animate-spin" /></div>
            ) : searchResults.length === 0 && userSearch ? (
              <p className="text-center text-gray-500 py-4 text-sm">No mutual followers found</p>
            ) : (
              searchResults.map(user => (
                <button 
                  key={user._id || user.id} 
                  onClick={() => startConversation(user)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] rounded-xl transition-colors"
                >
                  <Avatar src={user.profileImage} name={user.name} size={44} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium text-sm truncate">{user.name}</span>
                      {user.isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" weight="fill" />}
                    </div>
                    <p className="text-gray-500 text-xs">@{user.username}</p>
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
    <div className="flex h-screen bg-[#111b21]">
      <div className={`${(active || pendingRecipient) ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] md:max-w-[380px] border-r border-[#2a3942] flex-shrink-0`}>
        {ConvList}
      </div>
      <div className={`${(active || pendingRecipient) ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {ChatWindow}
      </div>
      {NewConvoModal}
    </div>
  );
}
