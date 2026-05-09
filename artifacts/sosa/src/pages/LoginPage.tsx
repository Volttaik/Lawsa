import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SpinnerGap, Eye, EyeSlash } from "@phosphor-icons/react";
import { useSession } from "@/components/SessionProvider";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { refreshUser } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (data.user) { await refreshUser(); navigate("/dashboard"); }
      else setError(data.error || "Login failed");
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">Lawsa</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email or username</label>
            <input type="text" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors pr-11" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-base hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? <><SpinnerGap size={18} className="animate-spin" /> Signing in…</> : "Sign in"}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-white font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
