"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex-shrink-0">
            <Logo size={28} textClass="font-bold text-sm text-gray-900 dark:text-white hidden sm:block" />
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search people, posts..."
                className="w-full pl-8 pr-4 py-1.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) router.push(`/dashboard/connect?search=${encodeURIComponent(val)}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link href="/dashboard/notifications" onClick={() => setNotifCount(0)}
              className="relative w-8 h-8 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-all shadow-soft">
              <Bell size={16} />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none animate-pop-in">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
            <Link href="/dashboard/settings" className="relative w-8 h-8 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-all shadow-soft">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
            {user && (
              <Link href={`/dashboard/profile/${userId}`} className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0">
                <Avatar src={user.profileImage} name={user.name} size={32} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content — no AnimatePresence wrapper so pages render instantly */}
      <main className="pt-12 pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-black/10 dark:border-white/10 shadow-soft">
        <div className="max-w-md mx-auto px-1 h-14 flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = label === "Profile"
              ? pathname.includes("/profile/")
              : label === "Connect"
              ? pathname.includes("/connect")
              : pathname === href;

            return (
              <Link key={label} href={href}>
                <div className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}>
                  {label === "Post" ? (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? "bg-blue-600" : "bg-gray-100 dark:bg-gray-800 hover:bg-blue-50"}`}>
                      <Icon size={17} className={isActive ? "text-white" : "text-gray-600 dark:text-gray-300"} />
                    </div>
                  ) : label === "Profile" && user ? (
                    <>
                      <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all duration-200 ${isActive ? "border-blue-600" : "border-transparent"}`}>
                        <Avatar src={user.profileImage} name={user.name} size={24} />
                      </div>
                      <span className="text-[10px] font-medium">{label}</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon size={18} />
                        {label === "Chats" && notifCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-[10px] font-medium">{label}</span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
