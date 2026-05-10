"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SpinnerGap, UserPlus, UserCheck } from "@phosphor-icons/react";

interface UserCard {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  profileImage?: string;
}

function Avatar({ src, name, size = 44 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>
      {initials}
    </div>
  );
}

export default function FollowersPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [meRes, profileRes, followersRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
        fetch(`/api/users/${userId}`).then(r => r.json()),
        fetch(`/api/users/${userId}/followers`).then(r => r.json()),
      ]);
      if (meRes.user) {
        setMe(meRes.user);
        setFollowing(new Set(meRes.user.following || []));
      }
      if (profileRes.user) { setProfileName(profileRes.user.name); setProfileUsername(profileRes.user.username); }
      setUsers(followersRes.users || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleFollow = async (targetId: string) => {
    const wasFollowing = following.has(targetId);
    setFollowing(prev => { const s = new Set(prev); wasFollowing ? s.delete(targetId) : s.add(targetId); return s; });
    setFollowLoading(prev => new Set([...prev, targetId]));
    try {
      const res = await fetch(`/api/users/${targetId}/follow`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        setFollowing(prev => { const s = new Set(prev); wasFollowing ? s.add(targetId) : s.delete(targetId); return s; });
      } else {
        const data = await res.json();
        if (typeof data.following === "boolean") {
          setFollowing(prev => { const s = new Set(prev); data.following ? s.add(targetId) : s.delete(targetId); return s; });
        }
      }
    } catch {
      setFollowing(prev => { const s = new Set(prev); wasFollowing ? s.add(targetId) : s.delete(targetId); return s; });
    }
    setFollowLoading(prev => { const s = new Set(prev); s.delete(targetId); return s; });
  };

  const myId = me?._id || me?.id || "";

  return (
    <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen bg-black">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-[#2f3336]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{profileName || "Followers"}</h1>
          {profileUsername && <p className="text-xs text-gray-500">@{profileUsername}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><SpinnerGap className="w-7 h-7 text-blue-500 animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-gray-300 font-semibold mb-1">No followers yet</p>
          <p className="text-gray-600 text-sm">When someone follows this account, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div>
          {users.map(user => {
            const isMe = user._id === myId;
            const isFollowing = following.has(user._id);
            const isLoading = followLoading.has(user._id);
            return (
              <div key={user._id} className="flex items-center gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-white/[0.03] transition-colors">
                <Link href={`/dashboard/profile/${user._id}`} className="flex-shrink-0">
                  <Avatar src={user.profileImage} name={user.name} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/profile/${user._id}`}>
                    <p className="font-bold text-white text-sm hover:underline truncate">{user.name}</p>
                  </Link>
                  <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                  {user.bio && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{user.bio}</p>}
                </div>
                {!isMe && (
                  <button
                    onClick={() => handleFollow(user._id)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${
                      isFollowing
                        ? "border border-[#536471] text-white hover:border-red-500 hover:text-red-500"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isLoading ? <SpinnerGap className="w-3.5 h-3.5 animate-spin" /> : isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
