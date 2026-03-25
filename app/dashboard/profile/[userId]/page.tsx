"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Edit3, UserPlus, UserCheck, Loader2, MapPin, Link as LinkIcon, X, Save } from "lucide-react";

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
}

interface Post {
  _id: string;
  content: string;
  images?: string[];
  likes?: string[];
  createdAt: string;
}

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover border-4 border-white" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold border-4 border-white"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", skills: "" });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/posts/user/${userId}`).then((r) => r.json()).catch(() => ({ posts: [] })),
    ]).then(([profileData, meData, postsData]) => {
      const p = profileData.user;
      const me = meData.user;
      setProfile(p);
      setCurrentUser(me);
      setPosts(postsData.posts || []);
      if (p) setEditForm({ name: p.name || "", bio: p.bio || "", skills: (p.skills || []).join(", ") });
      if (me && p) setIsFollowing(p.followers?.includes(me._id) || false);
      setLoading(false);
    });
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    setFollowLoading(true);
    const res = await fetch(`/api/users/${profile._id}/follow`, { method: "POST" });
    const data = await res.json();
    setIsFollowing(data.following);
    setProfile((prev) => {
      if (!prev) return prev;
      const followers = data.following
        ? [...(prev.followers || []), currentUser._id]
        : (prev.followers || []).filter((id) => id !== currentUser._id);
      return { ...prev, followers };
    });
    setFollowLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;
    setSaving(true);
    const updates: Record<string, any> = {
      name: editForm.name,
      bio: editForm.bio,
      skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (profileImagePreview) updates.profileImage = profileImagePreview;
    if (bannerPreview) updates.bannerImage = bannerPreview;

    const res = await fetch(`/api/users/${profile._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.user) {
      setProfile(data.user);
      setEditing(false);
      setProfileImagePreview(null);
      setBannerPreview(null);
    }
    setSaving(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={28} />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-black/10 shadow-card overflow-hidden mb-4"
      >
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden">
          {(bannerPreview || profile.bannerImage) && (
            <img src={bannerPreview || profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && editing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-2 bg-white/90 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg">
                <Camera size={16} /> Change Banner
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
            </label>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <Avatar src={profileImagePreview || profile.profileImage} name={profile.name} size={88} />
              {isOwnProfile && editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "profile")} />
                </label>
              )}
            </div>
            <div className="flex gap-2 pb-1">
              {isOwnProfile ? (
                editing ? (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setProfileImagePreview(null); setBannerPreview(null); }}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-black/10 text-gray-600 hover:bg-gray-50 transition-all">
                      <X size={15} /> Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 text-white border border-black/10 hover:bg-blue-700 transition-all shadow-btn disabled:opacity-70">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-black/10 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all shadow-soft">
                    <Edit3 size={15} /> Edit Profile
                  </button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-xl border border-black/10 shadow-btn transition-all ${isFollowing ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {followLoading ? <Loader2 size={15} className="animate-spin" /> : isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
                  {isFollowing ? "Following" : "Follow"}
                </motion.button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Tell people about yourself..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Skills (comma-separated)</label>
                <input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, TypeScript, Design..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-500 mb-2">@{profile.username}</p>
              {profile.bio && <p className="text-sm text-gray-700 leading-relaxed mb-3">{profile.bio}</p>}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{profile.followers?.length || 0}</div>
                  <div className="text-gray-500 text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{profile.following?.length || 0}</div>
                  <div className="text-gray-500 text-xs">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{posts.length}</div>
                  <div className="text-gray-500 text-xs">Posts</div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Posts Section */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Posts</h2>
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/10 shadow-card p-10 text-center text-gray-400 text-sm">
          No posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div key={post._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-black/10 shadow-card p-4">
              <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {post.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="rounded-xl object-cover w-full max-h-48 border border-black/5" />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/5 text-xs text-gray-500">
                <span>❤️ {post.likes?.length || 0} likes</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
