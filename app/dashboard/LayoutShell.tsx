"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  House, MagnifyingGlass, Bell, Envelope, User, UsersThree,
  Star, List, X, SignOut, SealCheck, Gear, Broadcast, Phone,
  PhoneDisconnect, VideoCamera, Globe, PencilSimpleLine, ShoppingBag, Sparkle,
} from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import { useSession } from "@/components/SessionProvider";
import ComposeModal from "@/components/ComposeModal";

interface ShellUser {
  id: string;
  _id?: string;
  name: string;
  username: string;
  profileImage?: string;
  isVerified?: boolean;
  premiumTheme?: boolean;
}

interface IncomingCall {
  sessionId: string;
  callerId: string;
  callerName: string;
  callerImage: string;
  callType: "video" | "voice";
}

function Avatar({ src, name, size = 36, gold }: { src?: string; name: string; size?: number; gold?: boolean }) {
  const ring = gold ? "ring-2 ring-amber-400" : "";
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${ring}`} style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color} ${ring}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>
      {initials}
    </div>
  );
}

const NAV = [
  { href: "/dashboard",               icon: House,           label: "Home"          },
  { href: "/dashboard/explore",       icon: MagnifyingGlass, label: "Explore"       },
  { href: "/dashboard/notifications", icon: Bell,            label: "Notifications", authRequired: true },
  { href: "/dashboard/messages",      icon: Envelope,        label: "Messages",      authRequired: true },
  { href: "/dashboard/clans",         icon: UsersThree,      label: "Clans"         },
  { href: "/dashboard/live",          icon: Broadcast,       label: "Live"          },
  { href: "/dashboard/store",         icon: ShoppingBag,     label: "Store"         },
  { href: "/dashboard/premium",       icon: Star,            label: "Premium",       authRequired: true },
];

export default function LayoutShell({ user: initialUser, children }: { user: ShellUser | null; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: sessionUser, logout } = useSession();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [fabVisible, setFabVisible] = useState(true);
  const lastScrollY = useRef(0);
  const callSinceRef = useRef(new Date(Date.now() - 5000).toISOString());
  const dismissedSessionsRef = useRef<Set<string>>(new Set());

  const user = sessionUser || initialUser;
  const isLoggedIn = !!user;

  const heartbeat = useCallback(() => {
    if (!isLoggedIn) return;
    fetch("/api/users/heartbeat", { method: "POST" }).catch(() => {});
  }, [isLoggedIn]);

  const fetchCounts = useCallback(() => {
    if (!isLoggedIn) return;
    Promise.all([
      fetch("/api/notifications/count").then(r => r.json()).catch(() => ({ count: 0 })),
      fetch("/api/messages/count").then(r => r.json()).catch(() => ({ count: 0 })),
    ]).then(([notif, msg]) => {
      setNotifCount(notif.count || 0);
      setMsgCount(msg.count || 0);
    });
  }, [isLoggedIn]);

  const checkIncomingCalls = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/calls/incoming", { credentials: "include" });
      const data = await res.json();
      if (data.call && !dismissedSessionsRef.current.has(data.call.sessionId)) {
        setIncomingCall(data.call);
      } else if (!data.call) {
        setIncomingCall(null);
      }
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    heartbeat();
    fetchCounts();
    checkIncomingCalls();
    const hb = setInterval(heartbeat, 60000);
    const nc = setInterval(fetchCounts, 20000);
    const ic = setInterval(checkIncomingCalls, 8000);
    return () => { clearInterval(hb); clearInterval(nc); clearInterval(ic); };
  }, [heartbeat, fetchCounts, checkIncomingCalls, isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) { setFabVisible(true); }
      else if (currentY > lastScrollY.current + 8) { setFabVisible(false); }
      else if (currentY < lastScrollY.current - 8) { setFabVisible(true); }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (pathname === "/dashboard/notifications") {
      setNotifCount(0);
    } else if (pathname === "/dashboard/messages") {
      setMsgCount(0);
    } else {
      fetchCounts();
    }
  }, [pathname, fetchCounts, isLoggedIn]);

  const uid = (user as any)?.id || (user as any)?._id || "";

  const Sidebar = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col min-h-full px-3 py-4">
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-2">
        <img src="/logo.png" alt="Sosa" className="w-8 h-8 rounded-full object-cover" />
        <span className={`text-white font-black text-xl ${compact ? "hidden xl:block" : "block"}`}>Sosa</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, icon: Icon, label, authRequired }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotif = label === "Notifications";
          const isMsg = label === "Messages";
          return (
            <Link key={href} href={href} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${active ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={active ? "fill" : "regular"} />
                {isNotif && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
                {isMsg && msgCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {msgCount > 9 ? "9+" : msgCount}
                  </span>
                )}
              </div>
              <span className={`${compact ? "hidden xl:block" : "block"} text-base ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}>{label}</span>
            </Link>
          );
        })}
        {user && (
          <>
            <Link href={`/dashboard/profile/${uid}`} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${pathname.startsWith("/dashboard/profile") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
              <User className={`w-6 h-6 ${pathname.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={pathname.startsWith("/dashboard/profile") ? "fill" : "regular"} />
              <span className={`${compact ? "hidden xl:block" : "block"} text-base ${pathname.startsWith("/dashboard/profile") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Profile</span>
            </Link>
            {!compact && (
              <>
                <Link href="/dashboard/customize" onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${pathname.startsWith("/dashboard/customize") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
                  <Sparkle className={`w-6 h-6 ${pathname.startsWith("/dashboard/customize") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={pathname.startsWith("/dashboard/customize") ? "fill" : "regular"} />
                  <span className={`block text-base ${pathname.startsWith("/dashboard/customize") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Wardrobe</span>
                </Link>
                <Link href="/dashboard/settings" onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${pathname.startsWith("/dashboard/settings") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
                  <Gear className={`w-6 h-6 ${pathname.startsWith("/dashboard/settings") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={pathname.startsWith("/dashboard/settings") ? "fill" : "regular"} />
                  <span className={`block text-base ${pathname.startsWith("/dashboard/settings") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>Settings</span>
                </Link>
              </>
            )}
            {(user as any).isSpecial && (
              <Link href="/dashboard/world" onClick={() => setMobileMenu(false)}
                className={`flex items-center gap-4 px-3 py-3 rounded-full transition-colors group ${pathname.startsWith("/dashboard/world") ? "font-bold" : "hover:bg-[#1a1a1a]"}`}>
                <Globe className={`w-6 h-6 ${pathname.startsWith("/dashboard/world") ? "text-white" : "text-gray-300 group-hover:text-white"}`} weight={pathname.startsWith("/dashboard/world") ? "fill" : "regular"} />
                <span className={`${compact ? "hidden xl:block" : "block"} text-base ${pathname.startsWith("/dashboard/world") ? "text-white" : "text-gray-300 group-hover:text-white"}`}>World</span>
              </Link>
            )}
          </>
        )}
      </nav>

      {user && (
        <button
          onClick={() => { setShowCompose(true); setMobileMenu(false); }}
          className={`mx-3 mt-3 flex items-center gap-3 px-3 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 ${compact ? "justify-center xl:justify-start" : "justify-center"}`}
        >
          <PencilSimpleLine className="w-5 h-5 flex-shrink-0" weight="bold" />
          <span className={`${compact ? "hidden xl:block" : "block"}`}>Post</span>
        </button>
      )}

      <div className="mt-4 border-t border-[#222] pt-4">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#1a1a1a] cursor-pointer group">
              <Avatar src={user.profileImage} name={user.name} size={36} gold={(user as any).premiumTheme} />
              <div className={`${compact ? "hidden xl:block" : "block"} flex-1 min-w-0`}>
                <div className="flex items-center gap-1">
                  <p className="text-white font-bold text-sm truncate">{user.name}</p>
                  {!(user as any).isSpecial && (user as any).isVerified && <SealCheck className="w-4 h-4 text-blue-400 flex-shrink-0" weight="fill" />}
                  {(user as any).isSpecial && <DiamondBadge size={15} />}
                  {(user as any).isSpecial && (user as any).isVerified && <SealCheck className="w-4 h-4 text-amber-400 flex-shrink-0" weight="fill" />}
                </div>
                <p className="text-gray-500 text-xs truncate">@{user.username}</p>
              </div>
              <button onClick={logout} className={`${compact ? "hidden xl:block" : "block"} ml-auto opacity-0 group-hover:opacity-100 transition-opacity`}>
                <SignOut className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
            {!compact && (
              <button onClick={logout} className="mt-3 w-full flex items-center gap-3 px-3 py-3 rounded-full hover:bg-[#1a1a1a] text-red-400">
                <SignOut className="w-5 h-5" />
                <span className="text-base font-medium">Sign out</span>
              </button>
            )}
          </>
        ) : (
          <div className={`${compact ? "hidden xl:flex" : "flex"} flex-col gap-2 px-2`}>
            <Link href="/register" className="w-full py-2.5 rounded-full bg-white text-black text-sm font-bold text-center hover:bg-gray-200 transition-colors">
              Create account
            </Link>
            <Link href="/login" className="w-full py-2.5 rounded-full border border-white/30 text-white text-sm font-bold text-center hover:bg-white/10 transition-colors">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const acceptCall = () => {
    if (!incomingCall) return;
    dismissedSessionsRef.current.add(incomingCall.sessionId);
    setIncomingCall(null);
    router.push(`/dashboard/call/${incomingCall.callerId}?role=callee&type=${incomingCall.callType}&session=${incomingCall.sessionId}`);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    dismissedSessionsRef.current.add(incomingCall.sessionId);
    fetch("/api/calls/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId: incomingCall.sessionId, toUserId: incomingCall.callerId, type: "decline", payload: {} }),
    }).catch(() => {});
    setIncomingCall(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="hidden md:flex flex-col w-[72px] xl:w-[260px] border-r border-[#222] fixed top-0 left-0 h-screen z-30 overflow-y-auto">
        <Sidebar compact />
      </aside>

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

      <main className="flex-1 md:ml-[72px] xl:ml-[260px] min-h-screen pb-20 md:pb-0">
        {!pathname.startsWith("/dashboard/messages") && !/^\/dashboard\/live\/.+/.test(pathname) && (
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#222] sticky top-0 bg-black/95 backdrop-blur z-20">
            <button onClick={() => setMobileMenu(true)}><List className="w-6 h-6 text-white" /></button>
            <img src="/logo.png" alt="Sosa" className="w-8 h-8 rounded-full object-cover" />
            {user
              ? <Avatar src={user.profileImage} name={user.name} size={30} />
              : <Link href="/login" className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">Sign in</Link>
            }
          </div>
        )}
        {children}
      </main>

      {!pathname.startsWith("/dashboard/messages/") && !(/^\/dashboard\/live\/.+/.test(pathname)) && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-[#222] z-30 flex items-stretch justify-around px-2 py-2">
          {[
            ...NAV.slice(0, 4),
            user ? { href: `/dashboard/profile/${uid}`, icon: User, label: "Profile" } : { href: "/login", icon: User, label: "Sign in" },
          ].map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && href !== "/login" && pathname.startsWith(href));
            const isNotif = label === "Notifications";
            const isMsg = label === "Messages";
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 px-2 py-1 relative min-w-0 flex-1">
                <div className="relative">
                  <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-500"}`} weight={active ? "fill" : "regular"} />
                  {isNotif && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                  {isMsg && msgCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {msgCount > 9 ? "9+" : msgCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-none truncate ${active ? "text-white" : "text-gray-500"}`}>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {user && !pathname.startsWith("/dashboard/messages") && !/^\/dashboard\/live\/.+/.test(pathname) && (
        <button
          onClick={() => setShowCompose(true)}
          className={`md:hidden fixed bottom-[72px] right-4 z-40 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all duration-300 ${fabVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          aria-label="New post"
        >
          <PencilSimpleLine className="w-6 h-6 text-black" weight="bold" />
        </button>
      )}

      <ComposeModal me={user} open={showCompose} onClose={() => setShowCompose(false)} />

      {incomingCall && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[340px] max-w-[calc(100vw-2rem)]">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
              {incomingCall.callerImage
                ? <img src={incomingCall.callerImage} alt={incomingCall.callerName} className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-lg">{incomingCall.callerName?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{incomingCall.callerName}</p>
              <p className="text-gray-400 text-xs">Incoming {incomingCall.callType === "video" ? "video" : "voice"} call</p>
            </div>
            <button onClick={declineCall} className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0" title="Decline">
              <PhoneDisconnect size={18} weight="fill" className="text-white" />
            </button>
            <button onClick={acceptCall} className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors flex-shrink-0" title="Accept">
              {incomingCall.callType === "video"
                ? <VideoCamera size={18} weight="fill" className="text-white" />
                : <Phone size={18} weight="fill" className="text-white" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
