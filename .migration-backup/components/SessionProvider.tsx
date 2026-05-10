"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getSessionUser, setSessionUser, isSessionInitialized, clearSession, SessionUser, updateSessionUser } from "@/lib/sessionStore";

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  updateUser: () => {},
  logout: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

interface Props {
  children: ReactNode;
  isLoggedIn: boolean;
}

export function SessionProvider({ children, isLoggedIn }: Props) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initDone, setInitDone] = useState(false);
  const [isKillingSession, setIsKillingSession] = useState(false);

  const fetchAndStore = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.user) {
        const u = data.user as SessionUser;
        setSessionUser(u);
        setUser(u);
        return u;
      }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      const cached = getSessionUser();
      if (cached) {
        setUser(cached);
      }
      return;
    }

    const cached = getSessionUser();
    if (cached && isSessionInitialized()) {
      setUser(cached);
      setIsLoading(false);
      fetchAndStore();
      return;
    }

    setIsLoading(true);
    setInitProgress(0);

    const p1 = setInterval(() => {
      setInitProgress(prev => {
        if (prev >= 85) { clearInterval(p1); return prev; }
        return prev + Math.random() * 12 + 3;
      });
    }, 120);

    fetchAndStore().then(() => {
      clearInterval(p1);
      setInitProgress(100);
      setTimeout(() => {
        setInitDone(true);
        setTimeout(() => setIsLoading(false), 300);
      }, 400);
    });

    return () => clearInterval(p1);
  }, [isLoggedIn, fetchAndStore]);

  const refreshUser = useCallback(async () => {
    await fetchAndStore();
  }, [fetchAndStore]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    updateSessionUser(patch);
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  const logout = useCallback(() => {
    setIsKillingSession(true);
    clearSession();
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {}).finally(() => {
      setTimeout(() => {
        window.location.replace("/login");
      }, 1800);
    });
  }, []);

  if (isKillingSession) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="LAWSA" className="w-16 h-16 rounded-full object-cover" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-bold text-xl tracking-tight">Killing session…</p>
            <p className="text-gray-500 text-sm">You will be redirected to login</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-red-500"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
        <div className={`flex flex-col items-center gap-6 transition-opacity duration-300 ${initDone ? "opacity-0" : "opacity-100"}`}>
          <img src="/logo.png" alt="LAWSA" className="w-16 h-16 rounded-full object-cover animate-pulse" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-bold text-xl tracking-tight">LAWSA</p>
            <p className="text-gray-500 text-sm">Setting up your session…</p>
          </div>
          <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.min(initProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, refreshUser, updateUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
