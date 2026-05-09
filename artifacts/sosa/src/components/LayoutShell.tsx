import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  House, MagnifyingGlass, Bell, Envelope, User, UsersThree,
  Star, List, X, SignOut, SealCheck, Gear, Broadcast,
  PhoneDisconnect, VideoCamera, Phone, PencilSimpleLine, ShoppingBag, Sparkle,
} from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import { useSession } from "@/components/SessionProvider";
import ComposeModal from "@/components/ComposeModal";

interface IncomingCall {
  sessionId: string; callerId: string; callerName: string;
  callerImage: string; callType: "video" | "voice";
}

function Avatar({ src, name, size = 36, gold }: { src?: string; name: string; size?: number; gold?: boolean }) {
  const ring = gold ? "ring-2 ring-amber-400" : "";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${ring}`} style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color} ${ring}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

const NAV = [
  { href: "/dashboard",               icon: House,           label: "Home"          },
  { href: "/dashboard/explore",       icon: MagnifyingGlass, label: "Explore"       },
  { href: "/dashboard/notifications", icon: Bell,            label: "Notifications" },
  { href: "/dashboard/messages",      icon: Envelope,        label: "Messages"      },
  { href: "/dashboard/clans",         icon: UsersThree,      label: "Clans"         },
  { href: "/dashboard/live",          icon: Broadcast,       label: "Live"          },
  { href: "/dashboard/store",         icon: ShoppingBag,     label: "Store"         },
  { href: "/dashboard/premium",       icon: Star,            label: "Premium"       },
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useSession();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [fabVisible, setFabVisible] = useState(true);
  const lastScrollY = useRef(0);
  const dismissedRef = useRef<Set<string>>(new Set());

  const fetchCounts = useCallback(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/notifications/count", { credentials: "include" }).then(r => r.json()).catch(() => ({ count: 0 })),
      fetch("/api/messages/count", { credentials: "include" }).then(r => r.json()).catch(() => ({ count: 0 })),
    ]).then(([notif, msg]) => { setNotifCount(notif.count || 0); setMsgCount(msg.count || 0); });
  }, [user]);

  const checkCalls = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetch("/api/calls/incoming", { credentials: "include" }).then(r => r.json());
      if (data.call && !dismissedRef.current.has(data.call.sessionId)) setIncomingCall(data.call);
      else if (!data.call) setIncomingCall(null);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/users/heartbeat", { method: "POST", credentials: "include" }).catch(() => {});
    fetchCounts();
    checkCalls();
    const hb = setInterval(() => fetch("/api/users/heartbeat", { method: "POST", credentials: "include" }).catch(() => {}), 60000);
    const nc = setInterval(fetchCounts, 20000);
    const ic = setInterval(checkCalls, 8000);
    return () => { clearInterval(hb); clearInterval(nc); clearInterval(ic); };
  }, [user, fetchCounts, checkCalls]);

  useEffect(() => {
    if (location === "/dashboard/notifications") setNotifCount(0);
    else if (location === "/dashboard/messages") setMsgCount(0);
    else fetchCounts();
  }, [location, fetchCounts]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) setFabVisible(true);
      else if (y > lastScrollY.current + 8) setFabVisible(false);
      else if (y < lastScrollY.current - 8) setFabVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const uid = user?.id || user?._id || "";

  const Sidebar = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col min-h-full px-3 py-4">
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-2">
        <img src="/logo.png" alt="Lawsa" className="w-8 h-8 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className={`text-white font-black text-xl tracking-tight ${compact ? "hidden xl:block" : "block"}`}>Lawsa</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = location === href || (href !== "/dashboard" && location.startsWith(href));
          const isNotif = label === "Notifications";
          const isMsg = label === "Messages";
          return (
            <Link key={href} href={href} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${active ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={active ? "fill" : "regular"} />
                {isNotif && notifCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{notifCount > 9 ? "9+" : notifCount}</span>}
                {isMsg && msgCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{msgCount > 9 ? "9+" : msgCount}</span>}
              </div>
              <span className={`${compact ? "hidden xl:block" : "block"} text-base ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}>{label}</span>
            </Link>
          );
        })}
        {user && (
          <>
            <Link href={`/dashboard/profile/${uid}`} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${location.startsWith("/dashboard/profile") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
              <User className={`w-6 h-6 ${location.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={location.startsWith("/dashboard/profile") ? "fill" : "regular"} />
              <span className={`${compact ? "hidden xl:block" : "block"} text-base ${location.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Profile</span>
            </Link>
            {!compact && (
              <>
                <Link href="/dashboard/customize" onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${location.startsWith("/dashboard/customize") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
                  <Sparkle className={`w-6 h-6 ${location.startsWith("/dashboard/customize") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={location.startsWith("/dashboard/customize") ? "fill" : "regular"} />
                  <span className={`block text-base ${location.startsWith("/dashboard/customize") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Wardrobe</span>
                </Link>
                <Link href="/dashboard/settings" onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${location.startsWith("/dashboard/settings") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
                  <Gear className={`w-6 h-6 ${location.startsWith("/dashboard/settings") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={location.startsWith("/dashboard/settings") ? "fill" : "regular"} />
                  <span className={`block text-base ${location.startsWith("/dashboard/settings") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Settings</span>
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {user && (
        <button onClick={() => { setShowCompose(true); setMobileMenu(false); }}
          className={`mx-3 mt-3 flex items-center gap-3 px-3 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 ${compact ? "justify-center xl:justify-start" : "justify-center"}`}>
          <PencilSimpleLine className="w-5 h-5 flex-shrink-0" weight="bold" />
          <span className={compact ? "hidden xl:block" : "block"}>Post</span>
        </button>
      )}

      <div className="mt-4 border-t border-[#222] pt-4">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#1a1a1a] cursor-pointer group">
              <Avatar src={user.profileImage} name={user.name} size={36} gold={user.premiumTheme} />
              <div className={`${compact ? "hidden xl:block" : "block"} flex-1 min-w-0`}>
                <div className="flex items-center gap-1">
                  <p className="text-white font-bold text-sm truncate">{user.name}</p>
                  {!user.isSpecial && user.isVerified && <SealCheck className="w-4 h-4 text-blue-400 flex-shrink-0" weight="fill" />}
                  {user.isSpecial && <DiamondBadge size={15} />}
                </div>
                <p className="text-gray-500 text-xs truncate">@{user.username}</p>
              </div>
            </div>
            {!compact && (
              <button onClick={logout} className="mt-2 w-full flex items-center gap-3 px-3 py-3 rounded-full hover:bg-[#1a1a1a] text-red-400">
                <SignOut className="w-5 h-5" /><span className="text-base font-medium">Sign out</span>
              </button>
            )}
          </>
        ) : (
          <div className={`${compact ? "hidden xl:flex" : "flex"} flex-col gap-2 px-2`}>
            <Link href="/register" className="w-full py-2.5 rounded-full bg-white text-black text-sm font-bold text-center hover:bg-gray-200 transition-colors">Create account</Link>
            <Link href="/login" className="w-full py-2.5 rounded-full border border-white/30 text-white text-sm font-bold text-center hover:bg-white/10 transition-colors">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );

  const acceptCall = () => {
    if (!incomingCall) return;
    dismissedRef.current.add(incomingCall.sessionId);
    setIncomingCall(null);
    window.location.href = `/dashboard/call/${incomingCall.callerId}?role=callee&type=${incomingCall.callType}&session=${incomingCall.sessionId}`;
  };
  const declineCall = () => {
    if (!incomingCall) return;
    dismissedRef.current.add(incomingCall.sessionId);
    fetch("/api/calls/signal", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ sessionId: incomingCall.sessionId, toUserId: incomingCall.callerId, type: "decline", payload: {} }) }).catch(() => {});
    setIncomingCall(null);
  };

  const isMessages = location === "/dashboard/messages" || location.startsWith("/dashboard/messages/");
  const isLive = /^\/dashboard\/live\/.+/.test(location);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="hidden md:flex flex-col w-[72px] xl:w-[260px] border-r border-[#222] fixed top-0 left-0 h-screen z-30 overflow-y-auto">
        <Sidebar compact />
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-[#222]">
            <button onClick={() => setMobileMenu(false)} className="absolute top-4 right-4 p-2"><X className="w-5 h-5 text-gray-400" /></button>
            <Sidebar />
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/20 rounded-3xl p-6 flex flex-col items-center gap-4 w-72 shadow-2xl">
            <div className="relative">
              <Avatar src={incomingCall.callerImage} name={incomingCall.callerName} size={72} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                {incomingCall.callType === "video" ? <VideoCamera size={12} className="text-white" /> : <Phone size={12} className="text-white" />}
              </span>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{incomingCall.callerName}</p>
              <p className="text-gray-400 text-sm">{incomingCall.callType === "video" ? "Video call" : "Voice call"}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={declineCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"><PhoneDisconnect size={24} className="text-white" /></button>
              <button onClick={acceptCall} className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors"><Phone size={24} className="text-white" /></button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-[72px] xl:ml-[260px] min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {!isMessages && !isLive && (
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#222] sticky top-0 bg-black/95 backdrop-blur z-20">
            <button onClick={() => setMobileMenu(true)}><List className="w-6 h-6 text-white" /></button>
            <span className="text-white font-black text-lg">Lawsa</span>
            {user ? <Avatar src={user.profileImage} name={user.name} size={30} /> : <Link href="/login" className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">Sign in</Link>}
          </div>
        )}
        {children}
      </main>

      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-[#222] flex items-center justify-around px-2 py-2 z-30">
          {[
            { href: "/dashboard", icon: House },
            { href: "/dashboard/explore", icon: MagnifyingGlass },
            { href: "/dashboard/notifications", icon: Bell, count: notifCount },
            { href: "/dashboard/messages", icon: Envelope, count: msgCount },
            { href: "/dashboard/clans", icon: UsersThree },
          ].map(({ href, icon: Icon, count }) => {
            const active = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link key={href} href={href} className="relative flex flex-col items-center p-2">
                <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-500"}`} weight={active ? "fill" : "regular"} />
                {count !== undefined && count > 0 && <span className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{count > 9 ? "9+" : count}</span>}
              </Link>
            );
          })}
        </nav>
      )}

      {showCompose && user && <ComposeModal me={user} open={showCompose} onClose={() => setShowCompose(false)} />}
    </div>
  );
}
