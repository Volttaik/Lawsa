import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SpinnerGap, Eye, EyeSlash } from "@phosphor-icons/react";
import { useSession } from "@/components/SessionProvider";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { refreshUser } = useSession();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (data.user) { await refreshUser(); navigate("/dashboard"); }
      else setError(data.error || "Registration failed");
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">Lawsa</h1>
          <p className="text-gray-500 mt-2 text-sm">Create your account</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))} placeholder="yourusername"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors pr-11" required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-base hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? <><SpinnerGap size={18} className="animate-spin" /> Creating account…</> : "Create account"}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
