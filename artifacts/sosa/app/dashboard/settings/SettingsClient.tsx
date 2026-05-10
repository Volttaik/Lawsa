"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Shield, SignOut, SpinnerGap, Check, Eye, EyeSlash, Camera, EnvelopeSimple, SealCheck } from "@phosphor-icons/react";
import { useSession } from "@/components/SessionProvider";

function SettingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className="border-b border-white/10 p-6">
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-700"}`}>
      <span className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

const NOTIFICATION_ITEMS = [
  { label: "Likes on your posts", desc: "When someone likes your post" },
  { label: "Comments on your posts", desc: "When someone comments on your post" },
  { label: "New followers", desc: "When someone follows you" },
  { label: "Direct messages", desc: "When you receive a message" },
  { label: "Connection requests", desc: "When someone wants to connect" },
];

const PRIVACY_ITEMS = [
  { label: "Public Profile", desc: "Allow anyone to view your profile" },
  { label: "Show online status", desc: "Let others know when you're active" },
  { label: "Allow messages from non-followers", desc: "Receive messages from anyone" },
];

export default function SettingsClient() {
  const { user, updateUser, logout, refreshUser } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [notifToggles, setNotifToggles] = useState<boolean[]>(NOTIFICATION_ITEMS.map(() => true));
  const [privacyToggles, setPrivacyToggles] = useState<boolean[]>(PRIVACY_ITEMS.map(() => true));
  const [verifySending, setVerifySending] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState<string | undefined>(user?.profileImage);
  const [localBannerImage, setLocalBannerImage] = useState<string | undefined>(user?.bannerImage);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setProfileImageUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string;
      try {
        const id = user._id || user.id;
        const res = await fetch(`/api/users/${id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ profileImage: dataUrl }),
        });
        const data = await res.json();
        if (data.user) {
          setLocalProfileImage(data.user.profileImage);
          updateUser({ profileImage: data.user.profileImage });
        }
      } catch {}
      setProfileImageUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBannerUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string;
      try {
        const id = user._id || user.id;
        const res = await fetch(`/api/users/${id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ bannerImage: dataUrl }),
        });
        const data = await res.json();
        if (data.user) {
          setLocalBannerImage(data.user.bannerImage);
          updateUser({ bannerImage: data.user.bannerImage });
        }
      } catch {}
      setBannerUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    if (!verifySent || user?.emailVerified) return;
    const onFocus = () => { refreshUser(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [verifySent, user?.emailVerified, refreshUser]);

  const handleSendVerification = async () => {
    setVerifySending(true);
    setVerifyError("");
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) { setVerifySent(true); setTimeout(() => setVerifySent(false), 6000); }
      else setVerifyError(data.error || "Failed to send email.");
    } catch { setVerifyError("Something went wrong. Please try again."); }
    setVerifySending(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const id = user._id || user.id;
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: profileForm.name, bio: profileForm.bio }),
    });
    const data = await res.json();
    if (data.user) {
      updateUser({ name: profileForm.name, bio: profileForm.bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const initials = user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const avatarColors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const avatarColor = avatarColors[(user?.name?.charCodeAt(0) || 0) % avatarColors.length];

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-0">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2 px-6 py-4">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences</p>
      </motion.div>

      <SettingCard delay={0}>
        <SectionTitle icon={User} title="Profile Settings" desc="Update your public profile information" />
        <div className="space-y-4">

          {/* Banner + Avatar photo pickers */}
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-2">
            {/* Banner */}
            <div className="relative h-24 bg-slate-800 group/banner cursor-pointer" onClick={() => bannerRef.current?.click()}>
              {localBannerImage
                ? <img src={localBannerImage} alt="Banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-r from-blue-900/40 to-slate-800" />
              }
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity">
                {bannerUploading
                  ? <SpinnerGap size={20} className="text-white animate-spin" />
                  : <div className="flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                      <Camera size={13} weight="fill" /> Change banner
                    </div>
                }
              </div>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            </div>
            {/* Avatar */}
            <div className="px-4 pb-4 -mt-8 flex items-end gap-3">
              <div className="relative group/avatar cursor-pointer flex-shrink-0" onClick={() => profileImageRef.current?.click()}>
                {localProfileImage
                  ? <img src={localProfileImage} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-black" />
                  : <div className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-white font-bold text-lg ${avatarColor}`}>{initials}</div>
                }
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity border-4 border-black">
                  {profileImageUploading
                    ? <SpinnerGap size={16} className="text-white animate-spin" />
                    : <Camera size={16} className="text-white" weight="fill" />
                  }
                </div>
                <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
              </div>
              <div className="mb-1">
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-gray-500 text-xs">@{user.username}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Full Name</label>
            <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
              <input value={user.username || ""} readOnly
                className="w-full pl-7 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-gray-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
            <input value={user.email || ""} readOnly
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Bio</label>
            <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Write something about yourself..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" rows={3} />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all">
            {saving ? <SpinnerGap size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </SettingCard>

      <SettingCard delay={0.05}>
        <SectionTitle icon={EnvelopeSimple} title="Email Verification" desc="Verify your email once to unlock posting" />
        {user.emailVerified ? (
          <div className="flex items-center gap-2.5 bg-green-900/20 border border-green-800 rounded-xl px-3 py-2.5">
            <SealCheck size={16} className="text-green-400 flex-shrink-0" weight="fill" />
            <div>
              <p className="text-xs font-semibold text-green-400">Email verified</p>
              <p className="text-xs text-gray-500">You can post and comment freely.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 bg-yellow-900/20 border border-yellow-800 rounded-xl px-3 py-2.5">
              <EnvelopeSimple size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-400">Email not verified</p>
                <p className="text-xs text-gray-500">Verify your email to unlock posting and comments.</p>
              </div>
            </div>
            {verifyError && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                <p className="text-xs text-red-400">{verifyError}</p>
              </div>
            )}
            {verifySent && (
              <div className="bg-green-900/20 border border-green-800 rounded-xl px-3 py-2">
                <p className="text-xs text-green-400">Email sent — check your inbox and click the link.</p>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleSendVerification} disabled={verifySending || verifySent}
              className="flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-all">
              {verifySending ? <SpinnerGap size={12} className="animate-spin" /> : verifySent ? <Check size={12} /> : <EnvelopeSimple size={12} />}
              {verifySent ? "Email sent!" : "Send Verification Email"}
            </motion.button>
          </div>
        )}
      </SettingCard>

      <SettingCard delay={0.08}>
        <SectionTitle icon={Lock} title="Security" desc="Keep your account safe with a strong password" />
        <div className="space-y-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
            <div key={i}>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">{label}</label>
              <div className="relative">
                <input type={showPasswords ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPasswords ? <EyeSlash size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all">Update Password</button>
        </div>
      </SettingCard>

      <SettingCard delay={0.1}>
        <SectionTitle icon={Bell} title="Notifications" desc="Choose what you want to be notified about" />
        <div className="space-y-1">
          {NOTIFICATION_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <Toggle checked={notifToggles[i]} onChange={(v) => setNotifToggles(prev => prev.map((x, j) => j === i ? v : x))} />
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard delay={0.15}>
        <SectionTitle icon={Shield} title="Privacy" desc="Control who can see your content" />
        <div className="space-y-1">
          {PRIVACY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <Toggle checked={privacyToggles[i]} onChange={(v) => setPrivacyToggles(prev => prev.map((x, j) => j === i ? v : x))} />
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard delay={0.2}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Sign Out</h3>
            <p className="text-sm text-gray-500">Sign out of your account on this device</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-400 bg-red-900/20 border border-red-800 px-4 py-2 rounded-xl hover:bg-red-900/40 transition-all">
            <SignOut size={15} /> Sign Out
          </motion.button>
        </div>
      </SettingCard>
    </div>
  );
}
