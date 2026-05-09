import { useState, useEffect, useRef } from "react";
import { MagnifyingGlass, X, SealCheck, SpinnerGap, UserPlus, Check } from "@phosphor-icons/react";
import { Link } from "wouter";
import DiamondBadge from "@/components/DiamondBadge";
import Linkify from "@/components/Linkify";
import { timeAgo, fmtCount } from "@/lib/utils";
import { useSession } from "@/components/SessionProvider";

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

const TRENDING = [
  { tag: "#LawsaSocials", posts: "12.4K" },
  { tag: "#NigeriaTwitter", posts: "48.2K" },
  { tag: "#LawStudents", posts: "8.1K" },
  { tag: "#TechInAfrica", posts: "22.7K" },
  { tag: "#JobOpportunities", posts: "15.3K" },
  { tag: "#ProfessionalNetwork", posts: "6.8K" },
];

export default function ExplorePage() {
  const { user } = useSession();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"top" | "people" | "posts">("top");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const debounceRef = useRef<any>(null);
  const myId = user?.id || user?._id || "";

  useEffect(() => {
    fetch("/api/users/suggestions", { credentials: "include" }).then(r => r.json()).then(d => setSuggestions(d.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); setPosts([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [uRes, pRes] = await Promise.all([
          fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`, { credentials: "include" }).then(r => r.json()),
          fetch(`/api/posts?offset=0&limit=20`, { credentials: "include" }).then(r => r.json()),
        ]);
        setUsers(uRes.users || []);
        const q = query.toLowerCase();
        setPosts((pRes.posts || []).filter((p: any) => p.content?.toLowerCase().includes(q)).slice(0, 10));
      } catch {}
      setSearching(false);
    }, 350);
  }, [query]);

  const handleFollow = async (userId: string) => {
    if (!user || followLoading.has(userId)) return;
    setFollowLoading(s => new Set([...s, userId]));
    await fetch(`/api/users/${userId}/follow`, { method: "POST", credentials: "include" });
    setFollowing(s => { const n = new Set(s); if (n.has(userId)) n.delete(userId); else n.add(userId); return n; });
    setFollowLoading(s => { const n = new Set(s); n.delete(userId); return n; });
  };

  const showSearch = !!query.trim();

  return (
    <div className="max-w-[600px] mx-auto min-h-screen border-x border-[#2f3336]">
      <div className="sticky top-0 bg-black/90 backdrop-blur z-10 border-b border-[#2f3336]">
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Lawsa"
              className="w-full bg-[#111] border border-white/10 rounded-full px-4 py-2.5 pl-11 text-white placeholder-gray-600 text-sm outline-none focus:border-white/30 transition-colors" />
            {query && <button onClick={() => { setQuery(""); setUsers([]); setPosts([]); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-gray-400" /></button>}
          </div>
        </div>
        {showSearch && (
          <div className="flex border-b border-[#2f3336]">
            {(["top","people","posts"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? "border-white text-white" : "border-transparent text-gray-500 hover:text-white"}`}>{t}</button>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-[#2f3336]">
        {!showSearch ? (
          <>
            <div className="p-4">
              <h2 className="text-white font-bold text-xl mb-4">Trending topics</h2>
              {TRENDING.map(t => (
                <div key={t.tag} className="py-3 hover:bg-white/5 rounded-xl px-2 cursor-pointer transition-colors" onClick={() => setQuery(t.tag.slice(1))}>
                  <p className="text-xs text-gray-500">Trending</p>
                  <p className="text-white font-bold">{t.tag}</p>
                  <p className="text-gray-500 text-xs">{t.posts} posts</p>
                </div>
              ))}
            </div>
            {suggestions.length > 0 && (
              <div className="p-4">
                <h2 className="text-white font-bold text-xl mb-4">Who to follow</h2>
                {suggestions.slice(0, 8).map((u: any) => (
                  <div key={u.id || u._id} className="flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-xl px-2 transition-colors">
                    <Link href={`/dashboard/profile/${u.id || u._id}`} className="flex-shrink-0"><Avatar src={u.profileImage} name={u.name} size={44} /></Link>
                    <Link href={`/dashboard/profile/${u.id || u._id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-bold text-sm truncate">{u.name}</p>
                        {u.isSpecial && <DiamondBadge size={13} />}
                        {!u.isSpecial && u.isVerified && <SealCheck size={13} weight="fill" className="text-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-500 text-xs truncate">@{u.username}</p>
                    </Link>
                    {user && (u.id || u._id) !== myId && (
                      <button onClick={() => handleFollow(u.id || u._id)} disabled={followLoading.has(u.id || u._id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${following.has(u.id || u._id) ? "bg-white/10 text-white border border-white/20" : "bg-white text-black hover:bg-gray-200"}`}>
                        {followLoading.has(u.id || u._id) ? <SpinnerGap size={10} className="animate-spin" /> : following.has(u.id || u._id) ? <><Check size={10} /> Following</> : <><UserPlus size={10} /> Follow</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : searching ? (
          <div className="flex items-center justify-center py-16"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>
        ) : (
          <>
            {(tab === "top" || tab === "people") && users.map((u: any) => (
              <div key={u.id || u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <Link href={`/dashboard/profile/${u.id || u._id}`} className="flex-shrink-0"><Avatar src={u.profileImage} name={u.name} size={44} /></Link>
                <Link href={`/dashboard/profile/${u.id || u._id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-bold text-sm truncate">{u.name}</p>
                    {u.isSpecial && <DiamondBadge size={13} />}
                    {!u.isSpecial && u.isVerified && <SealCheck size={13} weight="fill" className="text-blue-400 flex-shrink-0" />}
                  </div>
                  <p className="text-gray-500 text-xs">@{u.username}</p>
                  {u.bio && <p className="text-gray-300 text-xs mt-0.5 line-clamp-1">{u.bio}</p>}
                  <p className="text-gray-600 text-xs mt-0.5">{fmtCount(u.followersCount || 0)} followers</p>
                </Link>
                {user && (u.id || u._id) !== myId && (
                  <button onClick={() => handleFollow(u.id || u._id)} disabled={followLoading.has(u.id || u._id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${following.has(u.id || u._id) ? "bg-white/10 text-white border border-white/20" : "bg-white text-black hover:bg-gray-200"}`}>
                    {followLoading.has(u.id || u._id) ? <SpinnerGap size={10} className="animate-spin" /> : following.has(u.id || u._id) ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))}
            {(tab === "top" || tab === "posts") && posts.map((p: any) => (
              <Link key={p._id} href={`/dashboard/profile/${p.authorId}`} className="block px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={p.authorImage} name={p.authorName} size={32} />
                  <div><p className="text-white text-xs font-bold">{p.authorName}</p><p className="text-gray-500 text-[11px]">@{p.authorUsername} · {timeAgo(p.createdAt)}</p></div>
                </div>
                <p className="text-gray-200 text-sm line-clamp-3"><Linkify text={p.content} /></p>
              </Link>
            ))}
            {users.length === 0 && posts.length === 0 && (
              <div className="text-center py-16 text-gray-500">No results for "<span className="text-white">{query}</span>"</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
