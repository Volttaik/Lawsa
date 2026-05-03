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
      <div className="flex gap-1 p-3 pt-safe" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-none" style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
          {story.authorImage ? <img src={story.authorImage} alt={story.authorName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{story.authorName?.[0]?.toUpperCase()}</div>}
        </div>
        <span className="text-white font-semibold text-sm">{story.authorName}</span>
        <span className="text-white/50 text-xs ml-1">{new Date(story.createdAt).toLocaleDateString()}</span>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-auto text-white/70 hover:text-white p-1"><X size={20} /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {story.image && <img src={story.image} alt="" className="max-w-full max-h-[55vh] rounded-2xl object-contain" />}
        {story.content && <p className="text-white text-xl font-semibold text-center leading-relaxed drop-shadow-lg max-w-sm">{story.content}</p>}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/80 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="bg-white dark:bg-gray-900 rounded-[2px] p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-900 dark:text-white">Add to Story</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button></div>
        {image && <div className="relative mb-3"><img src={image} alt="" className="w-full h-40 object-cover rounded-xl" /><button onClick={() => setImage(null)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"><X size={12} /></button></div>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's your story?" className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]" />
        <div className="flex items-center gap-2 mt-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium border border-black/10 dark:border-white/10">
            <Camera size={14} /> Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting || (!text.trim() && !image)} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">{submitting ? <Loader2 size={14} className="animate-spin" /> : null}Post Story</motion.button>
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
      fetch(`/api/users/${userId}`).then((r) => r.json()).then((d) => { if (d.user) setProfile(d.user); }),
      fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) setCurrentUser(d.user); }),
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
          fetch(`/api/users/${userId}`).then((r) => r.json()).then((d) => { if (d.user) setProfile(d.user); }),
          fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) setCurrentUser(d.user); }),
        ]);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    }
    setSaving(false);
  };

  const isOwnProfile = currentUser?._id === profile?._id;
  const canMessage = !!currentUser && !!profile && (currentUser.following || []).includes(profile._id) && (currentUser.followers || []).includes(profile._id);

  if (loading) return null;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="bg-transparent border-b border-black/8 dark:border-white/10 overflow-hidden mb-4">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden">
          {(bannerPreview || profile.bannerImage) && <img src={bannerPreview || profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar src={profileImagePreview || profile.profileImage} name={profile.name} size={88} />
            </div>
            <div className="flex gap-1.5 pb-1 flex-shrink-0">
              {isOwnProfile ? (
                <div className="flex gap-1.5"><button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all shadow-soft"><Edit3 size={14} /> Edit</button></div>
              ) : (
                <div className="flex gap-1.5">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFollow} disabled={followLoading} className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-[8px] border border-black/10 shadow-[0_1px_4px_0_rgba(0,0,0,0.08)] transition-all ${isFollowing ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}>{followLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}{isFollowing ? "Following" : "Follow"}</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => canMessage && router.push(`/dashboard/messages?userId=${profile._id}`)} disabled={!canMessage} className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-[8px] border border-black/10 dark:border-white/10 transition-all shadow-[0_1px_4px_0_rgba(0,0,0,0.08)] ${canMessage ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" : "text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-900"}`}>
                    <MessageCircle size={14} /> Message
                  </motion.button>
                </div>
              )}
            </div>
          </div>
          {profile.followers?.includes(currentUser?._id || "") && <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">Follows you</div>}
          {currentUser && profile.following?.includes(currentUser._id) && <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">Following</div>}
        </div>
      </motion.div>
    </div>
  );
}
