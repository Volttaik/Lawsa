"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, Camera, Mail } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    profileImage: "",
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfilePreview(result);
      update("profileImage", result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!form.name.trim()) { setError("Full name is required"); return false; }
    if (!form.username.trim() || form.username.length < 3) { setError("Username must be at least 3 characters"); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address"); return false; }
    return true;
  };

  const goNext = () => {
    setError("");
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username.toLowerCase().trim(),
          email: form.email.toLowerCase().trim(),
          password: form.password,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          profileImage: form.profileImage || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      if (data.user) {
        const { setSessionUser, setToken } = await import("@/lib/sessionStore");
        setSessionUser(data.user);
        if (data.token) setToken(data.token);
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            We sent a verification link to <span className="text-white font-semibold">{form.email}</span>.
            Click the link to verify your email — you can keep using the app in the meantime.
          </p>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 text-xs">
            <Mail size={14} className="flex-shrink-0" />
            <span>Check your spam folder if you don&apos;t see it within a minute.</span>
          </div>
          <Link href="/dashboard" className="mt-6 block w-full py-3.5 rounded-full bg-white text-black font-bold text-sm text-center hover:bg-gray-200 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="LAWSA" className="w-14 h-14 rounded-full object-cover" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Step {step} of 2</p>

        <div className="h-0.5 bg-white/10 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-sm mb-5">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  {profilePreview
                    ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                    : <Camera size={24} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Camera size={12} className="text-white" />
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePic}
                className="hidden"
              />
            </div>
            <p className="text-center text-gray-500 text-xs -mt-1">Profile picture (optional)</p>

            <input
              type="text"
              value={form.name}
              onChange={e => update("name", e.target.value)}
              placeholder="Full name"
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={form.username}
                onChange={e => update("username", e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="username"
                className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <input
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={goNext}
              className="w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors mt-2"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => update("password", e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={e => update("confirmPassword", e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-400 text-xs">Passwords do not match</p>
            )}
            <div>
              <label className="text-gray-500 text-xs block mb-1.5">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => update("dateOfBirth", e.target.value)}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="flex-1 border border-white/20 text-white font-semibold py-3.5 rounded-full text-sm hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Create account"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
