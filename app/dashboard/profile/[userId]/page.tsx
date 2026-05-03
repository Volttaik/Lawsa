"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CalendarBlank, MapPin, Link as LinkIcon, UserPlus, UserCheck, 
  SpinnerGap, SealCheck, ChatCircle, Heart, ArrowsClockwise, ShareNetwork,
  DotsThree, PencilSimple, Trash
} from "@phosphor-icons/react";
import ReactTimeago from "react-timeago";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
  skills?: string[];
  followers?: string[];
  following?: string[];
  createdAt?: string;
  isVerified?: boolean;
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
  createdAt: string;
  reshares?: number;
  repostedFrom?: any;
}

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover border-4 border-black" style={{ width: size, height: size }} />;
  return <img src="/logo.jpg" alt="Sosa" className="rounded-full object-cover border-4 border-black" style={{ width: size, height: size }} />;
}

function fmt(n: number) { if (n >= 1000000) return (n/1000000).toFixed(1)+"M"; if (n >= 1000) return (n/1000).toFixed(1)+"K"; return String(n); }

function PostCard({ post, me, onLike, onRepost, onDelete }: any) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const liked = (post.likes || []).includes(me?.id || me?._id || "");
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const MAX = 280;
  const isAuthor = (me?.id === post.authorId || me?._id === post.authorId);

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: "Sosa", text: content, url: `${window.location.origin}/dashboard?post=${post._id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard?post=${post._id}`);
    }
    setShowMenu(false);
  };

  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.03] transition-colors">
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-12">
          <ArrowsClockwise className="w-3.5 h-3.5" />
          <span>Reposted</span>
        </div>
      )}
      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${post.authorId}`} className="flex-shrink-0">
          <Avatar src={post.repostedFrom ? post.repostedFrom.authorImage : post.authorImage} name={post.authorName} size={40} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-white text-[15px]">{post.repostedFrom ? post.repostedFrom.authorName : post.authorName}</span>
              {post.isVerified && <SealCheck className="w-[18px] h-[18px] text-blue-400" weight="fill" />}
              <span className="text-gray-500 text-[15px]">@{post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername}</span>
              <span className="text-gray-500 text-[15px]">·</span>
              <span className="text-gray-500 text-[15px] hover:underline"><ReactTimeago date={post.createdAt} /></span>
            </div>
            {isAuthor && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-500/10">
                  <DotsThree className="w-5 h-5" weight="bold" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-black border border-[#2f3336] rounded-xl shadow-xl z-20 min-w-[140px] overflow-hidden">
                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-white/5">
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {content && (
            <p className="text-white text-[15px] mt-0.5 leading-normal whitespace-pre-wrap break-words">
              {!expanded && content.length > MAX ? <>{content.slice(0, MAX)}<button onClick={() => setExpanded(true)} className="text-blue-400 ml-1">Show more</button></> : content}
            </p>
          )}
          {imgs.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-[#2f3336] ${imgs.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
              {imgs.length === 1 ? (
                <img src={imgs[0]} alt="" className="w-full max-h-[510px] object-cover" />
              ) : (
                imgs.slice(0, 4).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-[144px] object-cover" />
                ))
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 max-w-[425px] text-gray-500">
            <button className="flex items-center gap-1 hover:text-blue-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10"><ChatCircle className="w-[18px] h-[18px]" /></div>
              <span className="text-[13px] min-w-[20px]">{fmt((post.comments || []).length)}</span>
            </button>
            <button onClick={() => onRepost(post._id)} className="flex items-center gap-1 hover:text-green-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-green-500/10"><ArrowsClockwise className="w-[18px] h-[18px]" /></div>
              <span className="text-[13px] min-w-[20px]">{fmt(post.reshares || 0)}</span>
            </button>
            <button onClick={() => onLike(post._id)} className={`flex items-center gap-1 group ${liked ? "text-pink-500" : "hover:text-pink-500"}`}>
              <div className={`p-2 -m-2 rounded-full ${liked ? "bg-pink-500/10" : "group-hover:bg-pink-500/10"}`}>
                <Heart className="w-[18px] h-[18px]" weight={liked ? "fill" : "regular"} />
              </div>
              <span className="text-[13px] min-w-[20px]">{fmt((post.likes || []).length)}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-1 hover:text-blue-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10"><ShareNetwork className="w-[18px] h-[18px]" /></div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "replies" | "likes">("posts");

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profileRes, meRes] = await Promise.all([
        fetch(`/api/users/${userId}`).then(r => r.json()),
        fetch("/api/auth/me").then(r => r.json()),
      ]);
      if (profileRes.user) setProfile(profileRes.user);
      if (meRes.user) setCurrentUser(meRes.user);
      if (profileRes.user && meRes.user) {
        setIsFollowing((meRes.user.following || []).includes(profileRes.user._id));
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
    setLoading(false);
  }, [userId]);

  const loadPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/posts/user/${userId}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
    setPostsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
    loadPosts();
  }, [loadData, loadPosts]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${profile._id}/follow`, { method: "POST", credentials: "include" });
      const data = await res.json();
      setIsFollowing(!!data.following);
      await loadData();
    } catch (err) {
      console.error("Follow failed", err);
    }
    setFollowLoading(false);
  };

  const handleMessage = () => {
    if (!profile) return;
    router.push(`/dashboard/messages?startWith=${profile._id}`);
  };

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" });
    loadPosts();
  };

  const handleRepost = async (postId: string) => {
    await fetch(`/api/posts/${postId}/repost`, { method: "POST", credentials: "include" });
    loadPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const isOwnProfile = currentUser?._id === profile?._id;
  const canMessage = !!currentUser && !!profile && !isOwnProfile &&
    (currentUser.following || []).includes(profile._id) && 
    (profile.following || []).includes(currentUser._id);

  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto flex items-center justify-center min-h-screen">
        <SpinnerGap className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const joinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;

  return (
    <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-6 border-b border-[#2f3336]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
            {profile.isVerified && <SealCheck className="w-5 h-5 text-blue-400" weight="fill" />}
          </div>
          <p className="text-[13px] text-gray-500">{posts.length} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-[200px] bg-[#333639] relative">
        {profile.bannerImage && (
          <img src={profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-3">
        {/* Avatar + Actions */}
        <div className="flex justify-between items-start">
          <div className="-mt-[67px] relative z-10">
            <Avatar src={profile.profileImage} name={profile.name} size={134} />
          </div>
          <div className="flex gap-2 mt-3">
            {isOwnProfile ? (
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="px-4 py-1.5 border border-[#536471] rounded-full text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <>
                {canMessage && (
                  <button
                    onClick={handleMessage}
                    className="p-2 border border-[#536471] rounded-full text-white hover:bg-white/10 transition-colors"
                  >
                    <ChatCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors ${
                    isFollowing
                      ? "border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {followLoading ? (
                    <SpinnerGap className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + Handle */}
        <div className="mt-3">
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            {profile.isVerified && <SealCheck className="w-5 h-5 text-blue-400" weight="fill" />}
          </div>
          <p className="text-gray-500 text-[15px]">@{profile.username}</p>
        </div>

        {/* Follows you badge */}
        {!isOwnProfile && (profile.following || []).includes(currentUser?._id || "") && (
          <span className="inline-block mt-2 text-xs bg-[#2f3336] text-gray-400 px-2 py-0.5 rounded">
            Follows you
          </span>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-white text-[15px] mt-3 leading-normal whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-gray-500 text-[15px]">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-[18px] h-[18px]" />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
              <LinkIcon className="w-[18px] h-[18px]" />
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {joinedDate && (
            <span className="flex items-center gap-1">
              <CalendarBlank className="w-[18px] h-[18px]" />
              Joined {joinedDate}
            </span>
          )}
        </div>

        {/* Following/Followers */}
        <div className="flex gap-5 mt-3">
          <Link href={`/dashboard/profile/${profile._id}/following`} className="hover:underline">
            <span className="text-white font-bold">{fmt((profile.following || []).length)}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </Link>
          <Link href={`/dashboard/profile/${profile._id}/followers`} className="hover:underline">
            <span className="text-white font-bold">{fmt((profile.followers || []).length)}</span>
            <span className="text-gray-500 ml-1">Followers</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        {(["posts", "replies", "likes"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-4 text-[15px] font-medium relative transition-colors ${
              tab === t ? "text-white" : "text-gray-500 hover:bg-white/[0.03]"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tab === t && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <SpinnerGap className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-[15px]">
              {isOwnProfile ? "You haven't posted yet" : `@${profile.username} hasn't posted yet`}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              me={currentUser}
              onLike={handleLike}
              onRepost={handleRepost}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:h-4" />
    </div>
  );
}
