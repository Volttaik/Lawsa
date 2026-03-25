"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserCheck, Search, Loader2, Users, SearchX } from "lucide-react";
import Link from "next/link";

interface UserCard {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  profileImage?: string;
  followers?: string[];
  following?: string[];
  skills?: string[];
}

interface CurrentUser {
  _id: string;
  followers?: string[];
  following?: string[];
}

function Avatar({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function UserRow({
  user,
  isFollowing,
  isLoading,
  onFollow,
  badge,
}: {
  user: UserCard;
  isFollowing: boolean;
  isLoading: boolean;
  onFollow: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-4 flex items-center gap-4 transition-shadow"
    >
      <Link href={`/dashboard/profile/${user._id}`} className="flex-shrink-0">
        <Avatar src={user.profileImage} name={user.name} size={52} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/dashboard/profile/${user._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">{user.name}</h3>
          </Link>
          {badge}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
        {user.bio && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">{user.bio}</p>}
        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {user.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onFollow}
        disabled={isLoading}
        className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 shadow-btn transition-all flex-shrink-0 ${
          isFollowing
            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
        <span className="hidden sm:block">{isFollowing ? "Following" : "Follow"}</span>
      </motion.button>
    </motion.div>
  );
}

function ConnectPageContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (data.user) {
        setCurrentUser(data.user);
        setFollowing(new Set(data.user.following || []));
      }
    });
  }, []);

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    const url = search ? `/api/users?search=${encodeURIComponent(search)}` : "/api/users";
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleFollow = async (userId: string) => {
    setFollowLoading((prev) => new Set([...prev, userId]));
    const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    const data = await res.json();
    if (data.following) {
      setFollowing((prev) => new Set([...prev, userId]));
    } else {
      setFollowing((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    }
    setFollowLoading((prev) => { const s = new Set(prev); s.delete(userId); return s; });
  };

  const myId = currentUser?._id;
  const myFollowers = new Set(currentUser?.followers || []);

  const filteredUsers = users.filter((u) => u._id !== myId);

  const followRequests = !search
    ? filteredUsers.filter((u) => myFollowers.has(u._id) && !following.has(u._id))
    : [];
  const others = filteredUsers.filter((u) => !followRequests.find((r) => r._id === u._id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Connect</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Discover and follow people in your community</p>
      </motion.div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-soft transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Follow Requests */}
          <AnimatePresence>
            {followRequests.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={15} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Follow Requests</h2>
                  <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{followRequests.length}</span>
                </div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  className="space-y-3"
                >
                  {followRequests.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      isFollowing={following.has(user._id)}
                      isLoading={followLoading.has(user._id)}
                      onFollow={() => handleFollow(user._id)}
                      badge={
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full font-medium">
                          Follows you
                        </span>
                      }
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Discover */}
          {others.length === 0 && followRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-12 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <SearchX size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No users found{search ? ` for "${search}"` : ""}.</p>
            </motion.div>
          ) : others.length > 0 ? (
            <>
              {!search && followRequests.length > 0 && (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">People you may know</h2>
                </div>
              )}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-3"
              >
                {others.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    isFollowing={following.has(user._id)}
                    isLoading={followLoading.has(user._id)}
                    onFollow={() => handleFollow(user._id)}
                    badge={
                      myFollowers.has(user._id) ? (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                          Follows you
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </motion.div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    }>
      <ConnectPageContent />
    </Suspense>
  );
}
