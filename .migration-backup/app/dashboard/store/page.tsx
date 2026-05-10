"use client";
import { useState, useEffect } from "react";
import { SpinnerGap, ShoppingBag, CheckCircle, ArrowRight, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";

interface StoreItem {
  id: string; name: string; description: string; category: string;
  effectType: string; price: number; isFree: boolean;
  unlockCondition: string; unlockThreshold: number;
  previewColor: string; icon: string; owned: boolean; equipped: boolean;
}

const ALL_BADGE_TYPES = [
  { effectType: "badge_crown",          name: "Golden Crown",     color: "#fbbf24" },
  { effectType: "badge_fire",           name: "Inferno",          color: "#f97316" },
  { effectType: "badge_lightning",      name: "Storm",            color: "#a78bfa" },
  { effectType: "badge_star",           name: "Supernova",        color: "#facc15" },
  { effectType: "badge_verified_plus",  name: "Verified+",        color: "#60a5fa" },
  { effectType: "badge_crystal",        name: "Crystal",          color: "#38bdf8" },
  { effectType: "badge_amethyst",       name: "Amethyst",         color: "#a855f7" },
  { effectType: "badge_phoenix",        name: "Phoenix",          color: "#f97316" },
  { effectType: "badge_dragon",         name: "Dragon",           color: "#e879f9" },
  { effectType: "badge_royal",          name: "Royal",            color: "#8b5cf6" },
  { effectType: "badge_warrior",        name: "Warrior",          color: "#ef4444" },
  { effectType: "badge_azure",          name: "Azure",            color: "#38bdf8" },
  { effectType: "badge_inferno",        name: "Inferno Flame",    color: "#fb923c" },
  { effectType: "badge_frost",          name: "Frost",            color: "#7dd3fc" },
  { effectType: "badge_storm",          name: "Thunderstorm",     color: "#a78bfa" },
  { effectType: "badge_tidal",          name: "Tidal",            color: "#0ea5e9" },
  { effectType: "badge_earth",          name: "Earth",            color: "#22c55e" },
  { effectType: "badge_galaxy",         name: "Galaxy",           color: "#818cf8" },
  { effectType: "badge_nova",           name: "Nova",             color: "#f472b6" },
  { effectType: "badge_solar",          name: "Solar",            color: "#fbbf24" },
  { effectType: "badge_lunar",          name: "Lunar",            color: "#e2e8f0" },
  { effectType: "badge_void",           name: "Void",             color: "#7c3aed" },
  { effectType: "badge_shadow",         name: "Shadow",           color: "#94a3b8" },
  { effectType: "badge_demon",          name: "Demon",            color: "#dc2626" },
  { effectType: "badge_skull",          name: "Skull",            color: "#e2e8f0" },
  { effectType: "badge_angel",          name: "Angel",            color: "#fbbf24" },
  { effectType: "badge_divine",         name: "Divine",           color: "#fbbf24" },
  { effectType: "badge_tech",           name: "Tech",             color: "#22d3ee" },
  { effectType: "badge_neon",           name: "Neon",             color: "#22d3ee" },
  { effectType: "badge_matrix",         name: "Matrix",           color: "#22c55e" },
  { effectType: "badge_gold",           name: "Gold Elite",       color: "#fbbf24" },
  { effectType: "badge_ruby",           name: "Ruby",             color: "#f87171" },
  { effectType: "badge_obsidian",       name: "Obsidian",         color: "#7c3aed" },
  { effectType: "badge_wind",           name: "Wind",             color: "#34d399" },
  { effectType: "badge_cosmic",         name: "Cosmic",           color: "#818cf8" },
  { effectType: "badge_crystal_herald", name: "Crystal Herald",   color: "#67e8f9" },
];

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [previewBadge, setPreviewBadge] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      const item = params.get("item");
      if (item) verifyPayment(item);
    }
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store", { credentials: "include" });
      const data = await res.json();
      if (data.items) setItems(data.items.filter((i: StoreItem) => i.category === "badge"));
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
    if (item.owned || item.isFree) return;
    setPurchasing(item.id);
    try {
      const res = await fetch("/api/store/purchase", {
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
    setPurchasing(null);
  };

  const handleClaim = async (item: StoreItem) => {
    if (!item.isFree || item.owned) return;
    setPurchasing(item.id);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
      } else {
        alert(data.error || "Claim failed");
      }
    } catch {
      alert("Something went wrong.");
    }
    setPurchasing(null);
  };

  const previewItem = previewBadge
    ? ALL_BADGE_TYPES.find(b => b.effectType === previewBadge) ?? null
    : null;

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SpinnerGap className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {paymentSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" weight="fill" />
            <div>
              <p className="text-green-400 font-semibold">Payment successful!</p>
              <p className="text-green-400/70 text-sm">Your badge has been added to your wardrobe.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LAWSA Store</h1>
              <p className="text-gray-400 text-xs">Collect unique badges for your profile</p>
            </div>
          </div>
          <Link href="/dashboard/customize"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            <Sparkle size={14} /> My Wardrobe
          </Link>
        </div>

        {/* Badge Gallery Preview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base font-bold text-white">All Badges</span>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{ALL_BADGE_TYPES.length} total</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-1">
            {ALL_BADGE_TYPES.map(b => {
              const storeItem = items.find(i => i.effectType === b.effectType);
              const owned = storeItem?.owned ?? false;
              const active = previewBadge === b.effectType;
              return (
                <button
                  key={b.effectType}
                  onClick={() => setPreviewBadge(active ? null : b.effectType)}
                  title={b.name}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    active
                      ? "bg-white/15 ring-2 ring-white/40"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <CosmeticPreview effectType={b.effectType} previewColor={b.color} size={36} />
                  {owned && (
                    <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle size={8} weight="fill" className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-gray-600 text-[11px] text-center mt-2">Tap any badge to preview it</p>
        </div>

        {/* Large Badge Preview Panel */}
        {previewBadge && previewItem && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 flex flex-col sm:flex-row items-center gap-5"
            style={{ boxShadow: `0 0 40px ${previewItem.color}22` }}>
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{ background: `${previewItem.color}18`, border: `1px solid ${previewItem.color}33` }}>
              <CosmeticPreview effectType={previewBadge} previewColor={previewItem.color} size={72} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white mb-1">{previewItem.name}</h2>
              {(() => {
                const storeItem = items.find(i => i.effectType === previewBadge);
                if (!storeItem) return <p className="text-gray-500 text-sm">Not available yet</p>;
                return (
                  <>
                    <p className="text-gray-400 text-sm mb-3">{storeItem.description}</p>
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                      <span className="text-white font-bold text-lg">
                        ₦{(storeItem.price / 100).toFixed(0)}
                      </span>
                      {storeItem.owned ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                          <CheckCircle size={14} weight="fill" /> Owned
                        </span>
                      ) : storeItem.isFree ? (
                        <button
                          onClick={() => handleClaim(storeItem)}
                          disabled={purchasing === storeItem.id}
                          className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-all"
                        >
                          {purchasing === storeItem.id ? <SpinnerGap size={14} className="animate-spin" /> : "Claim Free"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(storeItem)}
                          disabled={purchasing === storeItem.id}
                          className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-xl text-white disabled:opacity-50 transition-all"
                          style={{ background: `linear-gradient(135deg, ${previewItem.color}, ${previewItem.color}99)` }}
                        >
                          {purchasing === storeItem.id
                            ? <SpinnerGap size={14} className="animate-spin" />
                            : <><ArrowRight size={13} /> Buy Now</>}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Purchase Grid */}
        {items.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={16} className="text-yellow-400" />
              <h2 className="text-base font-bold text-white">Available Badges</h2>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  purchasing={purchasing}
                  active={previewBadge === item.effectType}
                  onPreview={() => setPreviewBadge(previewBadge === item.effectType ? null : item.effectType)}
                  onBuy={() => handlePurchase(item)}
                  onClaim={() => handleClaim(item)}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-600">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Store coming soon</p>
            <p className="text-sm mt-1">Badges will appear here once the store is set up.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({
  item, purchasing, active, onPreview, onBuy, onClaim,
}: {
  item: StoreItem; purchasing: string | null; active: boolean;
  onPreview: () => void; onBuy: () => void; onClaim: () => void;
}) {
  return (
    <div
      onClick={onPreview}
      className={`relative rounded-2xl border p-4 flex flex-col transition-all cursor-pointer ${
        item.owned
          ? "border-green-500/30 bg-green-950/10"
          : active
          ? "border-white/30 bg-white/5"
          : "border-white/10 bg-[#111] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <CosmeticPreview effectType={item.effectType} previewColor={item.previewColor} size={44} />
        {item.isFree ? (
          <span className="text-[10px] font-bold text-green-400 bg-green-900/30 border border-green-800/50 px-1.5 py-0.5 rounded-full">FREE</span>
        ) : (
          <span className="text-[10px] font-bold text-white/60">₦{(item.price / 100).toFixed(0)}</span>
        )}
      </div>

      <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.name}</h3>
      <p className="text-gray-500 text-[11px] leading-snug flex-1 mb-3 line-clamp-2">{item.description}</p>

      {item.owned ? (
        <div className="flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-xl py-2 text-green-400 text-xs font-semibold">
          <CheckCircle size={12} weight="fill" /> Owned
        </div>
      ) : item.isFree ? (
        <button
          onClick={e => { e.stopPropagation(); onClaim(); }}
          disabled={purchasing === item.id}
          className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {purchasing === item.id ? <SpinnerGap size={12} className="animate-spin" /> : "Claim Free"}
        </button>
      ) : (
        <button
          onClick={e => { e.stopPropagation(); onBuy(); }}
          disabled={purchasing === item.id}
          className="w-full py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
          style={{ background: `linear-gradient(135deg, ${item.previewColor}, ${item.previewColor}99)` }}
        >
          {purchasing === item.id ? <SpinnerGap size={12} className="animate-spin" /> : <><ArrowRight size={11} /> Buy</>}
        </button>
      )}
    </div>
  );
}
