"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, UserPlus, Share2, Bell, Loader2 } from "lucide-react";
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
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

const typeIcons: Record<string, any> = {
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-50" },
  comment: { icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
  follow: { icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
  reshare: { icon: Share2, color: "text-purple-600", bg: "bg-purple-50" },
  reply: { icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated with your activity</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead}
            className="text-sm text-blue-600 font-medium hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-black/10 shadow-card p-14 text-center">
          <Bell className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 text-sm">No notifications yet. Interact with posts to see them here!</p>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
          {notifications.map((notif) => {
            const typeInfo = typeIcons[notif.type] || { icon: Bell, color: "text-gray-500", bg: "bg-gray-50" };
            const TypeIcon = typeInfo.icon;
            return (
              <motion.div
                key={notif._id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                className={`bg-white rounded-2xl border border-black/10 shadow-card p-4 flex items-start gap-3 transition-all ${!notif.read ? "border-blue-100 bg-blue-50/30" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={notif.senderImage} name={notif.senderName} size={42} />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${typeInfo.bg} flex items-center justify-center border border-white`}>
                    <TypeIcon size={10} className={typeInfo.color} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{notif.senderName}</span>{" "}
                    {notif.message?.replace(notif.senderName, "") || "interacted with you"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
