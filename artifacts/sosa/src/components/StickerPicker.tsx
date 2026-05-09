import { useState, useEffect, useRef } from "react";
import { SpinnerGap, X, Lock, ShoppingCart } from "@phosphor-icons/react";

interface Sticker { id: string; packId: string; name: string; value: string; isAnimated: boolean; }
interface Pack { id: string; name: string; description: string; emoji: string; isFree: boolean; price: number; owned: boolean; stickers: Sticker[]; }

const BASIC_EMOJIS = [
  "😀","😂","🤣","😊","😍","🥰","😎","🤩","😭","😅","🤔","😤","🥺","😳","🤯","🤫",
  "👋","🔥","❤️","💯","✅","👊","🎉","🙏","💪","👑","💎","⚡","🌊","🎯","🚀","🌟",
  "😈","👀","💀","🫡","🥶","🤗","😴","🤤","😏","😋","🤑","🫢","😬","🙄","😡","🤬",
];

export default function StickerPicker({ onSelectSticker, onSelectEmoji, onClose }: { onSelectSticker: (v: string) => void; onSelectEmoji: (e: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"emoji" | "stickers">("emoji");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePack, setActivePack] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab !== "stickers" || packs.length > 0) return;
    setLoading(true);
    fetch("/api/stickers", { credentials: "include" }).then(r => r.json()).then(d => {
      if (d.packs) { setPacks(d.packs); const first = d.packs.find((p: Pack) => p.owned); if (first) setActivePack(first.id); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [tab, packs.length]);

  const buyPack = async (pack: Pack) => {
    setPurchasing(pack.id);
    try {
      const res = await fetch("/api/stickers/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ packId: pack.id }) });
      const data = await res.json();
      if (data.authorization_url) window.location.href = data.authorization_url;
      else if (data.success) { setPacks(prev => prev.map(p => p.id === pack.id ? { ...p, owned: true } : p)); setActivePack(pack.id); }
    } catch {}
    setPurchasing(null);
  };

  const currentPack = packs.find(p => p.id === activePack);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: "#111", maxHeight: 320 }}>
      <div className="flex items-center border-b border-white/10" style={{ backgroundColor: "#0d0d0d" }}>
        <button onClick={() => setTab("emoji")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "emoji" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"}`}>Emoji</button>
        <button onClick={() => setTab("stickers")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "stickers" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"}`}>Stickers</button>
        <button onClick={onClose} className="px-3 py-2 text-white/30 hover:text-white transition-colors"><X size={14} /></button>
      </div>

      {tab === "emoji" ? (
        <div className="p-2 overflow-y-auto" style={{ maxHeight: 268 }}>
          <div className="grid grid-cols-8 gap-0.5">
            {BASIC_EMOJIS.map(e => (
              <button key={e} onClick={() => onSelectEmoji(e)} className="text-xl p-1.5 rounded-lg hover:bg-white/10 transition-colors leading-none aspect-square flex items-center justify-center">{e}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex" style={{ height: 268 }}>
          <div className="flex flex-col border-r border-white/10 overflow-y-auto" style={{ width: 60, backgroundColor: "#0d0d0d" }}>
            {packs.map(pack => (
              <button key={pack.id} onClick={() => pack.owned && setActivePack(pack.id)}
                className={`p-2 text-xl flex items-center justify-center transition-colors relative ${activePack === pack.id ? "bg-white/10" : "hover:bg-white/5"} ${!pack.owned ? "opacity-50" : ""}`}>
                {pack.emoji}
                {!pack.owned && <Lock size={8} className="absolute bottom-1 right-1 text-white/60" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full"><SpinnerGap size={20} className="animate-spin text-white/40" /></div>
            ) : !currentPack ? (
              <div className="flex flex-col gap-2 h-full overflow-y-auto">
                {packs.filter(p => !p.owned).map(pack => (
                  <div key={pack.id} className="flex items-center gap-3 p-2 rounded-xl border border-white/10">
                    <div className="text-2xl">{pack.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{pack.name}</p>
                      <p className="text-white/40 text-[10px]">{pack.stickers.length} stickers · ₦{(pack.price / 100).toFixed(0)}</p>
                    </div>
                    <button onClick={() => buyPack(pack)} disabled={purchasing === pack.id} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                      {purchasing === pack.id ? <SpinnerGap size={10} className="animate-spin" /> : <ShoppingCart size={10} />} Buy
                    </button>
                  </div>
                ))}
                {packs.length === 0 && !loading && <div className="flex items-center justify-center h-full text-white/30 text-sm">No sticker packs yet</div>}
              </div>
            ) : !currentPack.owned ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-2">
                <div className="text-4xl">{currentPack.emoji}</div>
                <p className="text-white font-semibold text-sm text-center">{currentPack.name}</p>
                <p className="text-white/40 text-xs text-center">{currentPack.description}</p>
                <p className="text-white font-bold">₦{(currentPack.price / 100).toFixed(0)}</p>
                <button onClick={() => buyPack(currentPack)} disabled={purchasing === currentPack.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
                  {purchasing === currentPack.id ? <SpinnerGap size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                  {purchasing === currentPack.id ? "Loading…" : "Get this Pack"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {currentPack.stickers.map(s => (
                  <button key={s.id} onClick={() => onSelectSticker(s.value)}
                    className={`text-3xl p-2 rounded-xl hover:bg-white/10 transition-colors leading-none flex items-center justify-center aspect-square ${s.isAnimated ? "relative" : ""}`}>
                    {s.value}
                    {s.isAnimated && <span className="absolute bottom-0.5 right-0.5 text-[7px] bg-purple-600 text-white rounded px-0.5 leading-none">anim</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
