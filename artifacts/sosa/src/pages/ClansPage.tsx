import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Users, PaperPlaneTilt, SpinnerGap, X, ArrowLeft, Crown, SignOut, Trash, ChatCircle, Smiley } from "@phosphor-icons/react";
import Linkify from "@/components/Linkify";
import StickerPicker from "@/components/StickerPicker";
import { useSession } from "@/components/SessionProvider";
import { timeAgo } from "@/lib/utils";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

function ClanLogo({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "CL";
  if (src) return <img src={src} alt={name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: Math.max(12, size * 0.35) }}>{initials}</div>;
}

interface Clan { _id: string; name: string; slug: string; logo?: string; description?: string; ownerId: string; ownerName: string; members: string[]; createdAt: string; }
interface WorldChatMsg { _id: string; clanId: string; senderId: string; senderName: string; senderUsername: string; senderImage?: string; content: string; createdAt: string; }

export default function ClansPage() {
  const { user } = useSession();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loadingClans, setLoadingClans] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", logo: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<WorldChatMsg[]>([]);
  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "members">("chat");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMsgTimeRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const selectedClanRef = useRef<Clan | null>(null);
  selectedClanRef.current = selectedClan;

  useEffect(() => { loadClans(); }, []);
  useEffect(() => { if (chatMessages.length > 0) chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages.length]);

  const loadClans = async () => {
    setLoadingClans(true);
    try { const data = await fetch("/api/clans").then(r => r.json()); setClans(data.clans || []); } catch {}
    setLoadingClans(false);
  };

  const addMessages = useCallback((msgs: WorldChatMsg[]) => {
    if (!msgs.length) return;
    const newMsgs = msgs.filter(m => !seenIdsRef.current.has(m._id));
    if (!newMsgs.length) return;
    newMsgs.forEach(m => seenIdsRef.current.add(m._id));
    setChatMessages(prev => {
      const merged = [...prev, ...newMsgs];
      merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return merged;
    });
    const last = newMsgs[newMsgs.length - 1];
    lastMsgTimeRef.current = last.createdAt;
  }, []);

  const pollChat = useCallback(async () => {
    const clan = selectedClanRef.current;
    if (!clan) return;
    const since = lastMsgTimeRef.current;
    const url = since ? `/api/clans/${clan._id}/chat?since=${encodeURIComponent(since)}` : `/api/clans/${clan._id}/chat`;
    try {
      const data = await fetch(url, { credentials: "include" }).then(r => r.json());
      if (data.messages?.length) addMessages(data.messages);
    } catch {}
  }, [addMessages]);

  useEffect(() => {
    if (!selectedClan) return;
    const id = setInterval(pollChat, 3000);
    return () => clearInterval(id);
  }, [selectedClan, pollChat]);

  const openClan = async (clan: Clan) => {
    setSelectedClan(clan);
    setChatMessages([]);
    lastMsgTimeRef.current = null;
    seenIdsRef.current = new Set();
    setActiveView("chat");
    try {
      const [clanRes, chatRes] = await Promise.all([
        fetch(`/api/clans/${clan._id}`, { credentials: "include" }).then(r => r.json()),
        fetch(`/api/clans/${clan._id}/chat`, { credentials: "include" }).then(r => r.json()),
      ]);
      setClanMembers(clanRes.members || []);
      if (chatRes.messages?.length) addMessages(chatRes.messages);
    } catch {}
  };

  const handleJoin = async (clanId: string) => {
    setJoiningId(clanId);
    await fetch(`/api/clans/${clanId}/join`, { method: "POST", credentials: "include" });
    await loadClans();
    setJoiningId(null);
  };

  const handleLeave = async () => {
    if (!selectedClan) return;
    await fetch(`/api/clans/${selectedClan._id}/leave`, { method: "POST", credentials: "include" });
    setSelectedClan(null);
    await loadClans();
  };

  const handleSendChat = async (text?: string) => {
    const msg = text || chatText;
    if (!msg.trim() || !selectedClan) return;
    setSendingChat(true);
    setChatText("");
    const res = await fetch(`/api/clans/${selectedClan._id}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ content: msg }),
    });
    const data = await res.json();
    if (data.message) addMessages([data.message]);
    setSendingChat(false);
  };

  const handleCreateClan = async () => {
    if (!createForm.name.trim()) { setCreateError("Name is required"); return; }
    setCreating(true); setCreateError("");
    const res = await fetch("/api/clans", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(createForm) });
    const data = await res.json();
    if (data.clan) { setShowCreate(false); setCreateForm({ name: "", description: "", logo: "" }); await loadClans(); }
    else setCreateError(data.error || "Failed to create clan");
    setCreating(false);
  };

  const myId = user?.id || user?._id || "";
  const isMember = selectedClan ? (selectedClan.members || []).includes(myId) : false;
  const isOwner = selectedClan ? selectedClan.ownerId === myId : false;

  if (selectedClan) {
    return (
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222] bg-black flex-shrink-0">
          <button onClick={() => setSelectedClan(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <ClanLogo src={selectedClan.logo} name={selectedClan.name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{selectedClan.name}</p>
            <p className="text-gray-500 text-xs">{selectedClan.members?.length || 0} members</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveView(v => v === "chat" ? "members" : "chat")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              {activeView === "chat" ? <Users size={18} className="text-gray-400" /> : <ChatCircle size={18} className="text-gray-400" />}
            </button>
            {!isOwner && isMember && <button onClick={handleLeave} className="p-2 hover:bg-white/10 rounded-full transition-colors"><SignOut size={18} className="text-red-400" /></button>}
          </div>
        </div>

        {activeView === "members" ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {clanMembers.map((m: any) => (
              <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                <div className="relative"><Avatar src={m.profileImage} name={m.name} size={40} />{m.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><p className="text-white font-semibold text-sm truncate">{m.name}</p>{selectedClan.ownerId === m._id && <Crown size={12} className="text-amber-400 flex-shrink-0" />}</div>
                  <p className="text-gray-500 text-xs truncate">@{m.username}</p>
                </div>
                {m.isOnline && <span className="text-green-400 text-[10px] font-semibold flex-shrink-0">Online</span>}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "linear-gradient(145deg,#0f0c29 0%,#302b63 55%,#24243e 100%)" }}>
              {chatMessages.map(msg => {
                const isMe = msg.senderId === myId;
                return (
                  <div key={msg._id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMe && <Avatar src={msg.senderImage} name={msg.senderName} size={30} />}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      {!isMe && <span className="text-xs text-gray-400 px-1">{msg.senderName}</span>}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"}`}>
                        <Linkify text={msg.content} />
                      </div>
                      <span className="text-[10px] text-gray-600 px-1">{timeAgo(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            {isMember ? (
              <div className="px-3 py-2 border-t border-[#222] bg-black flex-shrink-0">
                {showStickerPicker && (
                  <div className="mb-2">
                    <StickerPicker onSelectSticker={v => { handleSendChat(v); setShowStickerPicker(false); }} onSelectEmoji={e => { setChatText(t => t + e); }} onClose={() => setShowStickerPicker(false)} />
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"><Smiley size={22} /></button>
                  <textarea value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    placeholder="Message the clan…" rows={1} className="flex-1 bg-[#111] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-white/30 transition-colors" style={{ maxHeight: 120 }} />
                  <button onClick={() => handleSendChat()} disabled={sendingChat || !chatText.trim()} className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
                    {sendingChat ? <SpinnerGap size={18} className="animate-spin text-white" /> : <PaperPlaneTilt size={18} className="text-white" weight="fill" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-[#222] bg-black text-center flex-shrink-0">
                <button onClick={() => handleJoin(selectedClan._id)} disabled={!!joiningId} className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors">
                  {joiningId === selectedClan._id ? <SpinnerGap size={16} className="animate-spin inline" /> : "Join Clan to Chat"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-12 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center"><Shield size={20} className="text-white" /></div>
            <div><h1 className="text-2xl font-bold text-white">Clans</h1><p className="text-gray-400 text-xs">Find your crew</p></div>
          </div>
          {user && <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"><Plus size={16} weight="bold" />Create</button>}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-[#111] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="text-white font-bold">Create a Clan</h2><button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400 hover:text-white" /></button></div>
              <div className="space-y-3">
                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Clan name" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" />
                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors resize-none" />
                {createError && <p className="text-red-400 text-sm">{createError}</p>}
                <button onClick={handleCreateClan} disabled={creating} className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {creating ? <SpinnerGap size={16} className="animate-spin" /> : null}Create Clan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingClans ? (
          <div className="flex items-center justify-center py-16"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>
        ) : clans.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No clans yet. Create the first one!</div>
        ) : (
          <div className="space-y-3">
            {clans.map(clan => {
              const isMem = (clan.members || []).includes(myId);
              return (
                <div key={clan._id} onClick={() => openClan(clan)} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-white/20 bg-[#0a0a0a] cursor-pointer transition-all hover:bg-[#111]">
                  <ClanLogo src={clan.logo} name={clan.name} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-bold truncate">{clan.name}</p>
                      {isMem && <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded-full flex-shrink-0">Member</span>}
                    </div>
                    {clan.description && <p className="text-gray-500 text-xs truncate mb-1">{clan.description}</p>}
                    <p className="text-gray-600 text-xs">{clan.members?.length || 0} members</p>
                  </div>
                  {!isMem && user && (
                    <button onClick={e => { e.stopPropagation(); handleJoin(clan._id); }} disabled={joiningId === clan._id}
                      className="px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold hover:bg-white/10 disabled:opacity-50 transition-colors flex-shrink-0">
                      {joiningId === clan._id ? <SpinnerGap size={12} className="animate-spin inline" /> : "Join"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
