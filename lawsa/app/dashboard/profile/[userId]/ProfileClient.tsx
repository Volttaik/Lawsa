"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CalendarBlank, MapPin, Link as LinkIcon,
  SpinnerGap, SealCheck, ChatCircle, Heart, ArrowsClockwise,
  ShareNetwork, DotsThree, Trash, Camera, VideoCamera, Phone,
} from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import AvatarRing from "@/components/cosmetics/AvatarRing";
import UsernameCosmetic from "@/components/cosmetics/UsernameCosmetic";
import CosmeticBadge from "@/components/cosmetics/CosmeticBadge";
import ReactTimeago from "react-timeago";
import Linkify from "@/components/Linkify";
import ProgressiveImage from "@/components/ProgressiveImage";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/components/Toast";
import { useSession } from "@/components/SessionProvider";

interface UserProfile {
  _id: string; id?: string; name: string; username: string; email: string;
  bio?: string; profileImage?: string; bannerImage?: string; location?: string;
  website?: string; followers?: string[]; following?: string[];
  followersCount?: number; followingCount?: number; postsCount?: number;
  createdAt?: string; isVerified?: boolean;
}
interface Post {
  _id: string; authorId: string; authorName: string; authorUsername: string;
  authorImage?: string; content: string; images?: string[]; likes?: string[];
  comments?: any[]; commentsCount?: number; createdAt: string; reshares?: number; repostedFrom?: any;
}

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return (
    <img src={src} alt={name} loading="eager" decoding="async"
      className="rounded-full object-cover border-4 border-black flex-shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className={`rounded-full flex items-center justify-center text-white font-bold border-4 border-black flex-shrink-0 ${color}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}>
      {initials}
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function PostCard({ post, me, onLike, onRepost, onDelete }: any) {
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const myId = me?._id || me?.id || "";
  const liked = (post.likes || []).includes(myId);
  const imgs = post.repostedFrom?.images || post.images || [];
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const isAuthor = myId === post.authorId;
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/post/${post._id}`
    : `/post/${post._id}`;

  const cosm = (post as any).authorCosmetics;

  const BADGE_ACCENT: Record<string, string> = {
    badge_sovereign: "#f97316", badge_herald_purple: "#a855f7",
    badge_lion: "#fbbf24", badge_fist: "#b45309",
    badge_crown: "#fbbf24", badge_diamond: "#67e8f9",
    badge_fire: "#f97316", badge_lightning: "#a78bfa",
    badge_star: "#facc15", badge_crystal: "#38bdf8",
    badge_verified_plus: "#3b82f6", badge_amethyst: "#a855f7",
    badge_phoenix: "#f97316", badge_dragon: "#e879f9",
    badge_royal: "#8b5cf6", badge_warrior: "#ef4444",
    badge_azure: "#38bdf8", badge_inferno: "#fb923c",
    badge_frost: "#7dd3fc", badge_storm: "#a78bfa",
    badge_tidal: "#0ea5e9", badge_earth: "#22c55e",
    badge_galaxy: "#818cf8", badge_nova: "#fb923c",
    badge_solar: "#fbbf24", badge_lunar: "#e2e8f0",
    badge_void: "#7c3aed", badge_shadow: "#64748b",
    badge_demon: "#dc2626", badge_skull: "#94a3b8",
    badge_angel: "#fde68a", badge_divine: "#fbbf24",
    badge_tech: "#22d3ee", badge_neon: "#22d3ee",
    badge_matrix: "#22c55e", badge_gold: "#fbbf24",
    badge_ruby: "#f87171", badge_obsidian: "#7c3aed",
    badge_wind: "#34d399", badge_cosmic: "#818cf8",
    badge_crystal_herald: "#7dd3fc",
  };
  const badgeAccent = cosm?.badge ? BADGE_ACCENT[cosm.badge] : null;

  return (
    <article className="relative border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.02] transition-colors">
      {badgeAccent && (
        <div
          className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${badgeAccent}99, transparent)` }}
        />
      )}
      {post.repostedFrom && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-12">
          <ArrowsClockwise className="w-3.5 h-3.5 text-green-500" />
          <span>Reposted</span>
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${post.authorId}`} className="flex-shrink-0">
          <Avatar
            src={post.repostedFrom ? post.repostedFrom.authorImage : post.authorImage}
            name={post.authorName}
            size={40}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-white text-[15px]">
                {post.repostedFrom ? post.repostedFrom.authorName : post.authorName}
              </span>
              {cosm?.badge && <CosmeticBadge effectType={cosm.badge} size={22} />}
              {!(post as any).authorIsSpecial && post.isVerified && <SealCheck className="w-[18px] h-[18px] text-blue-400 flex-shrink-0" weight="fill" />}
              {(post as any).authorIsSpecial && <DiamondBadge size={17} />}
              {(post as any).authorIsSpecial && post.isVerified && <SealCheck className="w-[18px] h-[18px] text-amber-400 flex-shrink-0" weight="fill" />}
              <span className="text-gray-500 text-[15px]">
                @{post.repostedFrom ? post.repostedFrom.authorUsername : post.authorUsername}
              </span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-gray-500 text-sm"><ReactTimeago date={post.createdAt} /></span>
            </div>

            {isAuthor && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button onClick={() => setShowMenu(v => !v)} className="text-gray-500 hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-500/10 transition-colors">
                  <DotsThree className="w-5 h-5" weight="bold" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-gray-900 border border-white/10 rounded-2xl shadow-xl z-20 min-w-[140px] overflow-hidden">
                    <button onClick={() => { setShareOpen(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <ShareNetwork className="w-4 h-4" /> Share
                    </button>
                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {content && (
            <p className="text-white text-[15px] mt-0.5 leading-normal whitespace-pre-wrap break-words">
              <Linkify text={content} className="whitespace-pre-wrap break-words" linkClass="text-blue-400 hover:underline break-all" />
            </p>
          )}

          {imgs.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-[#2f3336] ${imgs.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
              {imgs.length === 1 ? (
                <ProgressiveImage src={imgs[0]} alt="" className="w-full max-h-[510px]" imgClassName="max-h-[510px]" />
              ) : (
                imgs.slice(0, 4).map((img: string, i: number) => (
                  <ProgressiveImage key={i} src={img} alt="" className="w-full h-36" imgClassName="h-36" />
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 max-w-[470px] text-gray-500">
            <button className="flex items-center gap-1.5 hover:text-blue-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <ChatCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{fmt((post.comments || []).length || post.commentsCount || 0)}</span>
            </button>

            <button onClick={() => { onRepost(post._id); toast("Reposted"); }} className="flex items-center gap-1.5 hover:text-green-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <ArrowsClockwise className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{fmt(post.reshares || 0)}</span>
            </button>

            <button
              onClick={() => { onLike(post._id); if (!(post.likes || []).includes(myId)) toast("Liked"); }}
              className={`flex items-center gap-1.5 group ${liked ? "text-pink-500" : "hover:text-pink-500"}`}
            >
              <div className={`p-2 -m-2 rounded-full transition-colors ${liked ? "bg-pink-500/10" : "group-hover:bg-pink-500/10"}`}>
                <Heart className="w-[18px] h-[18px]" weight={liked ? "fill" : "regular"} />
              </div>
              <span className="text-[13px]">{fmt((post.likes || []).length)}</span>
            </button>

            <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 hover:text-blue-400 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <ShareNetwork className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={`Post by ${post.authorName}`}
        text={content?.slice(0, 100) || ""}
      />
    </article>
  );
}

export default function ProfileClient({
  profile: initialProfile,
  initialPosts,
}: {
  profile: UserProfile;
  initialPosts: Post[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: sessionUser } = useSession();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [tab, setTab] = useState<"posts" | "replies" | "likes">("posts");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<HTMLInputElement>(null);

  const myId = sessionUser?._id || sessionUser?.id || "";
  const isOwnProfile = !!(sessionUser && (sessionUser._id === profile._id || sessionUser.id === profile._id));
  const canMessage = !!(sessionUser && !isOwnProfile &&
    (sessionUser.following ?? []).includes(profile._id) &&
    (profile.following ?? []).includes(myId));

  const initialIsFollowing = !!(myId && (profile.followers ?? []).includes(myId));
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [profileCosmetics, setProfileCosmetics] = useState<any>({});

  useEffect(() => {
    fetch(`/api/users/${profile._id}/cosmetics`)
      .then(r => r.ok ? r.json() : {})
      .then(d => setProfileCosmetics(d))
      .catch(() => {});
  }, [profile._id]);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/profile/${profile._id}`
    : `/dashboard/profile/${profile._id}`;

  const handleFollow = async () => {
    if (followLoading) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setProfile(prev => {
      const updated = wasFollowing
        ? (prev.followers ?? []).filter(id => id !== myId)
        : [...(prev.followers ?? []).filter(id => id !== myId), myId];
      return { ...prev, followers: updated, followersCount: updated.length };
    });
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${profile._id}/follow`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setIsFollowing(wasFollowing);
        toast("Could not update follow", "error");
        return;
      }
      const data = await res.json();
      if (typeof data.following === "boolean") setIsFollowing(data.following);
      toast(wasFollowing ? "Unfollowed" : `Following ${profile.name}`, "success");
    } catch {
      setIsFollowing(wasFollowing);
      toast("Network error", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!myId) return;
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const likes = p.likes || [];
      const liked = likes.includes(myId);
      return { ...p, likes: liked ? likes.filter(id => id !== myId) : [...likes, myId] };
    }));
    fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  const handleRepost = (postId: string) => {
    setPosts(prev => prev.map(p => p._id !== postId ? p : { ...p, reshares: (p.reshares || 0) + 1 }));
    fetch(`/api/posts/${postId}/repost`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
    toast("Post deleted", "info");
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const res = await fetch(`/api/users/${profile._id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ bannerImage: ev.target?.result }),
        });
        const data = await res.json();
        if (data.user) { setProfile(prev => ({ ...prev, bannerImage: data.user.bannerImage })); toast("Banner updated"); }
      } catch { toast("Upload failed", "error"); }
      setBannerUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const res = await fetch(`/api/users/${profile._id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ profileImage: ev.target?.result }),
        });
        const data = await res.json();
        if (data.user) { setProfile(prev => ({ ...prev, profileImage: data.user.profileImage })); toast("Profile photo updated"); }
      } catch { toast("Upload failed", "error"); }
      setProfileImageUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const followersCount = profile.followersCount ?? (profile.followers ?? []).length;
  const followingCount = profile.followingCount ?? (profile.following ?? []).length;
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen bg-black">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-4 border-b border-[#2f3336]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold text-white truncate">{profile.name}</h1>
            {profileCosmetics?.badge && <CosmeticBadge effectType={profileCosmetics.badge} size={18} />}
            {!(profile as any).isSpecial && profile.isVerified && <SealCheck className="w-5 h-5 text-blue-400 flex-shrink-0" weight="fill" />}
            {(profile as any).isSpecial && <DiamondBadge size={20} />}
            {(profile as any).isSpecial && profile.isVerified && <SealCheck className="w-5 h-5 text-amber-400 flex-shrink-0" weight="fill" />}
          </div>
          <p className="text-[13px] text-gray-500">{fmt(posts.length)} posts</p>
        </div>
        <button onClick={() => setShareOpen(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
          <ShareNetwork className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[200px] bg-[#333639] relative group overflow-hidden">
        {profile.bannerImage && (
          <ProgressiveImage src={profile.bannerImage} alt="Banner" className="w-full h-full" imgClassName="h-full" />
        )}
        {isOwnProfile && (
          <>
            <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            <button
              onClick={() => bannerFileRef.current?.click()}
              disabled={bannerUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {bannerUploading
                ? <SpinnerGap className="w-8 h-8 text-white animate-spin" />
                : <div className="flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
                    <Camera className="w-5 h-5" weight="fill" /> Change banner
                  </div>
              }
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="-mt-[67px] relative z-10 group/avatar">
            <AvatarRing effectType={profileCosmetics.avatarRing || ""} size={134}>
              <Avatar src={profile.profileImage} name={profile.name} size={134} />
            </AvatarRing>
            {isOwnProfile && (
              <>
                <input ref={profileImageFileRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                <button
                  onClick={() => profileImageFileRef.current?.click()}
                  disabled={profileImageUploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity border-4 border-black"
                >
                  {profileImageUploading
                    ? <SpinnerGap className="w-7 h-7 text-white animate-spin" />
                    : <Camera className="w-7 h-7 text-white" weight="fill" />
                  }
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap justify-end">
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
                  <>
                    <button
                      onClick={() => router.push(`/dashboard/messages?startWith=${profile._id}`)}
                      title="Message"
                      className="p-2 border border-[#536471] rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      <ChatCircle className="w-5 h-5" />
                    </button>
                    <button
                      title="Voice call"
                      onClick={() => { const sid = `${Date.now()}-${profile._id}`; router.push(`/dashboard/call/${profile._id}?role=caller&type=voice&session=${sid}`); }}
                      className="p-2 border border-[#536471] rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      title="Video call"
                      onClick={() => { const sid = `${Date.now()}-${profile._id}`; router.push(`/dashboard/call/${profile._id}?role=caller&type=video&session=${sid}`); }}
                      className="p-2 border border-[#536471] rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      <VideoCamera className="w-5 h-5" />
                    </button>
                  </>
                )}
                {sessionUser && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-70 ${
                      isFollowing
                        ? "border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {followLoading ? <SpinnerGap className="w-4 h-4 animate-spin" /> : isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-xl font-bold text-white">
              <UsernameCosmetic effectType={profileCosmetics.usernameEffect || ""} className="text-xl font-bold">
                {profile.name}
              </UsernameCosmetic>
            </h2>
            {profileCosmetics.badge && <CosmeticBadge effectType={profileCosmetics.badge} size={20} />}
            {!(profile as any).isSpecial && profile.isVerified && <SealCheck className="w-5 h-5 text-blue-400" weight="fill" />}
            {(profile as any).isSpecial && <DiamondBadge size={20} />}
            {(profile as any).isSpecial && profile.isVerified && <SealCheck className="w-5 h-5 text-amber-400 flex-shrink-0" weight="fill" />}
          </div>
          <p className="text-gray-500 text-[15px]">@{profile.username}</p>
        </div>

        {!isOwnProfile && sessionUser && (profile.following ?? []).includes(myId) && (
          <span className="inline-block mt-1.5 text-xs bg-[#2f3336] text-gray-400 px-2 py-0.5 rounded">Follows you</span>
        )}

        {profile.bio && <p className="text-white text-[15px] mt-3 leading-normal whitespace-pre-wrap">{profile.bio}</p>}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-gray-500 text-[15px]">
          {profile.location && (
            <span className="flex items-center gap-1.5"><MapPin className="w-[17px] h-[17px]" />{profile.location}</span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:underline"
            >
              <LinkIcon className="w-[17px] h-[17px]" />{profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {joinedDate && (
            <span className="flex items-center gap-1.5"><CalendarBlank className="w-[17px] h-[17px]" />Joined {joinedDate}</span>
          )}
        </div>

        <div className="flex gap-6 mt-3">
          <button className="hover:underline text-[15px]">
            <span className="font-bold text-white">{fmt(followingCount)}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </button>
          <button className="hover:underline text-[15px]">
            <span className="font-bold text-white">{fmt(followersCount)}</span>
            <span className="text-gray-500 ml-1">Follower{followersCount !== 1 ? "s" : ""}</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-[#2f3336] mt-1">
        {(["posts", "replies", "likes"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-4 text-sm font-semibold capitalize relative transition-colors ${
              tab === t ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
            }`}
          >
            {t}
            {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-blue-500 rounded-full" />}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-semibold text-gray-500">No posts yet</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            me={sessionUser}
            onLike={handleLike}
            onRepost={handleRepost}
            onDelete={handleDelete}
          />
        ))
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={profileUrl}
        title={`${profile.name}'s profile on LAWSA`}
        text={profile.bio || `Check out ${profile.name} on LAWSA`}
      />
    </div>
  );
}
