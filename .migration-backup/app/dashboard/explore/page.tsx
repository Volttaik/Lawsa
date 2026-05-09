"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { MagnifyingGlass, TrendUp, Users, Hash, X, SealCheck } from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import Link from "next/link";
import ReactTimeago from "react-timeago";

interface UserResult { _id: string; id?: string; name: string; username: string; profileImage?: string; bio?: string; isVerified?: boolean; followers?: string[]; following?: string[]; }
interface PostResult { _id: string; authorId: string; authorName: string; authorUsername: string; authorImage?: string; content: string; images?: string[]; likes?: string[]; createdAt: string; }

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>{initials}</div>;
}

const TRENDING = [
  { tag: "#SosaSocials", posts: "12.4K" },
  { tag: "#NigeriaTwitter", posts: "48.2K" },
  { tag: "#LawStudents", posts: "8.1K" },
  { tag: "#TechInAfrica", posts: "22.7K" },
  { tag: "#JobOpportunities", posts: "15.3K" },
  { tag: "#ProfessionalNetwork", posts: "6.8K" },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"top" | "people" | "posts">("top");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<UserResult[]>([]);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
      fetch("/api/users/suggestions?limit=5", { credentials: "include" }).then(r => r.json()),
    ]).then(([meData, sugData]) => {
      if (meData.user) { setMe(meData.user); setFollowing(new Set(meData.user.following || [])); }
      setSuggestions(sugData.users || []);
    }).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setUsers([]); setPosts([]); return; }
    setSearching(true);
    const [uRes, pRes] = await Promise.all([
      fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=10`).then(r => r.json()),
      fetch(`/api/posts?search=${encodeURIComponent(q)}&limit=10`).then(r => r.json()),
    ]);
    setUsers(uRes.users || []);
    setPosts(pRes.posts || []);
    setSearching(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const toggleFollow = async (uid: string) => {
    const wasFollowing = following.has(uid);
    setFollowing(prev => { const s = new Set(prev); if (wasFollowing) s.delete(uid); else s.add(uid); return s; });
    setFollowLoading(prev => new Set([...prev, uid]));
    try {
      const res = await fetch(`/api/users/${uid}/follow`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        setFollowing(prev => { const s = new Set(prev); if (wasFollowing) s.add(uid); else s.delete(uid); return s; });
      } else {
        const data = await res.json();
        if (typeof data.following === "boolean") {
          setFollowing(prev => { const s = new Set(prev); if (data.following) s.add(uid); else s.delete(uid); return s; });
        }
      }
    } catch {
      setFollowing(prev => { const s = new Set(prev); if (wasFollowing) s.add(uid); else s.delete(uid); return s; });
    }
    setFollowLoading(prev => { const s = new Set(prev); s.delete(uid); return s; });
  };

  const myId = me?.id || me?._id;
  const hasResults = query.trim() && (users.length > 0 || posts.length > 0);
  const noResults = query.trim() && !searching && users.length === 0 && posts.length === 0;

  return (
    <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur px-4 py-3 border-b border-[#2f3336]">
        <div className="flex items-center gap-3 bg-[#202327] rounded-full px-4 py-2.5">
          <MagnifyingGlass className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, posts, or tags"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600" autoFocus />
          {query && <button onClick={() => setQuery("")}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>}
        </div>
        {query && (
          <div className="flex mt-3 gap-0">
            {(["top", "people", "posts"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors relative ${tab === t ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
                {t}
                {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {searching && (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!query && (
        <>
          <div className="px-4 py-3 border-b border-[#2f3336]">
            <div className="flex items-center gap-2 mb-4"><TrendUp className="w-5 h-5 text-blue-400" /><h2 className="font-bold text-white text-lg">Trending</h2></div>
            {TRENDING.map((t, i) => (
              <button key={t.tag} onClick={() => setQuery(t.tag.slice(1))} className="w-full flex items-center justify-between py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#0a0a0a] -mx-4 px-4 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-5">{i + 1}</span>
                  <div className="text-left"><p className="text-white font-semibold text-sm">{t.tag}</p><p className="text-gray-500 text-xs">{t.posts} posts</p></div>
                </div>
                <Hash className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-blue-400" /><h2 className="font-bold text-white text-lg">Who to follow</h2></div>
              {suggestions.filter(u => (u._id || u.id) !== myId).map(u => {
                const id = u._id || u.id || "";
                const isFollowing = following.has(id);
                return (
                  <div key={id} className="flex items-center gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
                    <Link href={`/dashboard/profile/${id}`}><Avatar src={u.profileImage} name={u.name} size={44} /></Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/profile/${id}`} className="font-bold text-white text-sm hover:underline truncate">{u.name}</Link>
                        {!(u as any).isSpecial && u.isVerified && <SealCheck className="w-4 h-4 text-blue-400 flex-shrink-0" weight="fill" />}
                        {(u as any).isSpecial && <DiamondBadge size={15} />}
                        {(u as any).isSpecial && u.isVerified && <SealCheck className="w-4 h-4 text-amber-400 flex-shrink-0" weight="fill" />}
                      </div>
                      <p className="text-gray-500 text-xs">@{u.username}</p>
                      {u.bio && <p className="text-gray-400 text-xs mt-0.5 truncate">{u.bio}</p>}
                    </div>
                    <button onClick={() => toggleFollow(id)} disabled={followLoading.has(id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex-shrink-0 flex items-center gap-1.5 ${isFollowing ? "bg-transparent border border-[#333] text-white hover:border-red-500 hover:text-red-400" : "bg-white text-black hover:bg-gray-200"}`}>
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {hasResults && !searching && (
        <div>
          {(tab === "top" || tab === "people") && users.length > 0 && (
            <div className={tab === "top" ? "border-b border-[#2f3336]" : ""}>
              {tab === "top" && <h3 className="px-4 py-3 font-bold text-white">People</h3>}
              {users.slice(0, tab === "top" ? 3 : users.length).map(u => {
                const isFollowing = following.has(u._id);
                return (
                  <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#0a0a0a] transition-colors border-b border-[#1a1a1a]">
                    <Link href={`/dashboard/profile/${u._id}`}><Avatar src={u.profileImage} name={u.name} size={44} /></Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/profile/${u._id}`}>
                        <div className="flex items-center gap-1"><p className="text-white font-bold text-sm hover:underline truncate">{u.name}</p>{!(u as any).isSpecial && u.isVerified && <SealCheck className="w-4 h-4 text-blue-400 flex-shrink-0" weight="fill" />}{(u as any).isSpecial && <DiamondBadge size={15} />}{(u as any).isSpecial && u.isVerified && <SealCheck className="w-4 h-4 text-amber-400 flex-shrink-0" weight="fill" />}</div>
                        <p className="text-gray-500 text-xs">@{u.username}</p>
                      </Link>
                      {u.bio && <p className="text-gray-400 text-xs mt-0.5 truncate">{u.bio}</p>}
                    </div>
                    {u._id !== myId && (
                      <button onClick={() => toggleFollow(u._id)} disabled={followLoading.has(u._id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex-shrink-0 ${isFollowing ? "bg-transparent border border-[#333] text-white hover:border-red-500 hover:text-red-400" : "bg-white text-black hover:bg-gray-200"}`}>
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {(tab === "top" || tab === "posts") && posts.length > 0 && (
            <div>
              {tab === "top" && <h3 className="px-4 py-3 font-bold text-white">Posts</h3>}
              {posts.slice(0, tab === "top" ? 5 : posts.length).map(p => (
                <div key={p._id} className="px-4 py-3 hover:bg-[#0a0a0a] border-b border-[#2f3336] transition-colors">
                  <div className="flex gap-3">
                    <Avatar src={p.authorImage} name={p.authorName} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Link href={`/dashboard/profile/${p.authorId}`} className="font-bold text-white text-sm hover:underline">{p.authorName}</Link>
                        <span className="text-gray-500 text-xs">@{p.authorUsername}</span>
                        <span className="text-gray-600 text-xs">·</span>
                        <span className="text-gray-500 text-xs"><ReactTimeago date={p.createdAt} /></span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{p.content}</p>
                      {(Array.isArray(p.images) ? p.images : []).length > 0 && <img src={(Array.isArray(p.images) ? p.images : [])[0]} alt="" className="mt-2 rounded-xl max-h-48 object-cover w-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {noResults && (
        <div className="text-center py-16 text-gray-500">
          <MagnifyingGlass className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-gray-400">No results for &quot;{query}&quot;</p>
          <p className="text-sm mt-1">Try different keywords</p>
        </div>
      )}
      <div className="h-20" />
    </div>
  );
}
