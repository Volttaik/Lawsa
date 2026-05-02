"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, Plus } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem("pwa-dismissed")) return;

    const onIOS = isIOS();
    setIos(onIOS);

    if (onIOS) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  const install = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") localStorage.setItem("pwa-dismissed", "1");
      deferredPrompt.current = null;
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[501] bg-gray-950 border-t border-white/10 rounded-t-3xl px-6 pb-10 pt-5 shadow-2xl max-w-lg mx-auto"
          >
            {/* Drag pill */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            >
              <X size={15} />
            </button>

            {/* App info row */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                <Image src="/logo.jpg" alt="Sosa" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Sosa</p>
                <p className="text-white/50 text-sm">sosa.app</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Headline */}
            <p className="text-white font-semibold text-base mb-1">
              Install the Sosa app
            </p>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Get the full experience — faster, offline-ready, and right from your home screen.
            </p>

            {ios ? (
              /* iOS instructions */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Tap the <span className="inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-white text-xs font-medium"><Share size={11} /> Share</span> button in Safari
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Scroll down and tap <span className="inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-white text-xs font-medium"><Plus size={11} /> Add to Home Screen</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">3</span>
                  </div>
                  <p className="text-white/80 text-sm">Tap <strong className="text-white">Add</strong> to install</p>
                </div>

                {/* iOS arrow hint */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="text-center mt-1"
                >
                  <span className="text-2xl">↓</span>
                </motion.div>
              </div>
            ) : (
              /* Android / Chrome install button */
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={install}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl py-4 mb-3 transition-colors shadow-lg shadow-blue-600/30"
              >
                <Download size={18} />
                Install App
              </motion.button>
            )}

            <button
              onClick={dismiss}
              className="w-full text-center text-white/40 text-sm py-2 hover:text-white/60 transition-colors"
            >
              Not now
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
