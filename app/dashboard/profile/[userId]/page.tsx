"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Edit3, UserPlus, UserCheck, Loader2, X, Save,
  Shield, ChevronRight, Plus, BookOpen, MessageCircle, Share2, Check, Heart,
} from "lucide-react";
import { uploadFile } from "@/lib/uploadClient";
import VideoPlayer from "@/components/VideoPlayer";
import Linkify from "@/components/Linkify";

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
  clanId?: string;
  clanName?: string;
  clanLogo?: string;
}

interface Post {
  _id: string;
  content: string;
  images?: string[];
  videos?: string[];
  likes?: string[];
  createdAt: string;
}

interface Story {
  _id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  image?: string;
  createdAt: string;
}

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover border-4 border-white" style={{ width: size, height: size }} />;
  return <img src="/logo.jpg" alt="Sosa" className="rounded-full object-cover border-4 border-white" style={{ width: size, height: size }} />;
}

function StoryViewer({ stories, startIndex, onClose }: { stories: Story[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (current < stories.length - 1) { setCurrent((c) => c + 1); return 0; }
          else { onClose(); return 100; }
        }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [current]);

  const story = stories[current];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black flex flex-col"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) {
          if (current > 0) { setCurrent(current - 1); setProgress(0); }
        } else {
          if (current < stories.length - 1) { setCurrent(current + 1); setProgress(0); }
          else onClose();
        }
      }}
    >
      {/* Progress bars */}
      <div className="flex gap-1 p-3 pt-safe" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
          {story.authorImage
            ? <img src={story.authorImage} alt={story.authorName} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{story.authorName?.[0]?.toUpperCase()}</div>
          }
        </div>
        <span className="text-white font-semibold text-sm">{story.authorName}</span>
        <span className="text-white/50 text-xs ml-1">{new Date(story.createdAt).toLocaleDateString()}</span>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-auto text-white/70 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Story content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {story.image && (
          <img src={story.image} alt="" className="max-w-full max-h-[55vh] rounded-2xl object-contain" />
        )}
        {story.content && (
          <p className="text-white text-xl font-semibold text-center leading-relaxed drop-shadow-lg max-w-sm">
            {story.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function CreateStoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    setSubmitting(true);
    await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, image }),
    });
    setSubmitting(false);
    onCreated();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/80 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="bg-white dark:bg-gray-900 rounded-[2px] p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Add to Story</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        {image && (
          <div className="relative mb-3">
            <img src={image} alt="" className="w-full h-40 object-cover rounded-xl" />
            <button onClick={() => setImage(null)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
              <X size={12} />
            </button>
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's your story?"
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
        />
        <div className="flex items-center gap-2 mt-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium border border-black/10 dark:border-white/10">
            <Camera size={14} /> Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting || (!text.trim() && !image)}
            className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Post Story
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", skills: "" });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "stories">("posts");
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);

  const handleShareProfile = () => {
    const url = `${window.location.origin}/dashboard/profile/${userId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setProfileLinkCopied(true);
    setTimeout(() => setProfileLinkCopied(false), 2200);
  };

  const loadData = () => {
    if (!userId) return;
    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/posts/user/${userId}`).then((r) => r.json()).catch(() => ({ posts: [] })),
      fetch(`/api/stories/user/${userId}`).then((r) => r.json()).catch(() => ({ stories: [] })),
    ]).then(([profileData, meData, postsData, storiesData]) => {
      const p = profileData.user;
      const me = meData.user;
      setProfile(p);
      setCurrentUser(me);
      setPosts(postsData.posts || []);
      setStories(storiesData.stories || []);
      if (p) setEditForm({ name: p.name || "", bio: p.bio || "", skills: (p.skills || []).join(", ") });
      if (me && p) setIsFollowing(p.followers?.includes(me._id) || false);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    setFollowLoading(true);
    const res = await fetch(`/api/users/${profile._id}/follow`, { method: "POST" });
    const data = await res.json();
    setIsFollowing(!!data.following);
    await Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()).then((d) => {
        if (d.user) setProfile(d.user);
      }),
      fetch("/api/auth/me").then((r) => r.json()).then((d) => {
        if (d.user) setCurrentUser(d.user);
      }),
    ]);
    setFollowLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        name: editForm.name,
        bio: editForm.bio,
        skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (profileImageFile) {
        const url = await uploadFile(profileImageFile, "profiles");
        updates.profileImage = url;
      }
      if (bannerImageFile) {
        const url = await uploadFile(bannerImageFile, "banners");
        updates.bannerImage = url;
      }

      const res = await fetch(`/api/users/${profile._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.user) {
        setEditing(false);
        setProfileImagePreview(null);
        setBannerPreview(null);
        setProfileImageFile(null);
        setBannerImageFile(null);
        await Promise.all([
          fetch(`/api/users/${userId}`).then((r) => r.json()).then((d) => {
            if (d.user) setProfile(d.user);
          }),
          fetch("/api/auth/me").then((r) => r.json()).then((d) => {
            if (d.user) setCurrentUser(d.user);
          }),
        ]);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    }
    setSaving(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "profile") setProfileImageFile(file);
    else setBannerImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "profile") setProfileImagePreview(reader.result as string);
      else setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isOwnProfile = currentUser?._id === profile?._id;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Card Skeleton */}
        <div className="bg-transparent border-b border-black/8 dark:border-white/10 overflow-hidden">
          <div className="skeleton w-full h-40" style={{ borderRadius: 0 }} />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="skeleton rounded-full flex-shrink-0" style={{ width: 88, height: 88 }} />
              <div className="skeleton h-9 w-24 rounded-xl" />
            </div>
            <div className="skeleton h-5 w-1/3 mb-2" />
            <div className="skeleton h-3.5 w-1/4 mb-3" />
            <div className="skeleton h-3.5 w-4/5 mb-1" />
            <div className="skeleton h-3.5 w-3/5 mb-4" />
            <div className="flex gap-3 mb-4">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-6 w-20 rounded-full" />)}
            </div>
            <div className="flex gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-1">
                  <div className="skeleton h-5 w-8 mx-auto" />
                  <div className="skeleton h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Tab Skeleton */}
        <div className="skeleton h-12 w-full rounded-2xl" />
        {/* Post Skeletons */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-transparent border-b border-black/8 dark:border-white/10 p-4 space-y-3">
            <div className="skeleton h-40 w-full rounded-xl" />
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3.5 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-transparent border-b border-black/8 dark:border-white/10 overflow-hidden mb-4"
      >
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden">
          {(bannerPreview || profile.bannerImage) && (
            <img src={bannerPreview || profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && editing && (
            <label className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-colors">
              <div className="flex items-center gap-2 bg-white/95 text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
                <Camera size={16} /> Change Banner
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
            </label>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar src={profileImagePreview || profile.profileImage} name={profile.name} size={88} />
              {isOwnProfile && editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "profile")} />
                </label>
              )}
            </div>
            <div className="flex gap-1.5 pb-1 flex-shrink-0">
              {isOwnProfile ? (
                editing ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditing(false); setProfileImagePreview(null); setBannerPreview(null); }}
                      className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-btn disabled:opacity-70">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all shadow-soft">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={handleShareProfile}
                      className={`flex items-center justify-center w-9 h-9 rounded-xl border shadow-soft transition-all ${profileLinkCopied ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20" : "border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600"}`}>
                      {profileLinkCopied ? <Check size={14} /> : <Share2 size={14} />}
                    </button>
                  </div>
                )
              ) : (
                <div className="flex gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-[8px] border border-black/10 shadow-[0_1px_4px_0_rgba(0,0,0,0.08)] transition-all ${isFollowing ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {followLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? "Following" : "Follow"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/dashboard/messages?userId=${profile._id}`)}
                    className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-[8px] border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-[0_1px_4px_0_rgba(0,0,0,0.08)] transition-all"
                  >
                    <MessageCircle size={14} />
                    Message
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShareProfile}
                    className={`flex items-center justify-center w-9 h-9 rounded-[8px] border shadow-[0_1px_4px_0_rgba(0,0,0,0.08)] transition-all flex-shrink-0 ${profileLinkCopied ? "border-green-400 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" : "border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    {profileLinkCopied ? <Check size={14} /> : <Share2 size={14} />}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Clan badge */}
          {profile.clanId && (
            <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl px-3 py-2 w-fit">
              {profile.clanLogo ? (
                <img src={profile.clanLogo} alt={profile.clanName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <Shield size={14} className="text-indigo-500" />
              )}
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{profile.clanName}</span>
            </div>
          )}

          {/* Profile Info */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Tell people about yourself..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Skills (comma-separated)</label>
                <input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, TypeScript, Design..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{profile.username}</p>
              {profile.bio && <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{profile.bio}</p>}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{profile.followers?.length || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{profile.following?.length || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{posts.length}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{stories.length}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Stories</div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Tab Switch */}
      <div className="flex gap-1 mb-4 bg-transparent border-b border-black/8 dark:border-white/10 p-1.5">
        {[
          { key: "posts", label: "Posts" },
          { key: "stories", label: "Stories" },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setActiveTab(tab.key as "posts" | "stories")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                : "text-gray-500 dark:text-gray-400 hover:bg-[#f0f2f5] dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div>
          {posts.length === 0 ? (
            <div className="bg-transparent border-b border-black/8 dark:border-white/10 p-10 text-center text-gray-400 text-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f2f5] dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={20} className="text-gray-300 dark:text-gray-600" />
              </div>
              No posts yet.
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -1, boxShadow: "0 8px 24px 0 rgba(0,0,0,0.10)" }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-transparent border-b border-black/8 dark:border-white/10 p-4"
                >
                  <Linkify text={post.content} className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words" />
                  {post.images && post.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.images.map((img, j) => (
                        <img key={j} src={img} alt="" className="rounded-xl object-cover w-full max-h-48 border border-black/5" />
                      ))}
                    </div>
                  )}
                  {post.videos && post.videos.length > 0 && (
                    <div className="mt-3 space-y-2 overflow-hidden rounded-xl">
                      {post.videos.map((vid, j) => (
                        <VideoPlayer key={j} src={vid} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart size={11} className="fill-red-400 text-red-400" /> {post.likes?.length || 0}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === "stories" && (
        <div>
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setShowCreateStory(true)}
              className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all mb-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="font-semibold text-sm">Add to your story</span>
            </motion.button>
          )}

          {stories.length === 0 ? (
            <div className="bg-transparent border-b border-black/8 dark:border-white/10 p-10 text-center text-gray-400 text-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f2f5] dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={20} className="text-gray-300 dark:text-gray-600" />
              </div>
              No stories yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stories.map((story, i) => (
                <motion.button
                  key={story._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setViewingStory(i)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-card text-left"
                >
                  {story.image && (
                    <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium line-clamp-3 leading-relaxed">{story.content || "📸"}</p>
                    <p className="text-white/50 text-[10px] mt-1">{new Date(story.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            startIndex={viewingStory}
            onClose={() => setViewingStory(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateStory && (
          <CreateStoryModal
            onClose={() => setShowCreateStory(false)}
            onCreated={loadData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
