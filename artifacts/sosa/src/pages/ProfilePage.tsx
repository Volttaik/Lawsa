import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { SealCheck, MapPin, Link as LinkIcon, Calendar, Envelope, Heart, ChatCircle, ArrowsClockwise, ShareNetwork, SpinnerGap, DotsThree, Trash, UserPlus, Check, Users } from "@phosphor-icons/react";
import DiamondBadge from "@/components/DiamondBadge";
import Linkify from "@/components/Linkify";
import { useSession } from "@/components/SessionProvider";
import { timeAgo, fmtCount } from "@/lib/utils";

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0 border-4 border-black" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold border-4 border-black ${color}`} style={{ width: size, height: size, fontSize: Math.max(12, size * 0.35) }}>{initials}</div>;
}

function PostCard({ post, me, onLike, onDelete }: any) {
  const myId = me?.id || me?._id || "";
  const liked = (post.likes || []).includes(myId);
  const isAuthor = myId === post.authorId;
  const content = post.repostedFrom ? post.repostedFrom.content : post.content;
  const imgs = post.repostedFrom?.images || post.images || [];
  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex gap-3">
        <Avatar src={post.authorImage} name={post.authorName} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-sm">{post.authorName}</span>
              {post.authorIsSpecial && <DiamondBadge size={13} />}
              {!post.authorIsSpecial && post.authorIsVerified && <SealCheck size={13} weight="fill" className="text-blue-400" />}
              <span className="text-gray-500 text-xs">@{post.authorUsername} · {timeAgo(post.createdAt)}</span>
            </div>
            {isAuthor && (
              <button onClick={() => onDelete(post._id)} className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"><Trash size={14} /></button>
            )}
          </div>
          {content && <p className="text-white text-sm leading-relaxed mb-2 whitespace-pre-wrap"><Linkify text={content} /></p>}
          {imgs.length > 0 && (
            <div className={`grid gap-1 mb-2 rounded-xl overflow-hidden ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {imgs.slice(0, 4).map((img: string, i: number) => <img key={i} src={img} alt="" className="w-full object-cover" style={{ maxHeight: imgs.length === 1 ? 400 : 200 }} />)}
            </div>
          )}
          <div className="flex items-center gap-6 mt-2">
            <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}>
              <Heart size={16} weight={liked ? "fill" : "regular"} /><span className="text-xs">{fmtCount(post.likes?.length || 0)}</span>
            </button>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm"><ChatCircle size={16} /><span className="text-xs">{fmtCount(post.comments?.length || 0)}</span></div>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm"><ArrowsClockwise size={16} /><span className="text-xs">{fmtCount(post.reshares || 0)}</span></div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const { user: me } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "media" | "likes">("posts");
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const myId = me?.id || me?._id || "";
  const isMe = params?.userId === myId;

  useEffect(() => {
    if (!params?.userId) return;
    setLoading(true); setPostsLoading(true);
    Promise.all([
      fetch(`/api/users/${params.userId}`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/posts?authorId=${params.userId}&limit=30`, { credentials: "include" }).then(r => r.json()),
    ]).then(([userData, postsData]) => {
      if (userData.user) {
        setProfile(userData.user);
        setFollowing((userData.user.followers || []).includes(myId));
      }
      setPosts(postsData.posts || []);
    }).catch(() => {}).finally(() => { setLoading(false); setPostsLoading(false); });
  }, [params?.userId, myId]);

  const handleFollow = async () => {
    if (!me || !profile || isMe) return;
    setFollowLoading(true);
    const res = await fetch(`/api/users/${profile.id}/follow`, { method: "POST", credentials: "include" }).then(r => r.json()).catch(() => ({}));
    if (res.following !== undefined) {
      setFollowing(res.following);
      setProfile((p: any) => ({ ...p, followersCount: (p.followersCount || 0) + (res.following ? 1 : -1) }));
    }
    setFollowLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!me) return;
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const likes: string[] = p.likes || [];
      const liked = likes.includes(myId);
      return { ...p, likes: liked ? likes.filter((id: string) => id !== myId) : [...likes, myId] };
    }));
    fetch(`/api/posts/${postId}/like`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  const handleDelete = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE", credentials: "include" });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const share = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/profile/${params?.userId}`).then(() => { setShareMsg("Link copied!"); setTimeout(() => setShareMsg(""), 2000); });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>;
  if (!profile) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">User not found</div>;

  const mediaPosts = posts.filter(p => (p.images?.length || 0) > 0 || (p.videos?.length || 0) > 0);
  const likedPosts = posts.filter(p => (p.likes || []).includes(myId));
  const displayPosts = tab === "posts" ? posts : tab === "media" ? mediaPosts : likedPosts;

  return (
    <div className="max-w-[600px] mx-auto min-h-screen border-x border-[#2f3336]">
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-indigo-900 to-purple-900 overflow-hidden">
          {profile.bannerImage && <img src={profile.bannerImage} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative"><Avatar src={profile.profileImage} name={profile.name} size={80} /></div>
            <div className="flex gap-2 pt-14">
              <button onClick={share} className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                <ShareNetwork size={18} className="text-white" />
              </button>
              {isMe
                ? <Link href="/dashboard/settings" className="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors">Edit profile</Link>
                : me && (
                  <div className="flex gap-2">
                    <Link href={`/dashboard/messages/${profile.id}`} className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"><Envelope size={18} className="text-white" /></Link>
                    <button onClick={handleFollow} disabled={followLoading}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 ${following ? "border border-white/20 text-white hover:bg-white/10 hover:text-red-400 hover:border-red-500/30" : "bg-white text-black hover:bg-gray-200"}`}>
                      {followLoading ? <SpinnerGap size={14} className="animate-spin" /> : following ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                    </button>
                  </div>
                )
              }
              {shareMsg && <span className="text-green-400 text-xs self-center">{shareMsg}</span>}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white">{profile.name}</h1>
              {profile.isSpecial && <DiamondBadge size={16} />}
              {!profile.isSpecial && profile.isVerified && <SealCheck size={18} weight="fill" className="text-blue-400" />}
            </div>
            <p className="text-gray-500">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap"><Linkify text={profile.bio} /></p>}
          {profile.headline && <p className="text-gray-400 text-sm mb-2">{profile.headline}</p>}

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
            {profile.location && <div className="flex items-center gap-1"><MapPin size={14} />{profile.location}</div>}
            {profile.website && <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline"><LinkIcon size={14} />{profile.website}</a>}
            {profile.createdAt && <div className="flex items-center gap-1"><Calendar size={14} />Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>}
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5"><span className="text-white font-bold">{fmtCount(profile.followingCount || 0)}</span><span className="text-gray-500">Following</span></div>
            <div className="flex items-center gap-1.5"><span className="text-white font-bold">{fmtCount(profile.followersCount || 0)}</span><span className="text-gray-500">Followers</span></div>
            {profile.clanName && <Link href="/dashboard/clans" className="flex items-center gap-1.5 text-indigo-400 hover:underline"><Users size={14} />{profile.clanName}</Link>}
          </div>
        </div>

        <div className="flex border-t border-[#2f3336] border-b">
          {(["posts","media","likes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-bold capitalize border-b-2 transition-colors ${tab === t ? "border-white text-white" : "border-transparent text-gray-500 hover:text-white"}`}>{t}</button>
          ))}
        </div>
      </div>

      {postsLoading ? <div className="flex items-center justify-center py-12"><SpinnerGap size={24} className="animate-spin text-blue-500" /></div>
      : displayPosts.length === 0 ? <div className="text-center py-12 text-gray-500">No {tab} yet</div>
      : displayPosts.map(post => <PostCard key={post._id} post={post} me={me} onLike={handleLike} onDelete={handleDelete} />)}
    </div>
  );
}
