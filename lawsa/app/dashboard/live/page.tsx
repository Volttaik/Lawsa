"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoCamera, Users, X, SpinnerGap, Plus, Broadcast, ArrowLeft,
} from "@phosphor-icons/react";

interface LiveStream {
  _id: string;
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostImage: string;
  title: string;
  viewerCount: number;
  createdAt: string;
}

function elapsed(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function StreamCard({ stream, onClick }: { stream: LiveStream; onClick: () => void }) {
  const initials = stream.hostName.slice(0, 2).toUpperCase();
  const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-pink-600", "bg-orange-600"];
  const color = colors[stream.hostName.charCodeAt(0) % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
    >
      {/* Preview area */}
      <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <VideoCamera size={40} className="text-white/20" weight="fill" />
        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
        {/* Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          <Users size={11} weight="fill" />
          {stream.viewerCount}
        </div>
        {/* Duration */}
        <div className="absolute bottom-3 right-3 text-white/60 text-xs">
          {elapsed(stream.createdAt)}
        </div>
      </div>

      {/* Host info */}
      <div className="p-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          {stream.hostImage ? (
            <img src={stream.hostImage} alt={stream.hostName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}>
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{stream.hostName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stream.title}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LivePage() {
  const router = useRouter();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStreams = async () => {
    const res = await fetch("/api/livestreams");
    const data = await res.json();
    setStreams(data.streams || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.user) setMe(d.user); });

    loadStreams();
    pollRef.current = setInterval(loadStreams, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startStream = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/livestreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: streamTitle.trim() || "Live" }),
      });
      const data = await res.json();
      if (data.stream) {
        router.push(`/dashboard/live/${data.stream._id}`);
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Broadcast size={22} weight="fill" className="text-red-500" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Live</h1>
          </div>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
        >
          <Plus size={16} weight="bold" />
          Go Live
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <SpinnerGap size={32} className="animate-spin text-gray-400" />
          </div>
        ) : streams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <Broadcast size={32} weight="fill" className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No live streams right now</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Be the first to go live and share with your followers.</p>
            </div>
            <button
              onClick={() => setShowStartModal(true)}
              className="mt-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              <VideoCamera size={18} weight="fill" />
              Start Streaming
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {streams.map((s) => (
              <StreamCard
                key={s._id}
                stream={s}
                onClick={() => router.push(`/dashboard/live/${s._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Start stream modal */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowStartModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Start a Live Stream</h2>
                <button onClick={() => setShowStartModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Stream title
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="What are you streaming about?"
                    maxLength={80}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && startStream()}
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  Your camera and microphone will be requested when the stream starts.
                </div>

                <button
                  onClick={startStream}
                  disabled={starting}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {starting ? <SpinnerGap size={18} className="animate-spin" /> : <Broadcast size={18} weight="fill" />}
                  {starting ? "Starting..." : "Go Live"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
