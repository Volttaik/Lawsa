"use client";
import { useState, useEffect } from "react";
import { SpinnerGap, Sparkle, CheckCircle, ShoppingBag } from "@phosphor-icons/react";
import Link from "next/link";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";

interface StoreItem {
  id: string; name: string; description: string; category: string;
  effectType: string; price: number; isFree: boolean;
  previewColor: string; icon: string; owned: boolean; equipped: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  badge: "Badges",
  avatar: "Avatar Effects",
  username: "Username Effects",
  post: "Post Effects",
  profile: "Profile Effects",
};

export default function CustomizePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
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
      if (data.items) setItems(data.items.filter((i: StoreItem) => i.owned));
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
    } catch {}
  };

  const toggleEquip = async (item: StoreItem) => {
    setEquipping(item.id);
    try {
      const res = await fetch("/api/store/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: item.id, equipped: !item.equipped }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, equipped: data.equipped } : i));
      }
    } catch {}
    setEquipping(null);
  };

  const grouped = items.reduce<Record<string, StoreItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SpinnerGap className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Wardrobe</h1>
              <p className="text-gray-400 text-xs">Equip and manage your cosmetics</p>
            </div>
          </div>
          <Link href="/dashboard/store"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            <ShoppingBag size={14} /> Store
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Sparkle size={28} className="text-white/30" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Your wardrobe is empty</h3>
            <p className="text-gray-400 text-sm mb-6">Head to the store to grab some cosmetics and make your profile unique.</p>
            <Link href="/dashboard/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
              <ShoppingBag size={15} /> Browse Store
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat}>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {CATEGORY_LABELS[cat] || cat}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {catItems.map(item => (
                    <div key={item.id}
                      className={`relative rounded-2xl border p-4 flex flex-col transition-all ${item.equipped ? "border-white/30 bg-white/5" : "border-white/10 bg-[#111]"}`}>
                      {item.equipped && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] font-bold bg-white text-black px-1.5 py-0.5 rounded-full">EQUIPPED</span>
                        </div>
                      )}
                      <div className="mb-3">
                        <CosmeticPreview effectType={item.effectType} previewColor={item.previewColor} size={44} />
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1 pr-12">{item.name}</h3>
                      <p className="text-gray-500 text-[11px] leading-snug flex-1 mb-3">{item.description}</p>
                      <button onClick={() => toggleEquip(item)} disabled={equipping === item.id}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 ${item.equipped ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-black hover:bg-gray-200"}`}>
                        {equipping === item.id ? <SpinnerGap size={12} className="animate-spin" /> : item.equipped ? "Unequip" : "Equip"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
