"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, BadgeCheck, Users, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      setSuccess(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-white" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg font-bold text-white">
              Welcome back!
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin text-blue-500" /> Loading your feed...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Same nav as landing page */}
      <nav className="border-b border-[#222] flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="text-white font-black text-lg">Sosa Socials</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</Link>
            <Link href="/#community" className="text-gray-400 hover:text-white text-sm transition-colors">Community</Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Premium</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-gray-400 text-sm">New here?</span>
            <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center w-[420px] flex-shrink-0 px-12 border-r border-[#1a1a1a] bg-[#050505]">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-8">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">
            Welcome back to Sosa
          </h2>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Your network is waiting. Continue building meaningful connections.
          </p>
          <div className="space-y-5">
            {[
              { icon: Users, title: "Your Network", desc: "Reconnect with your connections", color: "text-blue-400", bg: "bg-blue-400/10" },
              { icon: BadgeCheck, title: "Verified Presence", desc: "Stand out with a verified profile", color: "text-green-400", bg: "bg-green-400/10" },
              { icon: TrendingUp, title: "Your Feed", desc: "See what's trending right now", color: "text-purple-400", bg: "bg-purple-400/10" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">

            <h1 className="text-3xl font-black text-white mb-2">Sign in</h1>
            <p className="text-gray-400 text-sm mb-8">Enter your details to access your account</p>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-5">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email or Username</label>
                <input
                  type="text"
                  value={form.emailOrUsername}
                  onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
                  placeholder="you@example.com or @username"
                  className="w-full bg-[#111] border border-[#333] hover:border-[#555] focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full bg-[#111] border border-[#333] hover:border-[#555] focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || success}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
