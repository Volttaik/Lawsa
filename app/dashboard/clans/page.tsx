"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cache } from "@/lib/cache";
import {
  ShieldStar,
  Plus,
  Users,
  PaperPlaneTilt,
  SpinnerGap,
  X,
  ArrowLeft,
  Crown,
  SignOut,
  Check,
  ChatCircle,
  ShareNetwork,
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
  { id: "dots",     bgColor: "#0f172a", imgValue: "radial-gradient(circle,#3b82f6 1.2px,transparent 1.2px)", bgSize: "18px 18px" },
  { id: "custom",   bgColor: "#0f0c29", imgValue: null, isCustom: true },
] as const;

interface Clan {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  members: string[];
  createdAt: string;
}

interface ClanMember {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  isOnline: boolean;
}

interface WorldChatMsg {
  _id: string;
  clanId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderImage?: string;
  content: string;
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  clanId?: string;
  clanName?: string;
  clanLogo?: string;
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <img src="/logo.jpg" alt="Sosa" className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
}

function ClanLogo({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      <img src="/logo.jpg" alt="Sosa" className="w-full h-full rounded-2xl object-cover" />
    </div>
  );
}

export default function ClansPage() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", logo: "", logoPreview: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<WorldChatMsg[]>([]);
  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [activeView, setActiveView] = useState<"members" | "chat">("chat");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [lastMsgTime, setLastMsgTime] = useState<string | null>(null);
  const [clanShareCopied, setClanShareCopied] = useState(false);
  const [chatBg, setChatBg] = useState<typeof CHAT_BACKGROUNDS[number]>(CHAT_BACKGROUNDS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  const handleShareClan = (clan: Clan) => {
    const text = `Join ${clan.name} on Sosa!\n${window.location.origin}/dashboard/clans`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setClanShareCopied(true);
    setTimeout(() => setClanShareCopied(false), 2200);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedClanRef = useRef<Clan | null>(null);
  selectedClanRef.current = selectedClan;

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = cache.get<{ clans: any[]; user: any }>("clans:initial");
      if (cached) {
        setClans(cached.clans || []);
        setCurrentUser(cached.user || null);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    const [clansRes, meRes] = await Promise.all([
      fetch("/api/clans").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    cache.set("clans:initial", { clans: clansRes.clans || [], user: meRes.user || null }, 120);
    setClans(clansRes.clans || []);
    setCurrentUser(meRes.user || null);
    setLoading(false);
  };

  useEffect(() => {
    try {
      const savedId = localStorage.getItem("chatBgId");
      const savedCustomUrl = localStorage.getItem("chatBgCustomUrl");
      if (savedId === "custom" && savedCustomUrl) {
        setCustomBgUrl(savedCustomUrl);
        setChatBg(CHAT_BACKGROUNDS[CHAT_BACKGROUNDS.length - 1]);
      } else if (savedId) {
        const bg = CHAT_BACKGROUNDS.find((b) => b.id === savedId);
        if (bg) setChatBg(bg as typeof CHAT_BACKGROUNDS[0]);
      }
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadData(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

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
      const data = await fetch(url).then((r) => r.json());
      if (data.messages?.length) {
        setChatMessages((prev) => [...prev, ...data.messages]);
        setLastMsgTime(data.messages[data.messages.length - 1].createdAt);
      }
      if (typeof data.onlineCount === "number") setOnlineCount(data.onlineCount);
      if (data.onlineMembers) setOnlineMembers(data.onlineMembers);
    } catch {}
  }, [lastMsgTime]);

  useEffect(() => {
    if (selectedClan) {
      chatPollRef.current = setInterval(pollChat, 4000);
    }
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [selectedClan, pollChat]);

  const openClan = async (clan: Clan) => {
    setSelectedClan(clan);
    setChatMessages([]);
    setLastMsgTime(null);
    const res = await fetch(`/api/clans/${clan._id}`);
    const data = await res.json();
    setClanMembers(data.members || []);
    const chatRes = await fetch(`/api/clans/${clan._id}/chat`);
    const chatData = await chatRes.json();
    setChatMessages(chatData.messages || []);
    setOnlineCount(chatData.onlineCount || 0);
    setOnlineMembers(chatData.onlineMembers || []);
    if (chatData.messages?.length) {
      setLastMsgTime(chatData.messages[chatData.messages.length - 1].createdAt);
    }
  };

  const handleJoin = async (clanId: string) => {
    setJoiningId(clanId);
    const res = await fetch(`/api/clans/${clanId}/join`, { method: "POST" });
    const data = await res.json();
    if (!data.error) {
      await loadData();
      if (selectedClan?._id === clanId) {
        const clanRes = await fetch(`/api/clans/${clanId}`);
        const clanData = await clanRes.json();
        setClanMembers(clanData.members || []);
        setSelectedClan(clanData.clan);
      }
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
      setChatMessages((prev) => [...prev, data.message]);
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
    setCreateForm((f) => ({ ...f, logoPreview: blobUrl, logo: "" }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "clans");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setCreateForm((f) => ({ ...f, logo: url }));
    } catch {
      URL.revokeObjectURL(blobUrl);
      setCreateForm((f) => ({ ...f, logoPreview: "", logo: "" }));
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
      cache.invalidate("clans:");
      await loadData(true);
    } else {
      setCreateError(data.error || "Failed to create clan");
    }
    setCreating(false);
  };

  const isMember = (clan: Clan) => clan.members.includes(currentUser?._id || "");
  const isInAnyClan = !!currentUser?.clanId;

  if (loading) {
    return <div className="flex justify-center py-20"><SpinnerGap className="animate-spin text-blue-600" size={28} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
            <ShieldStar size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clans</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Join a community or create your own</p>
          </div>
        </div>
        {!isInAnyClan && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-btn"
          >
            <Plus size={15} /> Create
          </motion.button>
        )}
      </div>

      {/* Current clan badge */}
      {currentUser?.clanId && (
        <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-[2px] p-4 flex items-center gap-3">
          <ClanLogo src={currentUser.clanLogo} name={currentUser.clanName || ""} size={44} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Your Clan</p>
            <p className="font-bold text-gray-900 dark:text-white">{currentUser.clanName}</p>
          </div>
          <button
            onClick={() => {
              const clan = clans.find((c) => c._id === currentUser.clanId);
              if (clan) openClan(clan);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <ChatCircle size={12} /> Open
          </button>
        </div>
      )}

      {/* Clans list */}
      {clans.length === 0 ? (
        <div className="bg-transparent border-b border-black/8 dark:border-white/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <ShieldStar size={24} className="text-indigo-500" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">No clans yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Be the first to create one!</p>
          {!isInAnyClan && (
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all">
              <Plus size={15} /> Create a Clan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {clans.map((clan, i) => (
            <motion.div
              key={clan._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-transparent border-b border-black/8 dark:border-white/10 p-4"
            >
              <div className="flex items-center gap-3">
                <ClanLogo src={clan.logo} name={clan.name} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{clan.name}</h3>
                    {clan.ownerId === currentUser?._id && (
                      <span className="flex items-center gap-0.5 text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800/50">
                        <Crown size={9} /> Owner
                      </span>
                    )}
                  </div>
                  {clan.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{clan.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <Users size={11} />
                    <span>{clan.members.length} member{clan.members.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isMember(clan) && (
                    <button
                      onClick={() => openClan(clan)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      <ChatCircle size={11} /> Chat
                    </button>
                  )}
                  {!isMember(clan) && !isInAnyClan && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoin(clan._id)}
                      disabled={joiningId === clan._id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-60"
                    >
                      {joiningId === clan._id ? <SpinnerGap size={11} className="animate-spin" /> : <Plus size={11} />}
                      Join
                    </motion.button>
                  )}
                  {isMember(clan) && clan.ownerId !== currentUser?._id && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoin(clan._id)}
                      disabled={joiningId === clan._id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-all disabled:opacity-60"
                    >
                      {joiningId === clan._id ? <SpinnerGap size={11} className="animate-spin" /> : <SignOut size={11} />}
                      Leave
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create clan modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="bg-white dark:bg-gray-900 rounded-[2px] p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Create a Clan</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>

              {createError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl p-3 mb-4">
                  {createError}
                </div>
              )}

              {/* Logo preview */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                  {(createForm.logoPreview || createForm.logo)
                    ? <img src={createForm.logoPreview || createForm.logo} alt="" className="w-full h-full object-cover" />
                    : <ShieldStar size={24} className="text-indigo-400" />
                  }
                </div>
                <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleCreateLogoChange} />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Clan Name *</label>
                  <input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. The Code Warriors"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What is this clan about?"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleCreateClan}
                disabled={creating || !createForm.name.trim()}
                className="w-full mt-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
              >
                {creating ? <SpinnerGap size={15} className="animate-spin" /> : <ShieldStar size={15} />}
                Create Clan
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clan World Chat overlay */}
      <AnimatePresence>
        {selectedClan && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ backgroundColor: chatBg.bgColor }}
          >
            {/* Chat Header — matches messages page */}
            <div
              className="flex-shrink-0 flex items-center gap-3 px-4 bg-white/10 backdrop-blur-xl border-b border-white/10"
              style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
            >
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedClan(null)}
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0">
                <ArrowLeft size={20} />
              </motion.button>
              <ClanLogo src={selectedClan.logo} name={selectedClan.name} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{selectedClan.name}</div>
                <div className="text-[10px] text-blue-300 font-medium">
                  {onlineCount > 0 ? `${onlineCount} online` : `${selectedClan.members.length} members`}
                </div>
              </div>
              {/* Share clan */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleShareClan(selectedClan)}
                className={`w-9 h-9 flex-shrink-0 rounded-[8px] flex items-center justify-center transition-colors ${clanShareCopied ? "bg-green-500/30 text-green-400" : "text-white/70 hover:bg-white/10"}`}
              >
                {clanShareCopied ? <Check size={16} /> : <ShareNetwork size={16} />}
              </motion.button>

              {/* Tab buttons */}
              <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setActiveView("chat")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeView === "chat" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveView("members")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeView === "members" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"}`}
                >
                  Members
                </button>
              </div>
            </div>

            {/* Members View */}
            {activeView === "members" && (
              <div
                className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2"
                style={{
                  backgroundColor: chatBg.bgColor,
                  backgroundImage: (chatBg as any).isCustom && customBgUrl ? `url(${customBgUrl})` : (chatBg.imgValue ?? undefined),
                  backgroundSize: (chatBg as any).isCustom && customBgUrl ? "cover" : ((chatBg as any).bgSize ?? (chatBg.imgValue ? "cover" : undefined)),
                  backgroundPosition: "center",
                }}
              >
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1 mb-3">
                  {onlineCount} Online · {selectedClan.members.length} Total
                </p>
                {clanMembers.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="relative flex-shrink-0">
                      <Avatar src={member.profileImage} name={member.name} size={40} />
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-black/30 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        {member.name}
                        {member._id === selectedClan.ownerId && (
                          <Crown size={11} className="text-yellow-400" />
                        )}
                      </div>
                      <div className="text-xs text-white/50">@{member.username}</div>
                    </div>
                    <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      member.isOnline
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" :"bg-white/10 text-white/30 border border-white/10"
                    }`}>
                      {member.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat View */}
            {activeView === "chat" && (
              <>
                <div
                  className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-2"
                  style={{
                    backgroundColor: chatBg.bgColor,
                    backgroundImage: (chatBg as any).isCustom && customBgUrl ? `url(${customBgUrl})` : (chatBg.imgValue ?? undefined),
                    backgroundSize: (chatBg as any).isCustom && customBgUrl ? "cover" : ((chatBg as any).bgSize ?? (chatBg.imgValue ? "cover" : undefined)),
                    backgroundPosition: "center",
                  }}
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-center">
                      <div className="w-14 h-14 rounded-[8px] bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_2px_12px_0_rgba(0,0,0,0.2)]">
                        <ChatCircle size={24} className="text-white/80" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm drop-shadow">Welcome to {selectedClan.name}!</p>
                        <p className="text-xs text-white/50 mt-0.5">Be the first to say something</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser?._id;
                      return (
                        <motion.div
                          key={msg._id}
                          initial={isMe ? { opacity: 0, x: 16, scale: 0.93 } : { opacity: 0, x: -16, scale: 0.93 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ duration: 0.2, ease: [0.34, 1.2, 0.64, 1] }}
                          className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          {!isMe && <Avatar src={msg.senderImage} name={msg.senderName} size={28} />}
                          <div className={`max-w-[76%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && (
                              <span className="text-[10px] text-white/50 font-medium px-1 mb-0.5 truncate max-w-full">{msg.senderName}</span>
                            )}
                            <div className={`px-3 py-2 text-sm leading-relaxed rounded-[6px] ${
                              isMe
                                ? "bg-blue-600 text-white shadow-[0_2px_8px_0_rgba(37,99,235,0.3)]"
                                : "bg-white text-gray-900 border border-black/8 shadow-[0_1px_6px_0_rgba(0,0,0,0.12)]"
                            }`}>
                              <Linkify
                                text={msg.content}
                                linkClass={isMe ? "text-blue-200 hover:underline break-all" : "text-blue-600 hover:underline break-all"}
                              />
                            </div>
                            <span className="text-[9px] text-white/30 mt-0.5 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input — matches messages page */}
                <div className="flex-shrink-0 px-3 py-3 bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center gap-2"
                  style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    placeholder="Message the clan..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                    onClick={handleSendChat}
                    disabled={sendingChat || !chatText.trim()}
                    className="w-9 h-9 bg-blue-600 text-white rounded-[8px] flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50 flex-shrink-0 shadow-[0_2px_6px_0_rgba(37,99,235,0.3)]"
                  >
                    {sendingChat ? <SpinnerGap size={15} className="animate-spin" /> : <PaperPlaneTilt size={15} />}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
