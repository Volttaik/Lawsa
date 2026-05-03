"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Bell, Mail, User, Users, Shield, Star, Menu, X, LogOut, BadgeCheck } from "lucide-react";

interface Me { id: string; _id?: string; name: string; username: string; profileImage?: string; isVerified?: boolean; premiumTheme?: boolean; }

function Avatar({ src, name, size = 36, gold }: { src?: string; name: string; size?: number; gold?: boolean }) {
  const ring = gold ? "ring-2 ring-amber-400" : "";
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${ring}`} style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 ${ring}`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}>
      {name?.[0]?.toUpperCase() || "S"}
    </div>
  );
}

const NAV = [
  { href: "/dashboard",                icon: Home,   label: "Home"          },
  { href: "/dashboard/explore",        icon: Search, label: "Explore"       },
  { href: "/dashboard/notifications",  icon: Bell,   label: "Notifications" },
  { href: "/dashboard/messages",       icon: Mail,   label: "Messages"      },
  { href: "/dashboard/clans",          icon: Users,  label: "Clans"         },
  { href: "/dashboard/premium",        icon: Star,   label: "Premium"       },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const heartbeat = useCallback(() => { fetch("/api/users/heartbeat", { method: "POST" }).catch(() => {}); }, []);
  const fetchCount = useCallback(() => {
    fetch("/api/notifications/count").then(r => r.json()).then(d => setNotifCount(d.count || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" }).then(r => {
      if (r.status === 401) { router.replace("/login"); return null; }
      return r.json();
    }).then(d => {
      if (d?.user) { setUser(d.user); setLoading(false); }
      else if (d) { router.replace("/login"); }
    }).catch(() => router.replace("/login"));
    heartbeat();
    fetchCount();
    const hb = setInterval(heartbeat, 60000);
    const nc = setInterval(fetchCount, 30000);
    return () => { clearInterval(hb); clearInterval(nc); };
  }, [heartbeat, fetchCount, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const uid = user?.id || user?._id || "";

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const Sidebar = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full px-3 py-4">
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <span className={`text-white font-black text-xl ${compact ? "hidden xl:block" : "block"}`}>Sosa</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotif = label === "Notifications";
          return (
            <Link key={href} href={href} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${active ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`} strokeWidth={active ? 2.5 : 2} />
                {isNotif && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{notifCount > 9 ? "9+" : notifCount}</span>
                )}
              </div>
              <span className={`${compact ? "hidden xl:block" : "block"} text-base ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}>{label}</span>
            </Link>
          );
        })}
        <Link href={`/dashboard/profile/${uid}`} onClick={() => setMobileMenu(false)}
          className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${pathname.startsWith("/dashboard/profile") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
          <User className={`w-6 h-6 ${pathname.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`} strokeWidth={pathname.startsWith("/dashboard/profile") ? 2.5 : 2} />
          <span className={`${compact ? "hidden xl:block" : "block"} text-base ${pathname.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Profile</span>
        </Link>
      </nav>

      {user && (
        <div className="mt-4 border-t border-[#222] pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#1a1a1a] cursor-pointer group">
            <Avatar src={user.profileImage} name={user.name} size={36} gold={user.premiumTheme} />
            <div className="hidden xl:block flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-white font-bold text-sm truncate">{user.name}</p>
                {user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              </div>
              <p className="text-gray-500 text-xs truncate">@{user.username}</p>
            </div>
            <button onClick={logout} className="hidden xl:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[72px] xl:w-[260px] border-r border-[#222] fixed top-0 left-0 h-screen z-30">
        <Sidebar compact />
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-[#222]">
            <button onClick={() => setMobileMenu(false)} className="absolute top-4 right-4 p-2">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-[72px] xl:ml-[260px] min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#222] sticky top-0 bg-black/95 backdrop-blur z-20">
          <button onClick={() => setMobileMenu(true)}><Menu className="w-6 h-6 text-white" /></button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <Avatar src={user?.profileImage} name={user?.name || "S"} size={30} />
        </div>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-[#222] z-30 flex items-stretch justify-around px-2 py-2">
        {[...NAV.slice(0,4), { href: `/dashboard/profile/${uid}`, icon: User, label: "Profile" }].map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotif = label === "Notifications";
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 px-2 py-1 relative min-w-0 flex-1">
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-500"}`} strokeWidth={active ? 2.5 : 2} />
                {isNotif && notifCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{notifCount > 9 ? "9+" : notifCount}</span>}
              </div>
              <span className={`text-[10px] leading-none truncate ${active ? "text-white" : "text-gray-500"}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
