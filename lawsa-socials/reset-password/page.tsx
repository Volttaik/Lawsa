"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed"); return; }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Password reset!</h2>
        <p className="text-gray-400 text-sm mb-6">Your password has been updated. You can now sign in with your new password.</p>
        <Link href="/login" className="block w-full py-3.5 rounded-full bg-white text-black font-bold text-sm text-center hover:bg-gray-200 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="LAWSA" className="w-14 h-14 rounded-full object-cover" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
      <p className="text-gray-500 text-sm mb-8">Choose a new password for your LAWSA account.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          required
        />
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-white" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
