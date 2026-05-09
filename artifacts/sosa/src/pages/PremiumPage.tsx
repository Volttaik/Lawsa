import { useState } from "react";
import { Star, Check, SpinnerGap, Diamond, Crown } from "@phosphor-icons/react";
import { useSession } from "@/components/SessionProvider";

const PLANS = [
  {
    id: "premium_monthly", name: "Pro Monthly", price: 1499, period: "month",
    color: "#3b82f6", gradient: "from-blue-900 to-indigo-900",
    features: ["Verified badge", "Priority placement in explore", "5 free cosmetics unlocked", "Extended post analytics", "Ad-free experience", "Early access to new features"],
  },
  {
    id: "premium_annual", name: "Pro Annual", price: 12999, period: "year",
    color: "#8b5cf6", gradient: "from-purple-900 to-violet-900", badge: "Best Value",
    features: ["Everything in Pro Monthly", "2 months free", "10 free cosmetics unlocked", "Custom clan badge", "Priority support", "Pro analytics dashboard"],
  },
  {
    id: "premium_diamond", name: "Diamond", price: 29999, period: "year",
    color: "#06b6d4", gradient: "from-cyan-900 to-blue-900", badge: "Most Exclusive",
    features: ["Everything in Pro Annual", "Diamond badge next to name", "All store cosmetics free", "Featured on explore page", "Direct team support", "Exclusive Diamond community clan"],
  },
];

export default function PremiumPage() {
  const { user } = useSession();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const subscribe = async (planId: string, amount: number) => {
    if (!user) return;
    setSubscribing(planId); setError("");
    try {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) { setError("Payment not configured. Contact support."); setSubscribing(null); return; }
      const reference = `lawsa-premium-${planId}-${user.id}-${Date.now()}`;
      const win: any = window;
      if (!win.PaystackPop) {
        setError("Payment system not loaded. Please refresh the page.");
        setSubscribing(null); return;
      }
      const popup = win.PaystackPop.setup({
        key: paystackKey, email: user.email, amount,
        ref: reference,
        onSuccess: async (t: any) => {
          try {
            await fetch("/api/store/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ reference: t.reference, planId }) });
          } catch {}
          alert("Subscription activated! Welcome to Lawsa Premium.");
        },
        onClose: () => {},
      });
      popup.openIframe();
    } catch { setError("Failed to start payment. Please try again."); }
    setSubscribing(null);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={32} className="text-amber-400" weight="fill" />
            <h1 className="text-3xl font-black text-white">Lawsa Premium</h1>
          </div>
          <p className="text-gray-400 text-base max-w-md mx-auto">Unlock the full Lawsa experience. Stand out, get seen, and express yourself like never before.</p>
        </div>

        {error && <div className="mb-6 bg-red-950/30 border border-red-800/50 rounded-2xl px-4 py-3 text-red-400 text-sm text-center">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative rounded-2xl border overflow-hidden flex flex-col ${plan.badge ? "border-white/30" : "border-white/10"}`}>
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-black uppercase tracking-wider py-1" style={{ background: plan.color + "cc" }}>{plan.badge}</div>
              )}
              <div className={`bg-gradient-to-b ${plan.gradient} px-5 pt-${plan.badge ? "8" : "5"} pb-5 flex-shrink-0`}>
                <h3 className="text-white font-black text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">₦{(plan.price / 100).toLocaleString()}</span>
                  <span className="text-white/60 text-sm">/{plan.period}</span>
                </div>
              </div>
              <div className="bg-[#0d0d0d] flex-1 px-5 py-4 flex flex-col">
                <ul className="space-y-2.5 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} weight="bold" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => subscribe(plan.id, plan.price)} disabled={!user || subscribing === plan.id}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: plan.color, color: "#fff" }}>
                  {subscribing === plan.id ? <SpinnerGap size={16} className="animate-spin" /> : null}
                  {!user ? "Sign in to subscribe" : subscribing === plan.id ? "Processing…" : `Get ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Diamond size={20} className="text-cyan-400" weight="fill" />
            <h2 className="text-white font-bold text-lg">Why go Premium?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
            {[
              { t: "Stand out", d: "Verified badge + exclusive cosmetics make your profile unforgettable." },
              { t: "Get discovered", d: "Priority placement means more people find and follow you." },
              { t: "Full wardrobe", d: "Access exclusive badges, rings, username effects and more." },
              { t: "Support Lawsa", d: "Your subscription keeps Lawsa running and growing." },
            ].map(({ t, d }) => <div key={t}><p className="text-white font-semibold mb-1">{t}</p><p>{d}</p></div>)}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs">Payments processed securely via Paystack. Cancel anytime. By subscribing you agree to our Terms of Service.</p>
      </div>
    </div>
  );
}
