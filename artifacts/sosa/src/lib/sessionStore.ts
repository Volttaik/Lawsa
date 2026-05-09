const KEY = "lawsa_session_user";
const INIT_KEY = "lawsa_session_initialized";

export interface SessionUser {
  id: string; _id: string; name: string; username: string; email: string;
  profileImage: string; bannerImage: string; bio: string; phone: string;
  dateOfBirth: string; headline: string; website: string; location: string;
  skills: string[]; followers: string[]; following: string[];
  connections: string[]; pendingConnections: string[]; bookmarks: string[];
  experience: any[]; education: any[];
  followersCount: number; followingCount: number; postsCount: number;
  clanId: string; clanName: string; clanLogo: string;
  isVerified: boolean; isSpecial: boolean; isBoosted: boolean;
  premiumTheme: boolean; emailVerified: boolean; lastOnline?: string; createdAt?: string;
}

export function getSessionUser(): SessionUser | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function setSessionUser(user: SessionUser): void {
  try { localStorage.setItem(KEY, JSON.stringify(user)); localStorage.setItem(INIT_KEY, "1"); } catch {}
}
export function clearSessionUser(): void {
  try { localStorage.removeItem(KEY); localStorage.removeItem(INIT_KEY); } catch {}
}
export function isSessionInitialized(): boolean {
  try { return !!localStorage.getItem(INIT_KEY); } catch { return false; }
}
