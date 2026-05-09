"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? setLoggedIn(true) : setLoggedIn(false))
      .catch(() => setLoggedIn(false))
      .finally(() => setChecking(false));
  }, []);

  const isSuccess = status === "success";
  const isAlready = status === "already";

  return (
    <div className="w-full max-w-sm text-center space-y-6">
      <div className="flex justify-center mb-2">
        <img src="/logo.png" alt="LAWSA" className="w-14 h-14 rounded-full object-cover" />
      </div>

      {isSuccess || isAlready ? (
        <>
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isAlready ? "Already verified!" : "Email verified!"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isAlready
                ? "Your email was already confirmed. You're all set."
                : "Your email has been confirmed. You can now post and comment freely."}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification failed</h1>
            <p className="text-gray-500 text-sm">
              {status === "invalid-token"
                ? "This link is invalid or has already been used."
                : "Something went wrong. Please try again from your settings."}
            </p>
          </div>
        </>
      )}

      {checking ? (
        <div className="flex justify-center">
          <Loader2 size={18} className="animate-spin text-gray-500" />
        </div>
      ) : loggedIn ? (
        <Link href="/dashboard"
          className="block w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors text-center">
          Go to dashboard
        </Link>
      ) : (
        <Link href="/login"
          className="block w-full bg-white text-black font-bold py-3.5 rounded-full text-sm hover:bg-gray-200 transition-colors text-center">
          Sign in
        </Link>
      )}
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex justify-center">
          <Loader2 size={24} className="animate-spin text-gray-500" />
        </div>
      }>
        <EmailVerifiedContent />
      </Suspense>
    </div>
  );
}
