"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Upload, Trash2 } from "lucide-react";
import { Suspense } from "react";

interface ChatBg {
  id: string;
  label: string;
  imgValue: string | null;
  bgColor: string;
  bgSize?: string;
  isCustom?: boolean;
}

const CHAT_BACKGROUNDS: ChatBg[] = [
  { id: "midnight", label: "Midnight", imgValue: "linear-gradient(145deg,#0f0c29 0%,#302b63 55%,#24243e 100%)", bgColor: "#0f0c29" },
  { id: "galaxy",   label: "Galaxy",   imgValue: "linear-gradient(160deg,#0d1b2a 0%,#162032 45%,#0f3460 100%)",  bgColor: "#0d1b2a" },
  { id: "noir",     label: "Noir",     imgValue: "linear-gradient(140deg,#111827 0%,#1f2937 100%)",               bgColor: "#111827" },
  { id: "ocean",    label: "Ocean",    imgValue: "linear-gradient(155deg,#004e92 0%,#000428 100%)",               bgColor: "#004e92" },
  { id: "sunset",   label: "Sunset",   imgValue: "linear-gradient(135deg,#f7971e 0%,#e84393 50%,#8b5cf6 100%)",  bgColor: "#f7971e" },
  { id: "forest",   label: "Forest",   imgValue: "linear-gradient(145deg,#0a3d2b 0%,#1a6b47 55%,#2d9966 100%)", bgColor: "#0a3d2b" },
  { id: "rose",     label: "Rose",     imgValue: "linear-gradient(145deg,#c0392b 0%,#e91e8c 55%,#f093fb 100%)", bgColor: "#c0392b" },
  { id: "minimal",  label: "Minimal",  imgValue: "linear-gradient(160deg,#e8edf2 0%,#d1d9e0 100%)",              bgColor: "#e8edf2" },
  { id: "dots",     label: "Dots",     imgValue: "radial-gradient(circle,#3b82f6 1.2px,transparent 1.2px)",      bgColor: "#0f172a", bgSize: "18px 18px" },
  { id: "cream",    label: "Cream",    imgValue: "linear-gradient(145deg,#fdfcfb 0%,#f2ede4 100%)",              bgColor: "#fdfcfb" },
  { id: "storm",    label: "Storm",    imgValue: "linear-gradient(140deg,#232526 0%,#414345 100%)",              bgColor: "#232526" },
  { id: "lavender", label: "Lavender", imgValue: "linear-gradient(145deg,#a18cd1 0%,#fbc2eb 100%)",             bgColor: "#a18cd1" },
];

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backConvId = searchParams.get("conv");

  const [activeBgId, setActiveBgId] = useState("midnight");
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem("chatBgId");
      const savedCustomUrl = localStorage.getItem("chatBgCustomUrl");
      if (savedId) setActiveBgId(savedId);
      if (savedCustomUrl) setCustomBgUrl(savedCustomUrl);
    } catch {}
  }, []);

  const selectBg = (bg: ChatBg) => {
    setActiveBgId(bg.id);
    try {
      localStorage.setItem("chatBgId", bg.id);
      if (!bg.isCustom) localStorage.removeItem("chatBgCustomUrl");
    } catch {}
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setCustomBgUrl(dataUrl);
      setActiveBgId("custom");
      try {
        localStorage.setItem("chatBgId", "custom");
        localStorage.setItem("chatBgCustomUrl", dataUrl);
      } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearCustom = () => {
    setCustomBgUrl(null);
    setActiveBgId("midnight");
    try {
      localStorage.removeItem("chatBgCustomUrl");
      localStorage.setItem("chatBgId", "midnight");
    } catch {}
  };

  const goBack = () => {
    if (backConvId) {
      router.push(`/dashboard/messages`);
    } else {
      router.push("/dashboard/messages");
    }
  };

  const activeBg = CHAT_BACKGROUNDS.find((b) => b.id === activeBgId) || CHAT_BACKGROUNDS[0];
  const previewStyle: React.CSSProperties =
    activeBgId === "custom" && customBgUrl
      ? { backgroundImage: `url(${customBgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { backgroundImage: activeBg.imgValue ?? undefined, backgroundColor: activeBg.bgColor, backgroundSize: activeBg.bgSize ?? (activeBg.imgValue ? "cover" : undefined) };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-[8px] border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chat Customization</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Personalize your chat background</p>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="rounded-[8px] overflow-hidden shadow-[0_2px_16px_0_rgba(0,0,0,0.12)] border border-black/10 dark:border-white/10 mb-6 h-48 relative flex flex-col justify-end p-4 gap-2"
        style={previewStyle}
      >
        <div className="self-start max-w-[60%] bg-white/90 rounded-[6px] px-3 py-2 shadow-[0_1px_6px_0_rgba(0,0,0,0.12)] border border-black/5">
          <p className="text-xs text-gray-800 font-medium">Hey! How are you? 👋</p>
          <p className="text-[10px] text-gray-400 mt-0.5">10:30 AM</p>
        </div>
        <div className="self-end max-w-[60%] bg-blue-600 rounded-[6px] px-3 py-2 shadow-[0_1px_6px_0_rgba(37,99,235,0.25)]">
          <p className="text-xs text-white font-medium">I'm doing great, thanks!</p>
          <p className="text-[10px] text-blue-200 mt-0.5 text-right">10:31 AM</p>
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-[6px] px-2 py-1">
          <p className="text-[10px] text-white font-medium">{activeBgId === "custom" && customBgUrl ? "Custom" : activeBg.label}</p>
        </div>
      </div>

      {/* Background Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-[8px] border border-black/10 dark:border-white/10 shadow-[0_2px_8px_0_rgba(0,0,0,0.06)] p-4 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Background Theme</p>
        <div className="grid grid-cols-4 gap-3">
          {CHAT_BACKGROUNDS.map((bg) => {
            const isActive = activeBgId === bg.id && !(bg.id === "midnight" && activeBgId === "custom");
            return (
              <button
                key={bg.id}
                onClick={() => selectBg(bg)}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full aspect-square rounded-[6px] border-2 transition-all overflow-hidden relative shadow-sm ${
                    isActive ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={{
                    backgroundColor: bg.bgColor,
                    backgroundImage: bg.imgValue ?? undefined,
                    backgroundSize: bg.bgSize ?? "cover",
                  }}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow">
                        <Check size={10} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate w-full text-center">{bg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Upload */}
      <div className="bg-white dark:bg-gray-900 rounded-[8px] border border-black/10 dark:border-white/10 shadow-[0_2px_8px_0_rgba(0,0,0,0.06)] p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Custom Background</p>

        {customBgUrl ? (
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-[6px] border border-black/10 overflow-hidden shadow-sm flex-shrink-0"
              style={{ backgroundImage: `url(${customBgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Custom image set</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your personal background</p>
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer w-8 h-8 rounded-[6px] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-100 transition-colors">
                <Upload size={14} className="text-blue-600 dark:text-blue-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleCustomUpload} />
              </label>
              <button
                onClick={clearCustom}
                className="w-8 h-8 rounded-[6px] bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 py-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[6px] cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
            <div className="w-10 h-10 rounded-[6px] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Upload size={18} className="text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload custom image</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP supported</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleCustomUpload} />
          </label>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={goBack}
        className="w-full mt-4 py-3 rounded-[8px] bg-blue-600 text-white font-semibold text-sm shadow-[0_2px_8px_0_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all"
      >
        Save & Go Back to Messages
      </motion.button>
    </div>
  );
}

export default function ChatCustomizePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CustomizeContent />
    </Suspense>
  );
}
