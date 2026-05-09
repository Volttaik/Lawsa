import { useState, useEffect } from "react";
import { Bell, Heart, ChatCircle, UserPlus, ArrowsClockwise, Star, SpinnerGap } from "@phosphor-icons/react";
import { Link } from "wouter";
import { timeAgo } from "@/lib/utils";
import { useSession } from "@/components/SessionProvider";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

const ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  like:     { icon: Heart,           color: "text-red-400",    bg: "bg-red-900/30" },
  comment:  { icon: ChatCircle,      color: "text-blue-400",   bg: "bg-blue-900/30" },
  follow:   { icon: UserPlus,        color: "text-green-400",  bg: "bg-green-900/30" },
  repost:   { icon: ArrowsClockwise, color: "text-green-400",  bg: "bg-green-900/30" },
  mention:  { icon: Bell,            color: "text-yellow-400", bg: "bg-yellow-900/30" },
  boost:    { icon: Star,            color: "text-purple-400", bg: "bg-purple-900/30" },
};

export default function NotificationsPage() {
  const { user } = useSession();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications?limit=50", { credentials: "include" });
        const data = await res.json();
        setNotifs(data.notifications || []);
        fetch("/api/notifications/read", { method: "POST", credentials: "include" }).catch(() => {});
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="max-w-[600px] mx-auto min-h-screen border-x border-[#2f3336]">
      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#2f3336] px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-gray-600 text-sm mt-1">When someone likes or replies to your posts, you'll see it here</p>
        </div>
      ) : (
        <div className="divide-y divide-[#2f3336]">
          {notifs.map(n => {
            const meta = ICONS[n.type] || ICONS.mention;
            const Icon = meta.icon;
            return (
              <div key={n._id || n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors ${!n.read ? "bg-blue-950/10" : ""}`}>
                <div className="relative flex-shrink-0">
                  <Avatar src={n.senderImage} name={n.senderName || "?"} size={44} />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${meta.bg}`}>
                    <Icon size={11} weight="fill" className={meta.color} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm"><span className="font-bold">{n.senderName}</span> {n.message || n.type}</p>
                  {n.postId && <Link href="/dashboard" className="text-gray-500 text-xs hover:text-gray-300 transition-colors mt-0.5 block truncate">View post</Link>}
                  <p className="text-gray-600 text-xs mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
