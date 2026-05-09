"use client";
import { useState, useEffect } from "react";
import { SpinnerGap, ShoppingBag, CheckCircle, Lock, ArrowRight, Sparkle, Tag } from "@phosphor-icons/react";
import Link from "next/link";

interface StoreItem {
  id: string; name: string; description: string; category: string;
  effectType: string; price: number; isFree: boolean;
  unlockCondition: string; unlockThreshold: number;
  previewColor: string; icon: string; owned: boolean; equipped: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "badge", label: "Badges" },
  { id: "avatar", label: "Avatar FX" },
  { id: "username", label: "Username FX" },
  { id: "post", label: "Post FX" },
  { id: "profile", label: "Profile FX" },
];

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
      if (data.items) setItems(data.items);
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

  const filtered = category === "all" ? items : items.filter(i => i.category === category);
  const freeItems = filtered.filter(i => i.isFree);
  const paidItems = filtered.filter(i => !i.isFree);

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
              <p className="text-green-400/70 text-sm">Your item has been added to your wardrobe.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sosa Store</h1>
              <p className="text-gray-400 text-xs">Customise your Sosa experience</p>
            </div>
          </div>
          <Link href="/dashboard/customize"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            <Sparkle size={14} /> My Wardrobe
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === c.id ? "bg-white text-black" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"}`}>
              {c.label}
            </button>
          ))}
        </div>

        {freeItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-green-400" />
              <h2 className="text-base font-bold text-white">Free & Unlockable</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {freeItems.map(item => (
                <ItemCard key={item.id} item={item} purchasing={purchasing}
                  onBuy={() => handlePurchase(item)} onClaim={() => handleClaim(item)} />
              ))}
            </div>
          </div>
        )}

        {paidItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={16} className="text-yellow-400" />
              <h2 className="text-base font-bold text-white">Premium Cosmetics</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paidItems.map(item => (
                <ItemCard key={item.id} item={item} purchasing={purchasing}
                  onBuy={() => handlePurchase(item)} onClaim={() => handleClaim(item)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item, purchasing, onBuy, onClaim }: { item: StoreItem; purchasing: string | null; onBuy: () => void; onClaim: () => void; }) {
  return (
    <div className={`relative rounded-2xl border p-4 flex flex-col transition-all ${item.owned ? "border-green-500/30 bg-green-950/10" : "border-white/10 bg-[#111] hover:border-white/20"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: item.previewColor + "22", border: `1px solid ${item.previewColor}44` }}>
          {item.icon}
        </div>
        {item.isFree ? (
          <span className="text-[10px] font-bold text-green-400 bg-green-900/30 border border-green-800/50 px-1.5 py-0.5 rounded-full">FREE</span>
        ) : (
          <span className="text-[10px] font-bold text-white/60">₦{(item.price / 100).toFixed(0)}</span>
        )}
      </div>

      <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.name}</h3>
      <p className="text-gray-500 text-[11px] leading-snug flex-1 mb-3">{item.description}</p>

      {item.unlockCondition && item.unlockCondition !== "always" && !item.owned && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
          <Lock size={9} /> Unlock: {item.unlockCondition === "followers" ? `${item.unlockThreshold} followers` : item.unlockCondition === "total_likes" ? `${item.unlockThreshold} likes` : item.unlockCondition}
        </div>
      )}

      {item.owned ? (
        <div className="flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-xl py-2 text-green-400 text-xs font-semibold">
          <CheckCircle size={12} weight="fill" /> Owned
        </div>
      ) : item.isFree ? (
        <button onClick={onClaim} disabled={purchasing === item.id}
          className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1">
          {purchasing === item.id ? <SpinnerGap size={12} className="animate-spin" /> : "Claim Free"}
        </button>
      ) : (
        <button onClick={onBuy} disabled={purchasing === item.id}
          className="w-full py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
          style={{ background: `linear-gradient(135deg, ${item.previewColor}, ${item.previewColor}99)` }}>
          {purchasing === item.id ? <SpinnerGap size={12} className="animate-spin" /> : <><ArrowRight size={11} /> Buy</>}
        </button>
      )}
    </div>
  );
}
