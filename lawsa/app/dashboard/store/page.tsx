"use client";
import { useState, useEffect } from "react";
import { SpinnerGap, ShoppingBag, CheckCircle, Sparkle, ArrowRight, Lock } from "@phosphor-icons/react";
import Link from "next/link";
import CosmeticBadge from "@/components/cosmetics/CosmeticBadge";

interface StoreItem {
  id: string; name: string; description: string; category: string;
  effectType: string; price: number; isFree: boolean;
  previewColor: string; owned: boolean; equipped: boolean;
  unlockCondition?: string; unlockThreshold?: number;
}

const BADGE_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
  badge_sovereign:      { label: "Animated", color: "#f97316", glow: "rgba(249,115,22,0.5)" },
  badge_herald_purple:  { label: "Legendary", color: "#a855f7", glow: "rgba(168,85,247,0.5)" },
  badge_lion:           { label: "Legendary", color: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  badge_fist:           { label: "Free", color: "#b45309", glow: "rgba(180,83,9,0.4)" },
};

function BadgeCard({ item, onPurchase, purchasing }: { item: StoreItem; onPurchase: (item: StoreItem) => void; purchasing: boolean }) {
  const cfg = BADGE_CONFIG[item.effectType] || { label: "", color: "#9ca3af", glow: "rgba(156,163,175,0.3)" };
  const isFreeUnlock = item.isFree && item.unlockCondition === "followers";
  const priceLabel = item.isFree
    ? (isFreeUnlock ? `Free · ${item.unlockThreshold} followers` : "Free")
    : `₦${(item.price / 100).toLocaleString()}`;

  return (
    <div
      className="relative flex flex-col items-center rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 transition-all hover:border-white/20"
      style={{ boxShadow: `0 0 30px ${cfg.glow}22` }}
    >
      {/* Rarity pill */}
      <span
        className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
      >
        {cfg.label}
      </span>

      {/* Badge preview */}
      <div
        className="flex items-center justify-center my-4"
        style={{
          width: 120, height: 120,
          background: `radial-gradient(ellipse at center, ${cfg.glow} 0%, transparent 70%)`,
          borderRadius: 20,
        }}
      >
        <CosmeticBadge effectType={item.effectType} size={88} />
      </div>

      <h3 className="text-white font-black text-lg text-center mb-1">{item.name}</h3>
      <p className="text-gray-500 text-xs text-center leading-relaxed mb-5 px-1">{item.description}</p>

      {/* Price */}
      <div className="text-center mb-4">
        <span className="text-white font-black text-xl">{priceLabel}</span>
      </div>

      {/* CTA */}
      {item.owned ? (
        <div className="w-full flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl py-3 text-green-400 font-bold text-sm">
          <CheckCircle size={16} weight="fill" /> Owned
        </div>
      ) : isFreeUnlock ? (
        <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 text-gray-400 text-sm">
          <Lock size={14} /> Reach {item.unlockThreshold} followers to claim
        </div>
      ) : (
        <button
          onClick={() => onPurchase(item)}
          disabled={purchasing}
          className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${cfg.color}cc 0%, ${cfg.color} 100%)`,
            boxShadow: `0 0 16px ${cfg.glow}`,
          }}
        >
          {purchasing ? <SpinnerGap size={16} className="animate-spin" /> : <><ArrowRight size={14} weight="bold" /> Buy for {priceLabel}</>}
        </button>
      )}
    </div>
  );
}

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      const id = params.get("item");
      if (id) verifyPayment(id);
    }
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/store", { credentials: "include" });
      const data = await res.json();
      const badges = (data.items ?? []).filter((i: StoreItem) =>
        ["badge_sovereign", "badge_herald_purple", "badge_lion", "badge_fist"].includes(i.effectType)
      );
      const ORDER = ["badge_sovereign", "badge_herald_purple", "badge_lion", "badge_fist"];
      badges.sort((a: StoreItem, b: StoreItem) => ORDER.indexOf(a.effectType) - ORDER.indexOf(b.effectType));
      setItems(badges);
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
      await loadItems();
    } catch {}
  };

  const handlePurchase = async (item: StoreItem) => {
    if (item.owned || (item.isFree && item.unlockCondition === "followers")) return;
    setPurchasingId(item.id);
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
      } else if (data.success) {
        await loadItems();
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Purchase failed. Please try again.");
    }
    setPurchasingId(null);
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

        {paymentSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" weight="fill" />
            <div>
              <p className="text-green-400 font-semibold">Payment successful!</p>
              <p className="text-green-400/70 text-sm">Your badge is now in your wardrobe.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-yellow-500 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LAWSA Store</h1>
              <p className="text-gray-500 text-xs">Exclusive badges for your profile</p>
            </div>
          </div>
          <Link
            href="/dashboard/customize"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Sparkle size={14} /> Wardrobe
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <BadgeCard
                key={item.id}
                item={item}
                onPurchase={handlePurchase}
                purchasing={purchasingId === item.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <ShoppingBag size={48} className="text-gray-700" />
            <div>
              <h2 className="text-xl font-black text-white mb-2">Store is being set up</h2>
              <p className="text-gray-500 text-sm">Check back shortly.</p>
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
