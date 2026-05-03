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

function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover border-4 border-white" style={{ width: size, height: size }} />;
  return <img src="/logo.jpg" alt="Sosa" className="rounded-full object-cover border-4 border-white" style={{ width: size, height: size }} />;
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    const [profileData, meData] = await Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    if (profileData.user) setProfile(profileData.user);
    if (meData.user) setCurrentUser(meData.user);
    if (profileData.user && meData.user) setIsFollowing((meData.user.following || []).includes(profileData.user._id));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleFollow = async () => {
    if (!profile) return;
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

  const isOwnProfile = currentUser?._id === profile?._id;
  const canMessage = !!currentUser && !!profile && (currentUser.following || []).includes(profile._id) && (profile.following || []).includes(currentUser._id);

  if (loading) return null;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="bg-transparent border-b border-black/8 dark:border-white/10 overflow-hidden mb-4">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden">
          {profile.bannerImage && <img src={profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar src={profile.profileImage} name={profile.name} size={88} />
            </div>
            <div className="flex gap-1.5 pb-1 flex-shrink-0">
              {isOwnProfile ? (
                <div className="flex gap-1.5"><button onClick={() => router.push(`/dashboard/settings`)} className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all shadow-soft"><Edit3 size={14} /> Edit</button></div>
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
