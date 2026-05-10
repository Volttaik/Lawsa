"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass, Users, Article, Trash, PencilSimple, X, Check,
  SpinnerGap, SealCheck, ShieldCheck, Star, Eye, CaretLeft, CaretRight,
  ArrowLeft, Warning, ToggleLeft, ToggleRight,
} from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import ReactTimeago from "react-timeago";

const ADMIN_EMAIL = "onyeaghorlouis@gmail.com";

function Avatar({ src, name, size = 36 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}>
      {initials}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${color}`}>
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-blue-600" : "bg-gray-700"}`}>
      <span className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function EditUserModal({ user, onClose, onSave }: { user: any; onClose: () => void; onSave: (u: any) => void }) {
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    bio: user.bio || "",
    headline: user.headline || "",
    website: user.website || "",
    location: user.location || "",
    phone: user.phone || "",
    isVerified: !!user.isVerified,
    isBoosted: !!user.isBoosted,
    premiumTheme: !!user.premiumTheme,
    emailVerified: !!user.emailVerified,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true); setError("");
    const res = await fetch(`/api/admin/world/users/${user._id || user.id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { onSave(data.user); }
    else { setError(data.error || "Failed to save"); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar src={user.profileImage} name={user.name} size={36} />
            <div>
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-gray-500 text-xs">@{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">{error}</p>}

          {[
            { label: "Name", key: "name" },
            { label: "Username", key: "username" },
            { label: "Email", key: "email" },
            { label: "Bio", key: "bio", textarea: true },
            { label: "Headline", key: "headline" },
            { label: "Website", key: "website" },
            { label: "Location", key: "location" },
            { label: "Phone", key: "phone" },
          ].map(({ label, key, textarea }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-400 mb-1 block">{label}</label>
              {textarea ? (
                <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" rows={2} />
              ) : (
                <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { label: "Verified", key: "isVerified", desc: "Blue checkmark" },
              { label: "Boosted", key: "isBoosted", desc: "Boosted account" },
              { label: "Premium Theme", key: "premiumTheme", desc: "Gold ring avatar" },
              { label: "Email Verified", key: "emailVerified", desc: "Can post freely" },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-white text-xs font-medium">{label}</p>
                  <p className="text-gray-500 text-[10px]">{desc}</p>
                </div>
                <Toggle checked={(form as any)[key]} onChange={v => setForm(f => ({ ...f, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {saving ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPostModal({ post, onClose, onSave }: { post: any; onClose: () => void; onSave: (p: any) => void }) {
  const [content, setContent] = useState(post.content || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/world/posts/${post._id || post.id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (res.ok) onSave(data.post);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="text-white font-bold">Edit Post</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={post.authorImage} name={post.authorName} size={28} />
            <p className="text-white text-sm font-medium">{post.authorName}</p>
            <p className="text-gray-500 text-xs">@{post.authorUsername}</p>
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {saving ? <SpinnerGap className="w-4 h-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#111] border border-red-900/50 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Warning className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p className="text-white font-semibold">{message}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function WorldPage() {
  const { user } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "posts">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "user" | "post"; id: string; name: string } | null>(null);
  const [stats, setStats] = useState({ users: 0, posts: 0 });
  const searchTimeout = useRef<any>(null);

  const isAdmin = (user as any)?.email?.toLowerCase() === ADMIN_EMAIL || (user as any)?.isSpecial;

  useEffect(() => {
    if (user && !isAdmin) router.replace("/dashboard");
  }, [user, isAdmin, router]);

  const fetchStats = useCallback(async () => {
    const [u, p] = await Promise.all([
      fetch("/api/admin/world/users", { credentials: "include" }).then(r => r.json()).catch(() => ({ total: 0 })),
      fetch("/api/admin/world/posts", { credentials: "include" }).then(r => r.json()).catch(() => ({ total: 0 })),
    ]);
    setStats({ users: u.total || 0, posts: p.total || 0 });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = tab === "users"
        ? `/api/admin/world/users?page=${page}&search=${encodeURIComponent(search)}`
        : `/api/admin/world/posts?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (tab === "users") setUsers(data.users || []);
      else setPosts(data.posts || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  useEffect(() => { if (isAdmin) { fetchStats(); } }, [isAdmin, fetchStats]);
  useEffect(() => { if (isAdmin) { fetchData(); } }, [isAdmin, fetchData]);

  const handleSearch = (v: string) => {
    setSearchInput(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/admin/world/users/${id}`, { method: "DELETE", credentials: "include" });
    setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
    setStats(s => ({ ...s, users: s.users - 1 }));
    setConfirmDelete(null);
  };

  const deletePost = async (id: string) => {
    await fetch(`/api/admin/world/posts/${id}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => (p._id || p.id) !== id));
    setStats(s => ({ ...s, posts: s.posts - 1 }));
    setConfirmDelete(null);
  };

  const totalPages = Math.ceil(total / 50);

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-gray-500">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={updated => { setUsers(prev => prev.map(u => (u._id || u.id) === (updated._id || updated.id) ? updated : u)); setEditUser(null); }}
        />
      )}
      {editPost && (
        <EditPostModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onSave={updated => { setPosts(prev => prev.map(p => (p._id || p.id) === (updated._id || updated.id) ? updated : p)); setEditPost(null); }}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message={`Delete ${confirmDelete.type} "${confirmDelete.name}"? This cannot be undone.`}
          onConfirm={() => confirmDelete.type === "user" ? deleteUser(confirmDelete.id) : deletePost(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-[#222] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">World Control</h1>
                <DiamondBadge size={16} />
              </div>
              <p className="text-xs text-gray-500">Full platform management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatBadge label="Users" value={stats.users} color="border-blue-800/40 bg-blue-900/10" />
            <StatBadge label="Posts" value={stats.posts} color="border-purple-800/40 bg-purple-900/10" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex bg-[#111] border border-[#222] rounded-xl p-1 gap-1">
            <button onClick={() => { setTab("users"); setPage(1); setSearch(""); setSearchInput(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "users" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              <Users className="w-4 h-4" /> Users
            </button>
            <button onClick={() => { setTab("posts"); setPage(1); setSearch(""); setSearchInput(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "posts" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              <Article className="w-4 h-4" /> Posts
            </button>
          </div>
          <div className="flex-1 relative min-w-[180px]">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              className="w-full pl-9 pr-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {total > 0 && (
            <span className="text-xs text-gray-500 flex-shrink-0">{total} total</span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SpinnerGap className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tab === "users" ? (
          <div className="space-y-1">
            {users.length === 0 && (
              <div className="text-center py-16 text-gray-600">No users found</div>
            )}
            {users.map(u => (
              <div key={u._id || u.id} className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] rounded-xl transition-colors group">
                <Avatar src={u.profileImage} name={u.name} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-white text-sm">{u.name}</span>
                    {u.isSpecial && <DiamondBadge size={14} />}
                    {u.isSpecial && u.isVerified && <SealCheck className="w-3.5 h-3.5 text-amber-400" weight="fill" />}
                    {!u.isSpecial && u.isVerified && <SealCheck className="w-3.5 h-3.5 text-blue-400" weight="fill" />}
                    {u.isBoosted && <Star className="w-3.5 h-3.5 text-amber-400" weight="fill" />}
                    {u.premiumTheme && <span className="text-[10px] px-1.5 py-0.5 bg-amber-900/30 border border-amber-700/40 text-amber-400 rounded-full">Gold</span>}
                    {u.emailVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-400" weight="fill" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-500 text-xs">@{u.username}</span>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className="text-gray-500 text-xs truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-gray-600">{u.followersCount ?? 0} followers</span>
                    <span className="text-[11px] text-gray-600">{u.postsCount ?? 0} posts</span>
                    <span className="text-[11px] text-gray-600">Joined <ReactTimeago date={u.createdAt} /></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditUser(u)}
                    className="p-2 rounded-full hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-colors" title="Edit">
                    <PencilSimple className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete({ type: "user", id: u._id || u.id, name: u.name })}
                    className="p-2 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {posts.length === 0 && (
              <div className="text-center py-16 text-gray-600">No posts found</div>
            )}
            {posts.map(p => (
              <div key={p._id || p.id} className="flex gap-3 px-4 py-3 bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] rounded-xl transition-colors group">
                <Avatar src={p.authorImage} name={p.authorName} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-white text-sm">{p.authorName}</span>
                    {p.authorIsSpecial && <DiamondBadge size={13} />}
                    {p.authorIsSpecial && p.authorIsVerified && <SealCheck className="w-3 h-3 text-amber-400" weight="fill" />}
                    {!p.authorIsSpecial && p.authorIsVerified && <SealCheck className="w-3 h-3 text-blue-400" weight="fill" />}
                    <span className="text-gray-500 text-xs">@{p.authorUsername}</span>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className="text-gray-500 text-xs"><ReactTimeago date={p.createdAt} /></span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{p.content || <span className="text-gray-600 italic">No text</span>}</p>
                  {p.images?.length > 0 && (
                    <span className="text-xs text-gray-500 mt-1 inline-block">{p.images.length} image{p.images.length > 1 ? "s" : ""}</span>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-gray-600">{p.likes?.length ?? 0} likes</span>
                    <span className="text-[11px] text-gray-600">{p.views ?? 0} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-start pt-1">
                  <button onClick={() => setEditPost(p)}
                    className="p-2 rounded-full hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-colors" title="Edit">
                    <PencilSimple className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete({ type: "post", id: p._id || p.id, name: p.content?.slice(0, 40) || "this post" })}
                    className="p-2 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-full hover:bg-[#1a1a1a] disabled:opacity-30 text-gray-400 transition-colors">
              <CaretLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-full hover:bg-[#1a1a1a] disabled:opacity-30 text-gray-400 transition-colors">
              <CaretRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
