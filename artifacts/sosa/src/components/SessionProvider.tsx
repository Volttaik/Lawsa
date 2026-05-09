import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getSessionUser, setSessionUser, clearSessionUser, isSessionInitialized, SessionUser } from "@/lib/sessionStore";

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue>({ user: null, isLoading: true, refreshUser: async () => {}, updateUser: () => {}, logout: () => {} });
export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getSessionUser());
  const [isLoading, setIsLoading] = useState(!isSessionInitialized());

  const fetchAndStore = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) { clearSessionUser(); setUser(null); return null; }
      const data = await res.json();
      if (data?.user) { setSessionUser(data.user); setUser(data.user); return data.user; }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    if (isSessionInitialized()) { fetchAndStore(); return; }
    setIsLoading(true);
    fetchAndStore().finally(() => setIsLoading(false));
  }, [fetchAndStore]);

  const refreshUser = useCallback(async () => { await fetchAndStore(); }, [fetchAndStore]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser(prev => { if (!prev) return prev; const u = { ...prev, ...patch }; setSessionUser(u); return u; });
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    clearSessionUser(); setUser(null);
    window.location.href = "/login";
  }, []);

  return <SessionContext.Provider value={{ user, isLoading, refreshUser, updateUser, logout }}>{children}</SessionContext.Provider>;
}
