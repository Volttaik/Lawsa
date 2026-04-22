"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageCircle, PlusSquare, Users, User, Bell, Loader2 } from "lucide-react";

import { Logo } from "@/components/Logo";

interface CurrentUser {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
}

function Avatar({ src, name, size = 24 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  const sendHeartbeat = useCallback(async () => {
    try { await fetch("/api/users/heartbeat", { method: "POST" }); } catch {}
  }, []);

  const fetchNotifCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count");
      const data = await res.json();
      setNotifCount(data.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.user) { setUser(data.user); }
        else { window.location.href = "/login"; }
      })
      .catch(() => { window.location.href = "/login"; })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifCount]);

  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [sendHeartbeat]);

  useEffect(() => {
    if (pathname === "/dashboard/notifications") setNotifCount(0);
  }, [pathname]);

  const userId = user?._id || user?.id || "";

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/messages", icon: MessageCircle, label: "Chats" },
    { href: "/dashboard/post", icon: PlusSquare, label: "Post" },
    { href: "/dashboard/connect", icon: Users, label: "Connect" },
    { href: `/dashboard/profile/${userId}`, icon: User, label: "Profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-white" size={20} />
          </div>
          <div className="text-xs text-gray-500 font-medium">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Top Header — flat X-style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex-shrink-0">
            <Logo size={28} textClass="font-bold text-sm text-gray-900 dark:text-white hidden sm:block" />
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-4 h-8 text-[13.5px] rounded-full border border-transparent bg-[#eff3f4] dark:bg-[#202327] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-black focus:border-blue-500 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) router.push(`/dashboard/connect?search=${encodeURIComponent(val)}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <Link href="/dashboard/notifications" onClick={() => setNotifCount(0)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-500 transition-all">
              <Bell size={17} strokeWidth={2} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none animate-pop-in ring-2 ring-white dark:ring-black">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
            <Link href="/dashboard/settings" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-500 transition-all">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
            {user && (
              <Link href={`/dashboard/profile/${userId}`} className="ml-1 w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-blue-500/40 transition-all">
                <Avatar src={user.profileImage} name={user.name} size={32} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content — animation is handled by template.tsx */}
      <main className="pt-12 pb-16" style={{ overflowX: "clip" }}>
        {children}
      </main>

      {/* Bottom Navigation — flat X-style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/10">
        <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = label === "Profile"
              ? pathname.includes("/profile/")
              : label === "Connect"
              ? pathname.includes("/connect")
              : pathname === href;

            return (
              <Link key={label} href={href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.84 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex flex-col items-center gap-0.5 py-1"
                >
                  {label === "Post" ? (
                    <motion.div
                      animate={isActive ? { scale: 1.06 } : { scale: 1 }}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-blue-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      <Icon size={20} strokeWidth={2.4} />
                    </motion.div>
                  ) : label === "Profile" && user ? (
                    <div className={`rounded-full overflow-hidden ring-2 transition-all ${isActive ? "ring-blue-500" : "ring-transparent"}`}>
                      <Avatar src={user.profileImage} name={user.name} size={26} />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isActive ? "text-blue-500" : "text-gray-600 dark:text-gray-300"}`}>
                        <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} fill={isActive ? "currentColor" : "none"} fillOpacity={isActive ? 0.12 : 0} />
                      </div>
                      {label === "Chats" && notifCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-black animate-pop-in" />
                      )}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
