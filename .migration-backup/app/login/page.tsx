"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { setSessionUser, setToken } from "@/lib/sessionStore";

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verification code step
  const [needsVerification, setNeedsVerification] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [resent, setResent] = useState(false);

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
        if (data.requiresVerification) {
          setNeedsVerification(true);
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }
      if (data.user) {
        setSessionUser(data.user);
        if (data.token) setToken(data.token);
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setVerifying(true);
    setVerifyError("");
    try {
      // First sign in temporarily to get a session so verify-code can auth
      const loginRes = await fetch("/api/auth/login-unverified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code }),
      });
      const data = await loginRes.json();
      if (!loginRes.ok) {
        setVerifyError(data.error || "Invalid code. Please try again.");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setVerifyError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    setResent(false);
    setVerifyError("");
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResent(true);
        setCode("");
      } else {
        setVerifyError(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setVerifyError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="LAWSA" className="w-14 h-14 rounded-full object-cover" />
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
            <p className="text-gray-500 text-sm">
              A 6-digit code has been sent to your email address. Enter it below to continue.
            </p>
          </div>

          {verifyError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-sm mb-4">
              {verifyError}
            </div>
          )}
          {resent && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3.5 text-sm mb-4">
              New code sent — check your inbox.
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-600 rounded-xl px-4 py-4 text-3xl font-bold tracking-widest text-center focus:outline-none focus:border-blue-500 transition-colors"
            />

            <button
              type="submit"
              disabled={verifying || code.length < 6}
              className="w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? <Loader2 size={18} className="animate-spin" /> : "Verify & sign in"}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <button
              onClick={resendCode}
              disabled={resending}
              className="text-blue-500 text-sm hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
            <p className="text-gray-600 text-xs">
              <button onClick={() => { setNeedsVerification(false); setCode(""); setVerifyError(""); }}
                className="hover:text-gray-400 transition-colors">
                ← Back to sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="LAWSA" className="w-14 h-14 rounded-full object-cover" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Sign in to LAWSA</h1>
        <p className="text-gray-500 text-sm mb-8">Law Student Association, University of Delta, Agbor</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={form.emailOrUsername}
            onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
            placeholder="Email or username"
            className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            required
            autoFocus
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full bg-transparent border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-blue-500 text-xs hover:text-blue-400 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-gray-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
              Sign up
            </Link>
          </p>
          <p className="text-gray-600 text-xs">
            <Link href="/dashboard" className="hover:text-gray-400 transition-colors">
              Continue without account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
