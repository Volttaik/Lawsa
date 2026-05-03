"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Shield, LogOut, Loader2, Check, Eye, EyeOff, Moon, Sun, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface CurrentUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string;
}

function SettingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-transparent border-b border-black/8 dark:border-white/10 p-6"
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
    >
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

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", bio: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [notifToggles, setNotifToggles] = useState<boolean[]>(NOTIFICATION_ITEMS.map(() => true));
  const [privacyToggles, setPrivacyToggles] = useState<boolean[]>(PRIVACY_ITEMS.map(() => true));

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setProfileForm({ name: data.user.name || "", bio: data.user.bio || "" });
        }
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const res = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileForm.name, bio: profileForm.bio }),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={28} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account preferences</p>
      </motion.div>

      {/* Appearance / Dark Mode */}
      <SettingCard delay={0}>
        <SectionTitle icon={Moon} title="Appearance" desc="Choose how Sosa looks" />
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" :"border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={22} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </SettingCard>

      {/* Profile */}
      <SettingCard delay={0.05}>
        <SectionTitle icon={User} title="Profile Settings" desc="Update your public profile information" />
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
            <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input value={user?.username || ""} readOnly
                className="w-full pl-7 pr-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label>
            <input value={user?.email || ""} readOnly
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Bio</label>
            <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Write something about yourself..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" rows={3} />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-btn">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </SettingCard>

      {/* Security */}
      <SettingCard delay={0.1}>
        <SectionTitle icon={Lock} title="Security" desc="Keep your account safe with a strong password" />
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300 mb-5">
          Use a mix of letters, numbers and symbols for a strong password.
        </div>
        <div className="space-y-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
            <div key={i}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{label}</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-btn">
            Update Password
          </button>
        </div>
      </SettingCard>

      {/* Notifications */}
      <SettingCard delay={0.15}>
        <SectionTitle icon={Bell} title="Notifications" desc="Choose what you want to be notified about" />
        <div className="space-y-1">
          {NOTIFICATION_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
              </div>
              <Toggle
                checked={notifToggles[i]}
                onChange={(v) => setNotifToggles((prev) => prev.map((x, j) => j === i ? v : x))}
              />
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Privacy */}
      <SettingCard delay={0.2}>
        <SectionTitle icon={Shield} title="Privacy" desc="Control who can see your content" />
        <div className="space-y-1">
          {PRIVACY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
              </div>
              <Toggle
                checked={privacyToggles[i]}
                onChange={(v) => setPrivacyToggles((prev) => prev.map((x, j) => j === i ? v : x))}
              />
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Logout */}
      <SettingCard delay={0.25}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Sign Out</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account on this device</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
          >
            <LogOut size={15} />
            Sign Out
          </motion.button>
        </div>
      </SettingCard>
    </div>
  );
}
