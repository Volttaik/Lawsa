"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChatCircle, UserPlus, ShareNetwork, Bell, Check, Trash, ArrowsClockwise } from "@phosphor-icons/react";
import Link from "next/link";

interface Notification {
  _id: string;
  id: string;
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
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600","bg-amber-600","bg-cyan-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>
      {initials}
    </div>
  );
}

const typeIcons: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  like:    { icon: Heart,        color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/30",      label: "liked your post"         },
  comment: { icon: ChatCircle,   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/30",    label: "commented on your post"  },
  follow:  { icon: UserPlus,     color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/30",  label: "started following you"   },
  reshare: { icon: ShareNetwork, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30",label: "reposted your post"      },
  reply:   { icon: ChatCircle,   color: "text-sky-500",    bg: "bg-sky-50 dark:bg-sky-900/30",      label: "replied to your comment" },
  reaction:{ icon: Heart,        color: "text-pink-500",   bg: "bg-pink-50 dark:bg-pink-900/30",    label: "reacted to your post"    },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function NotifClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {}
    setRefreshing(false);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
  };

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => {});
  };

  const deleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n._id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="text-white" size={22} weight="fill" />
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Refresh">
              <ArrowsClockwise size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-blue-400 font-semibold hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors">
                <Check size={14} weight="bold" /> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-0">
        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-600" size={28} />
            </div>
            <p className="font-semibold text-gray-300 mb-1">No notifications yet</p>
            <p className="text-gray-600 text-sm">Interact with posts to see activity here.</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notif) => {
              const typeInfo = typeIcons[notif.type] || { icon: Bell, color: "text-gray-400", bg: "bg-gray-800", label: "interacted with you" };
              const TypeIcon = typeInfo.icon;
              const isUnread = !notif.read;
              const msgText = notif.message
                ? notif.message.replace(notif.senderName, "").trim()
                : typeInfo.label;

              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => isUnread && markOneRead(notif._id)}
                  className={`relative flex items-start gap-3 px-4 py-4 border-b border-white/[0.08] cursor-pointer group transition-colors
                    ${isUnread ? "bg-blue-950/20 hover:bg-blue-950/30" : "hover:bg-white/[0.03]"}`}
                >
                  {isUnread && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-r" />}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <Link href={`/dashboard/profile/${notif.senderId}`} onClick={e => e.stopPropagation()}>
                      <Avatar src={notif.senderImage} name={notif.senderName} size={44} />
                    </Link>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${typeInfo.bg} flex items-center justify-center border-2 border-black`}>
                      <TypeIcon size={10} className={typeInfo.color} weight="fill" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-snug">
                      <Link href={`/dashboard/profile/${notif.senderId}`} className="font-semibold text-white hover:text-blue-400 transition-colors" onClick={e => e.stopPropagation()}>
                        {notif.senderName}
                      </Link>
                      {" "}{msgText}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.createdAt)}</p>
                    {notif.postId && (
                      <Link href={`/post/${notif.postId}`} className="inline-block mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors" onClick={e => e.stopPropagation()}>
                        View post →
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <button onClick={(e) => { e.stopPropagation(); markOneRead(notif._id); }} className="p-1.5 rounded-full hover:bg-blue-500/20 text-blue-400 transition-colors" title="Mark as read">
                        <Check size={14} weight="bold" />
                      </button>
                    )}
                    <button onClick={(e) => deleteOne(notif._id, e)} className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors" title="Delete">
                      <Trash size={14} />
                    </button>
                  </div>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
