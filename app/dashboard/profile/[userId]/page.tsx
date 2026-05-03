"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PencilSimple, UserPlus, UserCheck, SpinnerGap, ChatCircleDots,
  SealCheck, MapPin, Link as LinkIcon, Calendar, ArrowLeft,
  Heart, ChatCircle, Repeat2, Share, ImageSquare
} from "@phosphor-icons/react";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string;
  bannerImage?: string;
  skills?: string[];
  followers?: string[];
  following?: string[];
  location?: string;
  website?: string;
  headline?: string;
  clanId?: string;
  clanName?: string;
  clanLogo?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  content: string;
  images?: string[];
  likes?: string[];
  comments?: any[];
  reshares?: number;
  createdAt: string;
}

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover border-4 border-black"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full border-4 border-black bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function PostCard({ post, myId }: { post: Post; myId: string }) {
  const liked = (post.likes || []).includes(myId);
  const content = post.content || "";
  const MAX = 200;
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex gap-3">
        <Avatar src={post.authorImage} name={post.authorName} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <span className="font-bold text-white text-sm">{post.authorName}</span>
            <span className="text-gray-500 text-sm">@{post.authorUsername}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {new Date(post.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          </div>
          {content && (
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
              {!expanded && content.length > MAX
                ? <>{content.slice(0, MAX)}<button onClick={() => setExpanded(true)} className="text-blue-400 ml-1">...more</button></>
                : content
              }
            </p>
          )}
          {(post.images || []).length > 0 && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-[#2f3336]">
              <img src={(post.images || [])[0]} alt="" className="w-full max-h-64 object-cover" />
            </div>
          )}
          <div className="flex items-center gap-6 mt-2 text-gray-500">
            <div className="flex items-center gap-1.5 text-xs">
              <ChatCircle size={16} />
              <span>{fmt((post.comments || []).length)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Repeat2 size={16} />
              <span>{fmt(post.reshares || 0)}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${liked ? "text-pink-500" : ""}`}>
              <Heart size={16} weight={liked ? "fill" : "regular"} />
              <span>{fmt((post.likes || []).length)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [tab, setTab] = useState<"posts" | "media">("posts");

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [profileData, meData] = await Promise.all([
      fetch(`/api/users/${userId}`, { credentials: "include" }).then(r => r.json()),
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
    ]);
    if (profileData.user) setProfile(profileData.user);
    if (meData.user) setCurrentUser(meData.user);
    if (profileData.user && meData.user) {
      setIsFollowing((meData.user.following || []).includes(profileData.user._id));
    }
    setLoading(false);
  }, [userId]);

  const loadPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    const res = await fetch(`/api/posts/user/${userId}`, { credentials: "include" });
    const data = await res.json();
    setPosts(data.posts || []);
    setPostsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
    loadPosts();
  }, [loadData, loadPosts]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    const res = await fetch(`/api/users/${profile._id}/follow`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setIsFollowing(!!data.following);
    // Refresh profile to get updated counts
    const [profileData, meData] = await Promise.all([
      fetch(`/api/users/${userId}`, { credentials: "include" }).then(r => r.json()),
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
    ]);
    if (profileData.user) setProfile(profileData.user);
    if (meData.user) setCurrentUser(meData.user);
    setFollowLoading(false);
  };

  const isOwnProfile = currentUser?._id === profile?._id || currentUser?.id === profile?._id;
  const canMessage = !!currentUser && !!profile &&
    (currentUser.following || []).includes(profile._id) &&
    (profile.following || []).includes(currentUser._id || currentUser.id || "");

  const followersCount = profile?.followers?.length || 0;
  const followingCount = profile?.following?.length || 0;
  const mediaPosts = posts.filter(p => (p.images || []).length > 0);
  const myId = currentUser?._id || currentUser?.id || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <SpinnerGap size={32} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-400 gap-4">
        <p className="text-lg">User not found</p>
        <button onClick={() => router.back()} className="text-blue-400 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-black min-h-screen">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur px-4 py-3 flex items-center gap-4 border-b border-[#2f3336]">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">{profile.name}</h1>
          <p className="text-gray-500 text-xs">{fmt(posts.length)} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        {profile.bannerImage
          ? <img src={profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        }
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        {/* Avatar + action buttons */}
        <div className="flex items-end justify-between -mt-14 mb-3">
          <div className="relative">
            <Avatar src={profile.profileImage} name={profile.name} size={96} />
          </div>
          <div className="flex gap-2 pb-1">
            {isOwnProfile ? (
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-[#536471] text-white hover:bg-white/10 transition-colors"
              >
                <PencilSimple size={15} weight="bold" />
                Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all ${
                    isFollowing
                      ? "border border-[#536471] text-white hover:border-red-500 hover:text-red-400 bg-transparent"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {followLoading
                    ? <SpinnerGap size={14} className="animate-spin" />
                    : isFollowing
                      ? <UserCheck size={15} weight="bold" />
                      : <UserPlus size={15} weight="bold" />
                  }
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={() => canMessage && router.push(`/dashboard/messages?userId=${profile._id}`)}
                  disabled={!canMessage}
                  title={canMessage ? "Send message" : "Follow each other to message"}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full border transition-all ${
                    canMessage
                      ? "border-[#536471] text-white hover:bg-white/10"
                      : "border-[#333] text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <ChatCircleDots size={15} weight="bold" />
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name + username */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-white font-bold text-xl">{profile.name}</h2>
            {profile.isVerified && <SealCheck size={20} weight="fill" className="text-blue-400" />}
          </div>
          <p className="text-gray-500 text-sm">@{profile.username}</p>
          {profile.headline && <p className="text-gray-400 text-sm mt-0.5">{profile.headline}</p>}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          {profile.location && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin size={15} />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1 text-sm">
              <LinkIcon size={15} className="text-gray-500" />
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate max-w-[200px]">
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {profile.createdAt && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar size={15} />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Followers / Following */}
        <div className="flex gap-5 mb-3">
          <button className="flex items-center gap-1 hover:underline">
            <span className="text-white font-bold text-sm">{fmt(followingCount)}</span>
            <span className="text-gray-500 text-sm">Following</span>
          </button>
          <button className="flex items-center gap-1 hover:underline">
            <span className="text-white font-bold text-sm">{fmt(followersCount)}</span>
            <span className="text-gray-500 text-sm">Followers</span>
          </button>
        </div>

        {/* Follows you badge */}
        {!isOwnProfile && profile.followers?.includes(myId) && (
          <div className="mb-3">
            <span className="text-xs bg-[#202327] text-gray-300 border border-[#2f3336] rounded-full px-2.5 py-1">
              Follows you
            </span>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.skills.map(skill => (
              <span key={skill} className="text-xs bg-blue-900/30 text-blue-300 border border-blue-800/50 px-2.5 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Clan */}
        {profile.clanName && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-[#1a1a2e] border border-[#2f3336]">
            {profile.clanLogo && <img src={profile.clanLogo} alt={profile.clanName} className="w-8 h-8 rounded-full object-cover" />}
            <div>
              <p className="text-xs text-gray-500">Member of</p>
              <Link href="/dashboard/clans" className="text-white font-semibold text-sm hover:text-blue-400 transition-colors">
                {profile.clanName}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336] sticky top-[57px] bg-black z-10">
        {(["posts", "media"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors relative ${
              tab === t ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "media" ? (
              <span className="flex items-center justify-center gap-1.5">
                <ImageSquare size={16} /> Media
              </span>
            ) : t}
            {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="flex justify-center py-12">
          <SpinnerGap size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : tab === "posts" ? (
        posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-semibold text-gray-400">No posts yet</p>
            {isOwnProfile && <p className="text-sm mt-1">Share something with your followers!</p>}
          </div>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} myId={myId} />)
        )
      ) : (
        mediaPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ImageSquare size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-gray-400">No media yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {mediaPosts.map(post => (
              <div key={post._id} className="aspect-square overflow-hidden">
                <img src={(post.images || [])[0]} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
              </div>
            ))}
          </div>
        )
      )}

      <div className="h-20" />
    </div>
  );
}
