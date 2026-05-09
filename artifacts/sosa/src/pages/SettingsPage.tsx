import { useState, useRef, useEffect } from "react";
import { SpinnerGap, Camera, Lock, SignOut, CheckCircle, User, Globe, Bell, Palette } from "@phosphor-icons/react";
import { useSession } from "@/components/SessionProvider";
import { useToast } from "@/components/Toast";

function Avatar({ src, name, size = 64 }: { src?: string; name: string; size?: number }) {
  const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`} style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}>{initials}</div>;
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<"avatar" | "banner" | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [tab, setTab] = useState<"profile" | "account" | "privacy">("profile");
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", bio: "", headline: "", website: "", location: "", phone: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name || "", bio: user.bio || "", headline: user.headline || "", website: user.website || "", location: user.location || "", phone: user.phone || "" });
  }, [user]);

  const handleImageUpload = async (file: File, type: "avatar" | "banner") => {
    setUploadingImg(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subfolder", "avatars");
    try {
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (data.url) {
        const field = type === "avatar" ? "profileImage" : "bannerImage";
        const upRes = await fetch(`/api/users/${user?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ [field]: data.url }) });
        const upData = await upRes.json();
        if (upData.user) { updateUser({ [field]: data.url }); toast(`${type === "avatar" ? "Profile" : "Banner"} photo updated!`); }
      }
    } catch { toast("Upload failed", "error"); }
    setUploadingImg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (data.user) { updateUser(form); toast("Profile saved!"); }
      else toast(data.error || "Failed to save", "error");
    } catch { toast("Network error", "error"); }
    setSaving(false);
  };

  const sendVerification = async () => {
    setSendingVerification(true);
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST", credentials: "include" });
      const data = await res.json();
      toast(data.message || "Verification email sent!");
    } catch { toast("Failed to send email", "error"); }
    setSendingVerification(false);
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center"><SpinnerGap size={28} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-black text-white pb-12 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#222] pb-3 mb-6 z-10">
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>

        <div className="flex gap-1 mb-6 border-b border-[#222] pb-2">
          {([["profile","Profile",User],["account","Account",Lock],["privacy","Privacy",Globe]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === id ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-6">
            <div className="relative">
              <div className="h-28 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => bannerRef.current?.click()}>
                {user.bannerImage && <img src={user.bannerImage} className="w-full h-full object-cover" />}
                {uploadingImg === "banner" && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><SpinnerGap size={24} className="animate-spin text-white" /></div>}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40"><Camera size={24} className="text-white" /></div>
              </div>
              <div className="absolute -bottom-8 left-4 cursor-pointer" onClick={() => avatarRef.current?.click()}>
                <div className="relative"><Avatar src={user.profileImage} name={user.name} size={64} />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50"><Camera size={16} className="text-white" /></div>
                  {uploadingImg === "avatar" && <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60"><SpinnerGap size={16} className="animate-spin text-white" /></div>}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "avatar"); e.target.value = ""; }} />
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "banner"); e.target.value = ""; }} />
            </div>
            <div className="mt-10 grid gap-4">
              {[
                { label: "Display name", field: "name", placeholder: "Your name", type: "text" },
                { label: "Bio", field: "bio", placeholder: "Tell the world about yourself", type: "textarea" },
                { label: "Headline", field: "headline", placeholder: "Lawyer • Entrepreneur • Creator", type: "text" },
                { label: "Website", field: "website", placeholder: "https://yoursite.com", type: "url" },
                { label: "Location", field: "location", placeholder: "Lagos, Nigeria", type: "text" },
                { label: "Phone", field: "phone", placeholder: "+234 XXX XXX XXXX", type: "tel" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                  {type === "textarea"
                    ? <textarea value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} rows={3}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors resize-none text-sm" />
                    : <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors text-sm" />
                  }
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {saving ? <SpinnerGap size={16} className="animate-spin" /> : null}{saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}

        {tab === "account" && (
          <div className="space-y-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-1">Email address</h3>
              <p className="text-gray-400 text-sm mb-3">{user.email}</p>
              {user.emailVerified
                ? <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle size={16} weight="fill" /> Email verified</div>
                : <div className="flex items-center justify-between">
                    <p className="text-amber-400 text-sm">Email not verified</p>
                    <button onClick={sendVerification} disabled={sendingVerification} className="text-blue-400 text-sm hover:underline disabled:opacity-50 flex items-center gap-1">
                      {sendingVerification ? <SpinnerGap size={12} className="animate-spin" /> : null}Send verification
                    </button>
                  </div>
              }
            </div>
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-1">Account info</h3>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              <p className="text-gray-500 text-xs mt-1">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "recently"}</p>
            </div>
            <button onClick={logout} className="w-full py-3 rounded-xl border border-red-800/50 bg-red-950/20 text-red-400 font-bold text-sm hover:bg-red-950/40 transition-all flex items-center justify-center gap-2">
              <SignOut size={16} />Sign out
            </button>
          </div>
        )}

        {tab === "privacy" && (
          <div className="space-y-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Privacy settings</h3>
              <p className="text-gray-400 text-sm">Advanced privacy controls are coming soon. For now, all accounts are public.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
