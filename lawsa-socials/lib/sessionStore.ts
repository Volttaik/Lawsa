const KEY = "lawsa_session_user";
const INIT_KEY = "lawsa_session_initialized";
const TOKEN_KEY = "lawsa_auth_token";

export interface SessionUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string;
  bannerImage: string;
  bio: string;
  phone: string;
  dateOfBirth: string;
  headline: string;
  website: string;
  location: string;
  skills: string[];
  followers: string[];
  following: string[];
  connections: string[];
  pendingConnections: string[];
  bookmarks: string[];
  experience: any[];
  education: any[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  clanId: string;
  clanName: string;
  clanLogo: string;
  isVerified: boolean;
  isBoosted: boolean;
  premiumTheme: boolean;
  emailVerified: boolean;
  lastOnline?: string;
  createdAt?: string;
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
    localStorage.setItem(INIT_KEY, "1");
  } catch {}
}

export function isSessionInitialized(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(INIT_KEY) === "1";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(INIT_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function updateSessionUser(patch: Partial<SessionUser>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSessionUser();
    if (!existing) return;
    setSessionUser({ ...existing, ...patch });
  } catch {}
}
