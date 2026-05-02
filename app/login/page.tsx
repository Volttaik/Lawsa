"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Users, MessageCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

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
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf0] flex flex-col">
      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#e8ecf0] flex flex-col items-center justify-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 size={32} className="text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold text-gray-900"
            >
              Login successful!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 text-gray-400 text-sm"
            >
              <Loader2 size={16} className="animate-spin text-blue-500" />
              Loading dashboard...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — matches home page exactly */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-black/8 shadow-soft flex-shrink-0">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon size={28} />
            <span className="font-bold text-gray-900 text-sm">Sosa</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
            <Link href="/#features" className="hover:text-blue-600 transition-colors font-medium">Features</Link>
            <Link href="/#community" className="hover:text-blue-600 transition-colors font-medium">Community</Link>
            <Link href="/#about" className="hover:text-blue-600 transition-colors font-medium">About</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="text-sm text-gray-700 font-medium px-4 py-1.5 rounded-lg border border-black/10 hover:border-blue-500 hover:text-blue-600 transition-all">
              Login
            </Link>
            <Link href="/register" className="text-sm text-white font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center w-2/5 relative overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80"
            alt="Courtroom professional setting"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-blue-900/78" />
          <div className="relative z-10 px-12">
            <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
              Welcome back to your network
            </h2>
            <p className="text-blue-200 text-sm mb-10 leading-relaxed">
              Continue building meaningful connections and sharing your ideas with the community.
            </p>
            <div className="space-y-5">
              {[
                { icon: Users, title: "Your Connections", desc: "Reconnect with your network" },
                { icon: MessageCircle, title: "Messages", desc: "Continue your conversations" },
                { icon: TrendingUp, title: "Your Feed", desc: "See what's trending" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Icon className="text-white" size={17} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{title}</div>
                    <div className="text-blue-300 text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Panel — Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#e8ecf0]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl border border-black/10 shadow-card p-8">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your details to access your account</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
                  <input
                    type="text"
                    value={form.emailOrUsername}
                    onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
                    placeholder="you@example.com or @username"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="form-input pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl border border-black/10 hover:bg-blue-700 transition-all shadow-btn hover:shadow-btn-hover disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                    Create one free
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
