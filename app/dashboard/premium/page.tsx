"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle, SealCheck, Lightning, Palette, TrendingUp, Star,
  Lock, ArrowRight, SpinnerGap, ShieldStar
} from "@phosphor-icons/react";

interface User { id: string; name: string; email: string; isVerified?: boolean; isBoosted?: boolean; premiumTheme?: boolean; }

const PLANS = [
  {
    id: "verified_badge",
    name: "Verified Badge",
    price: "₦2,500",
    amount: 250000,
    icon: SealCheck,
    color: "from-blue-500 to-blue-700",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    description: "Get a blue verified checkmark displayed on your profile and all your posts — instantly build trust.",
    features: ["Blue ✓ on profile & posts", "Higher search visibility", "Priority in suggestions", "Verified badge forever"],
    popular: true,
    field: "isVerified",
  },
  {
    id: "profile_boost",
    name: "Profile Boost",
    price: "₦1,500",
    amount: 150000,
    icon: TrendingUp,
    color: "from-purple-500 to-purple-700",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    description: "Get featured at the top of search results and recommendations for 30 days straight.",
    features: ["Featured in suggestions", "Top of search results", "30-day boost duration", "Analytics dashboard"],
    popular: false,
    field: "isBoosted",
  },
  {
    id: "premium_theme",
    name: "Premium Theme",
    price: "₦1,000",
    amount: 100000,
    icon: Palette,
    color: "from-amber-500 to-orange-600",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    description: "Unlock a golden glow around your avatar and exclusive profile styling that makes you stand out.",
    features: ["Gold avatar ring", "Exclusive profile border", "Premium badge icon", "Unique profile style"],
    popular: false,
    field: "premiumTheme",
  },
];

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") setVerified(true);
    fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
      setLoading(false);
    });
  }, []);

  const handlePay = async (plan: typeof PLANS[0]) => {
    if (!user) return;
    setPaying(plan.id);
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || "Failed to initialize payment");
      }
    } catch {
      alert("Payment initialization failed");
    } finally {
      setPaying(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SpinnerGap className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  const isActive = (field: string) => user && (user as any)[field];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {verified && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={20} weight="fill" className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-medium">Payment successful! Your feature has been activated.</p>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
            <Star size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Sosa Premium</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Stand Out on Sosa
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Unlock powerful features that make your profile shine. One-time payments, instant activation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const active = isActive(plan.field);
            return (
              <div key={plan.id} className={`relative rounded-2xl border ${plan.borderColor} bg-[#111] p-6 flex flex-col ${plan.popular ? 'ring-2 ring-blue-500/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
              <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="text-3xl font-black text-white mb-3">{plan.price}</div>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed flex-1">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={16} weight="fill" className="text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {active ? (
                  <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl py-3 text-green-400 font-semibold">
                    <ShieldStar size={16} />
                    Active
                  </div>
                ) : (
                  <button
                    onClick={() => handlePay(plan)}
                    disabled={!!paying}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60`}
                  >
                    {paying === plan.id ? <SpinnerGap size={16} className="animate-spin" /> : <><Lightning size={16} />{plan.popular ? "Get Verified" : "Activate"}<ArrowRight size={16} /></>}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-[#111] border border-[#222] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock size={20} className="text-gray-400" />
            <h3 className="font-semibold text-gray-300">Secure payments by Paystack</h3>
          </div>
          <p className="text-gray-500 text-sm">All payments are processed securely by Paystack. We accept cards, bank transfers, USSD, and more. Your payment info is never stored on our servers.</p>
        </div>
      </div>
    </div>
  );
}
