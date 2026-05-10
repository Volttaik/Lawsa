"use client";
import { useState, useEffect } from "react";
import { SpinnerGap, ShoppingBag, CheckCircle, Sparkle, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

interface StoreItem {
  id: string; name: string; description: string; category: string;
  effectType: string; price: number; isFree: boolean;
  previewColor: string; owned: boolean; equipped: boolean;
}

export default function StorePage() {
  const [item, setItem]         = useState<StoreItem | null>(null);
  const [loading, setLoading]   = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      const id = params.get("item");
      if (id) verifyPayment(id);
    }
    loadItem();
  }, []);

  const loadItem = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/store", { credentials: "include" });
      const data = await res.json();
      const sovereign = (data.items ?? []).find(
        (i: StoreItem) => i.effectType === "badge_sovereign"
      );
      setItem(sovereign ?? null);
    } catch {}
    setLoading(false);
  };

  const verifyPayment = async (itemId: string) => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref) return;
    try {
      await fetch("/api/store/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reference: ref }),
      });
      await loadItem();
    } catch {}
  };

  const handlePurchase = async () => {
    if (!item || item.owned || item.isFree) return;
    setPurchasing(true);
    try {
      const res  = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Purchase failed. Please try again.");
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <SpinnerGap className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" weight="fill" />
            <div>
              <p className="text-green-400 font-semibold">Payment successful!</p>
              <p className="text-green-400/70 text-sm">Your badge is now in your wardrobe.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-yellow-500 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LAWSA Store</h1>
              <p className="text-gray-500 text-xs">Exclusive badge for your profile</p>
            </div>
          </div>
          <Link
            href="/dashboard/customize"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Sparkle size={14} /> Wardrobe
          </Link>
        </div>

        {/* Badge Showcase */}
        {item ? (
          <div className="flex flex-col items-center">

            {/* Badge image with glow */}
            <div
              className="relative flex items-center justify-center mb-0"
              style={{
                width: 260,
                height: 260,
                background:
                  "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
                borderRadius: 32,
              }}
            >
              <img
                src="/api/admin/badge/sovereign"
                alt="Sovereign's Herald"
                style={{
                  width: 220,
                  height: 220,
                  objectFit: "contain",
                  filter:
                    "drop-shadow(0 0 18px rgba(180,100,255,0.9)) drop-shadow(0 0 40px rgba(255,200,50,0.4))",
                  animation: "cosm-aura-pulse 3s ease-in-out infinite",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>

            {/* Reflection */}
            <div
              style={{
                width: 220,
                height: 70,
                overflow: "hidden",
                marginTop: -8,
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)",
                pointerEvents: "none",
                flexShrink: 0,
              }}
            >
              <img
                src="/api/admin/badge/sovereign"
                alt=""
                aria-hidden
                style={{
                  width: 220,
                  height: 220,
                  objectFit: "contain",
                  transform: "scaleY(-1)",
                  opacity: 0.45,
                  filter: "blur(1px)",
                }}
              />
            </div>

            {/* Badge info */}
            <div className="mt-6 text-center w-full">
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                Sovereign's Herald
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 px-2">
                {item.description ||
                  "The rarest mark on LAWSA — a hand-crafted purple-and-gold heraldic crest. Displays beside your username everywhere you appear."}
              </p>

              {/* Appears beside username note */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                >
                  <span className="text-gray-400 text-xs">Appears beside your username as</span>
                  <img
                    src="/api/admin/badge/sovereign"
                    alt="badge"
                    style={{ width: 20, height: 20, objectFit: "contain" }}
                  />
                  <span className="text-white text-xs font-semibold">username</span>
                </div>
              </div>

              {/* Price + CTA */}
              <div
                className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5"
                style={{ boxShadow: "0 0 40px rgba(168,85,247,0.12)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="text-white font-black text-2xl">
                    ₦{(item.price / 100).toLocaleString()}
                  </span>
                </div>

                {item.owned ? (
                  <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl py-3 text-green-400 font-bold text-sm">
                    <CheckCircle size={16} weight="fill" /> You own this badge
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d97706 100%)",
                      boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                    }}
                  >
                    {purchasing ? (
                      <SpinnerGap size={18} className="animate-spin" />
                    ) : (
                      <>
                        <ArrowRight size={16} weight="bold" />
                        Buy for ₦{(item.price / 100).toLocaleString()}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No item in DB yet */
          <div className="flex flex-col items-center gap-6 py-16 text-center">

            {/* Show badge image anyway for visual */}
            <div style={{ position: "relative" }}>
              <img
                src="/api/admin/badge/sovereign"
                alt="Sovereign's Herald"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                  filter:
                    "drop-shadow(0 0 18px rgba(180,100,255,0.8)) drop-shadow(0 0 36px rgba(255,200,50,0.35))",
                  animation: "cosm-aura-pulse 3s ease-in-out infinite",
                  opacity: 0.7,
                }}
              />
            </div>

            <div>
              <h2 className="text-xl font-black text-white mb-2">Sovereign's Herald</h2>
              <p className="text-gray-500 text-sm">
                Store is being set up — check back shortly.
              </p>
            </div>

            <div className="text-xs text-gray-700 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
              Admin: POST <code className="text-purple-400">/api/admin/seed-store</code> with{" "}
              <code className="text-yellow-400">x-admin-key</code> header to populate the store.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
