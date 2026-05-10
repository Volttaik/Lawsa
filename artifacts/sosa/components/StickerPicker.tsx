"use client";
import { useState, useRef, useEffect } from "react";
import { X, Lock, ShoppingCart, SpinnerGap } from "@phosphor-icons/react";
import { BUILTIN_PACKS, PackIcon, Sticker, toStickerToken, type BuiltinPack } from "@/components/stickers/StickerLibrary";

const BASIC_EMOJIS = [
  "😀","😂","🤣","😊","😍","🥰","😎","🤩","😭","😅","🤔","😤","🥺","😳","🤯","🤫",
  "👋","🔥","❤️","💯","✅","👊","🎉","🙏","💪","👑","💎","⚡","🌊","🎯","🚀","🌟",
  "😈","👀","💀","🫡","🥶","🤗","😴","🤤","😏","😋","🤑","🫢","😬","🙄","😡","🤬",
];

interface ApiPack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isFree: boolean;
  price: number;
  owned: boolean;
  stickers: { id: string; packId: string; name: string; value: string; isAnimated: boolean }[];
}

interface Props {
  onSelectSticker: (value: string) => void;
  onSelectEmoji:   (emoji: string)  => void;
  onClose: () => void;
}

type Tab = "emoji" | "stickers";

export default function StickerPicker({ onSelectSticker, onSelectEmoji, onClose }: Props) {
  const [tab, setTab]           = useState<Tab>("emoji");
  const [activePack, setActivePack] = useState<string>(BUILTIN_PACKS[0].id);
  const [apiPacks, setApiPacks] = useState<ApiPack[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const hasFetchedApi = useRef(false);

  useEffect(() => {
    if (tab === "stickers" && !hasFetchedApi.current) {
      hasFetchedApi.current = true;
      setLoadingApi(true);
      fetch("/api/stickers", { credentials: "include" })
        .then(r => r.json())
        .then(d => { if (d.packs) setApiPacks(d.packs); })
        .catch(() => {})
        .finally(() => setLoadingApi(false));
    }
  }, [tab]);

  const buyApiPack = async (pack: ApiPack) => {
    setPurchasing(pack.id);
    try {
      const res = await fetch("/api/stickers/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (data.authorization_url) { window.location.href = data.authorization_url; }
      else if (data.success) { setApiPacks(prev => prev.map(p => p.id === pack.id ? { ...p, owned: true } : p)); }
    } catch {}
    setPurchasing(null);
  };

  const currentBuiltin = BUILTIN_PACKS.find(p => p.id === activePack);
  const currentApi     = apiPacks.find(p => p.id === activePack);

  const allPacks: Array<{ id: string; name: string; isFree: boolean; isBuiltin: boolean; owned?: boolean }> = [
    ...BUILTIN_PACKS.map(p => ({ id: p.id, name: p.name, isFree: p.isFree, isBuiltin: true })),
    ...apiPacks.map(p => ({ id: p.id, name: p.name, isFree: p.isFree, isBuiltin: false, owned: p.owned })),
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: "#111", maxHeight: 340 }}>

      {/* Tab header */}
      <div className="flex items-center border-b border-white/10" style={{ backgroundColor: "#0d0d0d" }}>
        <button
          onClick={() => setTab("emoji")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "emoji" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"}`}
        >
          Emoji
        </button>
        <button
          onClick={() => setTab("stickers")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "stickers" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"}`}
        >
          Stickers
        </button>
        <button onClick={onClose} className="px-3 py-2 text-white/30 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Emoji grid */}
      {tab === "emoji" && (
        <div className="p-2 overflow-y-auto" style={{ maxHeight: 290 }}>
          <div className="grid grid-cols-8 gap-0.5">
            {BASIC_EMOJIS.map(e => (
              <button key={e} onClick={() => onSelectEmoji(e)}
                className="text-xl p-1.5 rounded-lg hover:bg-white/10 transition-colors leading-none aspect-square flex items-center justify-center">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticker packs */}
      {tab === "stickers" && (
        <div className="flex" style={{ height: 290 }}>

          {/* Pack sidebar — SVG icons, not emoji */}
          <div className="flex flex-col border-r border-white/10 overflow-y-auto" style={{ width: 56, backgroundColor: "#0d0d0d", flexShrink: 0 }}>
            {allPacks.map(pack => {
              const isLocked = !pack.isBuiltin && !pack.owned && !pack.isFree;
              const isActive = activePack === pack.id;
              return (
                <button key={pack.id}
                  onClick={() => { if (!isLocked) setActivePack(pack.id); }}
                  className={`flex-shrink-0 flex items-center justify-center p-2.5 transition-colors relative ${isActive ? "bg-white/12" : "hover:bg-white/6"} ${isLocked ? "opacity-45" : ""}`}
                  style={{ height: 48 }}
                  title={pack.name}
                >
                  {pack.isBuiltin
                    ? <PackIcon packId={pack.id} size={26} />
                    : (
                      <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill={isActive ? "#374151" : "#1f2937"} />
                        <text x="12" y="16" textAnchor="middle" fontSize="11" fill="white">✦</text>
                      </svg>
                    )
                  }
                  {isLocked && (
                    <Lock size={8} className="absolute bottom-1 right-1 text-white/55" />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sticker grid area */}
          <div className="flex-1 overflow-y-auto">
            {loadingApi && !currentBuiltin && (
              <div className="flex items-center justify-center h-full">
                <SpinnerGap size={22} className="animate-spin text-white/40" />
              </div>
            )}

            {/* Builtin pack */}
            {currentBuiltin && (
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest px-3 pt-2 pb-1">{currentBuiltin.name}</p>
                <div className="grid grid-cols-3 gap-2 p-2">
                  {currentBuiltin.stickers.map(s => (
                    <button key={s.id}
                      onClick={() => onSelectSticker(toStickerToken(s.id))}
                      className="aspect-square flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors p-1.5"
                      title={s.name}
                    >
                      <Sticker id={s.id} size={52} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* API pack — owned */}
            {!currentBuiltin && currentApi && currentApi.owned && (
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest px-3 pt-2 pb-1">{currentApi.name}</p>
                <div className="grid grid-cols-3 gap-2 p-2">
                  {currentApi.stickers.map(s => (
                    <button key={s.id}
                      onClick={() => onSelectSticker(s.value)}
                      className="aspect-square flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors p-1.5 text-2xl"
                      title={s.name}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* API pack — locked */}
            {!currentBuiltin && currentApi && !currentApi.owned && (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Lock size={22} className="text-white/40" />
                </div>
                <p className="text-white font-semibold text-sm">{currentApi.name}</p>
                <p className="text-white/40 text-xs">{currentApi.description}</p>
                <p className="text-white font-bold text-base">₦{(currentApi.price / 100).toFixed(0)}</p>
                <button onClick={() => buyApiPack(currentApi)}
                  disabled={purchasing === currentApi.id}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {purchasing === currentApi.id
                    ? <SpinnerGap size={14} className="animate-spin" />
                    : <ShoppingCart size={14} />}
                  {purchasing === currentApi.id ? "Loading…" : "Get Pack"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
