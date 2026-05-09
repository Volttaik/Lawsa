"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Users, PaperPlaneTilt, SpinnerGap, X, ArrowLeft,
  Crown, SignOut, Trash, Check, ChatCircle, ShareNetwork, Smiley, Lock,
} from "@phosphor-icons/react";
import Linkify from "@/components/Linkify";

const CHAT_BACKGROUNDS = [
  { id: "midnight", bgColor: "#0f0c29", imgValue: "linear-gradient(145deg,#0f0c29 0%,#302b63 55%,#24243e 100%)" },
  { id: "galaxy",   bgColor: "#0d1b2a", imgValue: "linear-gradient(160deg,#0d1b2a 0%,#162032 45%,#0f3460 100%)" },
  { id: "noir",     bgColor: "#111827", imgValue: "linear-gradient(140deg,#111827 0%,#1f2937 100%)" },
  { id: "ocean",    bgColor: "#004e92", imgValue: "linear-gradient(155deg,#004e92 0%,#000428 100%)" },
  { id: "sunset",   bgColor: "#f7971e", imgValue: "linear-gradient(135deg,#f7971e 0%,#e84393 50%,#8b5cf6 100%)" },
  { id: "forest",   bgColor: "#0a3d2b", imgValue: "linear-gradient(145deg,#0a3d2b 0%,#1a6b47 55%,#2d9966 100%)" },
  { id: "rose",     bgColor: "#c0392b", imgValue: "linear-gradient(145deg,#c0392b 0%,#e91e8c 55%,#f093fb 100%)" },
  { id: "minimal",  bgColor: "#e8edf2", imgValue: "linear-gradient(160deg,#e8edf2 0%,#d1d9e0 100%)" },
] as const;

interface Clan {
  _id: string; name: string; slug: string; logo?: string;
  description?: string; ownerId: string; ownerName: string;
  members: string[]; createdAt: string;
}
interface ClanMember { _id: string; name: string; username: string; profileImage?: string; isOnline: boolean; }
interface WorldChatMsg {
  _id: string; clanId: string; senderId: string; senderName: string;
  senderUsername: string; senderImage?: string; content: string; createdAt: string;
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
  const [lastMsgTime, setLastMsgTime] = useState<string | null>(null);
  const [chatBg] = useState(CHAT_BACKGROUNDS[0]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const selectedClanRef = useRef<Clan | null>(null);
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

  const pollChat = useCallback(async () => {
    const clan = selectedClanRef.current;
    if (!clan) return;
    const url = lastMsgTime
      ? `/api/clans/${clan._id}/chat?since=${encodeURIComponent(lastMsgTime)}`
      : `/api/clans/${clan._id}/chat`;
    try {
      const data = await fetch(url).then(r => r.json());
      if (data.messages?.length) {
        setChatMessages(prev => [...prev, ...data.messages]);
        setLastMsgTime(data.messages[data.messages.length - 1].createdAt);
      }
    } catch {}
  }, [lastMsgTime]);

  useEffect(() => {
    if (!selectedClan) return;
    const id = setInterval(pollChat, 3000);
    return () => clearInterval(id);
  }, [selectedClan, pollChat]);

  const openClan = async (clan: Clan) => {
    setSelectedClan(clan);
    setChatMessages([]);
    setLastMsgTime(null);
    setActiveView("chat");
    const [clanRes, chatRes] = await Promise.all([
      fetch(`/api/clans/${clan._id}`).then(r => r.json()),
      fetch(`/api/clans/${clan._id}/chat`).then(r => r.json()),
    ]);
    setClanMembers(clanRes.members || []);
    setChatMessages(chatRes.messages || []);
    if (chatRes.messages?.length) setLastMsgTime(chatRes.messages[chatRes.messages.length - 1].createdAt);
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

  const handleSendChat = async () => {
    if (!chatText.trim() || !selectedClan) return;
    setSendingChat(true);
    const res = await fetch(`/api/clans/${selectedClan._id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: chatText }),
    });
    const data = await res.json();
    if (data.message) {
      setChatMessages(prev => [...prev, data.message]);
      setChatText("");
      setLastMsgTime(data.message.createdAt);
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

      <AnimatePresence>
        {selectedClan && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: chatBg.bgColor, backgroundImage: chatBg.imgValue }}>
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur border-b border-white/10">
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
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  {chatMessages.length === 0
                    ? <div className="flex items-center justify-center h-full"><p className="text-white/40 text-sm">No messages yet. Say something!</p></div>
                    : chatMessages.map(msg => {
                        const isMine = msg.senderId === uid;
                        return (
                          <div key={msg._id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                            {!isMine && <Avatar src={msg.senderImage} name={msg.senderName} size={26} />}
                            <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-white ${isMine ? "rounded-br-sm" : "rounded-bl-sm"}`}
                              style={{ backgroundColor: isMine ? "#000000" : "#111111" }}>
                              {!isMine && <p className="text-[11px] font-semibold text-indigo-300 mb-0.5">{msg.senderName}</p>}
                              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className="text-[10px] mt-0.5 text-white/40 text-right">{timeAgo(msg.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })
                  }
                  <div ref={chatEndRef} />
                </div>
                {isMember(selectedClan) && (
                  <div className="flex-shrink-0 border-t border-white/10" style={{ backgroundColor: "#000" }}>
                    {showStickerPicker && (
                      <div className="px-3 pt-2 pb-1">
                        <div className="flex gap-1 flex-wrap">
                          {["👋","🔥","❤️","😂","🤯","😎","👊","🎉","🙏","💪","😭","🧢","✅","🤤","🤫","🌊"].map(s => (
                            <button key={s} type="button"
                              onClick={() => { setChatText(prev => prev + s); setShowStickerPicker(false); }}
                              className="text-2xl p-1.5 rounded-xl hover:bg-white/10 transition-colors leading-none">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button type="button" onClick={() => setShowStickerPicker(v => !v)}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        style={{ color: showStickerPicker ? "#fff" : "rgba(255,255,255,0.45)" }}>
                        <Smiley size={22} />
                      </button>
                      <div className="flex-1 rounded-full px-4 py-2 flex items-center" style={{ backgroundColor: "#111" }}>
                        <input value={chatText} onChange={e => setChatText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                          placeholder="Message the clan..."
                          className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none" />
                      </div>
                      <button onClick={handleSendChat} disabled={!chatText.trim() || sendingChat}
                        className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-colors disabled:opacity-40">
                        {sendingChat ? <SpinnerGap size={16} className="animate-spin text-black" /> : <PaperPlaneTilt size={16} weight="fill" className="text-black" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {clanMembers.map(member => (
                  <div key={member._id} className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 backdrop-blur">
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
