"use client";
import { useEffect, useRef } from "react";
import { X, Link, TwitterLogo, WhatsappLogo, FacebookLogo, Envelope, Copy } from "@phosphor-icons/react";
import { useToast } from "./Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  text?: string;
}

export default function ShareModal({ open, onClose, url, title = "LAWSA", text = "" }: Props) {
  const { toast } = useToast();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const encoded = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text ? `${text} ${url}` : url);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
      onClose();
    } catch {
      toast("Could not copy link", "error");
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text, url });
      onClose();
    } catch {}
  };

  const options = [
    {
      label: "Copy link",
      icon: Copy,
      color: "bg-gray-800 text-white",
      action: copyLink,
    },
    {
      label: "Share on X",
      icon: TwitterLogo,
      color: "bg-black text-white",
      action: () => { window.open(`https://x.com/intent/tweet?text=${encodedText}`, "_blank"); onClose(); },
    },
    {
      label: "WhatsApp",
      icon: WhatsappLogo,
      color: "bg-[#25D366] text-white",
      action: () => { window.open(`https://wa.me/?text=${encodedText}`, "_blank"); onClose(); },
    },
    {
      label: "Facebook",
      icon: FacebookLogo,
      color: "bg-[#1877F2] text-white",
      action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank"); onClose(); },
    },
    {
      label: "Email",
      icon: Envelope,
      color: "bg-gray-700 text-white",
      action: () => { window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`, "_blank"); onClose(); },
    },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm mx-4 bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-4 sm:mb-0"
        style={{ animation: "pop-in 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-bold text-white text-lg">Share post</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 mb-4">
            <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400 text-sm truncate flex-1">{url}</span>
          </div>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <div className="px-5 pb-3">
            <button onClick={nativeShare} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
              <Link className="w-4 h-4" weight="bold" /> Share via device
            </button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 px-5 pb-6">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                onClick={opt.action}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${opt.color} group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-5 h-5" weight="fill" />
                </div>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
