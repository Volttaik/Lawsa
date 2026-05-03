"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ChatCircle, UserPlus, ShareNetwork, Bell, SpinnerGap, Check
} from "@phosphor-icons/react";
import Link from "next/link";

interface Notification {
  _id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  type: string;
  message?: string;
  postId?: string;
  read?: boolean;
  createdAt: string;
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

const typeIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  like:    { icon: Heart,         color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/30"       },
  comment: { icon: ChatCircle,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/30"     },
  follow:  { icon: UserPlus,      color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/30"   },
  reshare: { icon: ShareNetwork,  color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30" },
  reply:   { icon: ChatCircle,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/30"     },
  message: { icon: ChatCircle,    color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-900/30"     },
};

const POLL_MS = 20_000;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(() => fetchNotifications(true), POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifications]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", credentials: "include" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Check size={14} weight="bold" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <SpinnerGap size={28} className="animate-spin text-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-transparent border-b border-black/8 dark:border-white/10 p-14 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Bell size={26} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet. Interact with posts to see activity here.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-2"
          >
            {notifications.map(notif => {
              const typeInfo = typeIcons[notif.type] || { icon: Bell, color: "text-gray-500", bg: "bg-gray-50" };
              const TypeIcon = typeInfo.icon;
              return (
                <motion.div
                  key={notif._id}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => !notif.read && markOneRead(notif._id)}
                  className={`border-b border-black/8 dark:border-white/10 p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.03] ${
                    !notif.read
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10" :"bg-white dark:bg-gray-900"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Link href={`/dashboard/profile/${notif.senderId}`} onClick={e => e.stopPropagation()}>
                      <Avatar src={notif.senderImage} name={notif.senderName} size={44} />
                    </Link>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${typeInfo.bg} flex items-center justify-center border-2 border-white dark:border-gray-900`}>
                      <TypeIcon size={10} weight="fill" className={typeInfo.color} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                      <Link
                        href={`/dashboard/profile/${notif.senderId}`}
                        className="font-semibold hover:text-blue-600 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {notif.senderName}
                      </Link>{" "}
                      {notif.message?.replace(notif.senderName, "").trim() || "interacted with you"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(notif.createdAt).toLocaleDateString("en", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
