"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, Video, X, Send, Loader2, ArrowLeft, Film, ChevronDown, Play,
  Globe, Scale, Cpu, Trophy, Newspaper, BookOpen, Briefcase, CalendarDays, HeartPulse, Music, Palette,
} from "lucide-react";

type MediaItem = {
  type: "image" | "video";
  /** base64 data URL for images, server path for videos */
  data: string;
  /** local blob URL for instant preview – always set immediately */
  blobUrl: string;
  name: string;
  uploading?: boolean;
};

interface CategoryDef { id: string; label: string; Icon: React.ElementType }

const CATEGORIES: CategoryDef[] = [
  { id: "general",  label: "General",  Icon: Globe },
  { id: "law",      label: "Law",      Icon: Scale },
  { id: "tech",     label: "Tech",     Icon: Cpu },
  { id: "sports",   label: "Sports",   Icon: Trophy },
  { id: "news",     label: "News",     Icon: Newspaper },
  { id: "lectures", label: "Lectures", Icon: BookOpen },
  { id: "career",   label: "Career",   Icon: Briefcase },
  { id: "events",   label: "Events",   Icon: CalendarDays },
  { id: "health",   label: "Health",   Icon: HeartPulse },
  { id: "music",    label: "Music",    Icon: Music },
  { id: "art",      label: "Art",      Icon: Palette },
];

const MAX_VIDEO_MB = 50;
const MAX_IMAGE_MB = 10;

export default function CreatePostPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("general");
  const [showCatMenu, setShowCatMenu] = useState(false);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => { blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subfolder", "posts");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Upload failed"); }
    return (await res.json()).url as string;
  };

  const readAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    e.target.value = "";

    for (const file of Array.from(files)) {
      const maxMb = type === "video" ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        setError(`${file.name} is too large. Max ${maxMb}MB.`);
        continue;
      }

      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.push(blobUrl);
      const tempId = `${type}-${Date.now()}-${Math.random()}`;

      if (type === "video") {
        setMediaItems((prev) => [...prev, { type: "video", data: "", blobUrl, name: tempId, uploading: true }]);
        try {
          const serverUrl = await uploadFile(file);
          setMediaItems((prev) =>
            prev.map((m) => m.name === tempId ? { ...m, data: serverUrl, uploading: false } : m)
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
          setMediaItems((prev) => prev.filter((m) => m.name !== tempId));
        }
      } else {
        setMediaItems((prev) => [...prev, { type: "image", data: "", blobUrl, name: tempId, uploading: true }]);
        try {
          const base64 = await readAsBase64(file);
          setMediaItems((prev) =>
            prev.map((m) => m.name === tempId ? { ...m, data: base64, uploading: false } : m)
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to read image");
          setMediaItems((prev) => prev.filter((m) => m.name !== tempId));
        }
      }
    }
  };

  const removeMedia = (i: number) => setMediaItems((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (mediaItems.some((m) => m.uploading)) { setError("Please wait for uploads to finish."); return; }
    setSubmitting(true);
    setError("");
    try {
      const images = mediaItems.filter((m) => m.type === "image").map((m) => m.data);
      const videos = mediaItems.filter((m) => m.type === "video").map((m) => m.data);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, images, videos, category }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        cache.invalidate("posts:");
        cache.invalidate("dashboard:initial");
        router.refresh();
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to create post");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const SelectedIcon = selectedCat.Icon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-soft">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Share something with your network</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-6">

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
              <span>{error}</span>
              <button onClick={() => setError("")} className="flex-shrink-0"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Share a thought, project, or idea..."
          className="w-full resize-none text-gray-800 dark:text-gray-200 dark:bg-gray-900 text-base focus:outline-none min-h-[140px] leading-relaxed placeholder-gray-400 dark:placeholder-gray-600"
          rows={5} autoFocus />

        {mediaItems.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {mediaItems.map((item, i) => (
              <div key={item.name} className="relative">
                {item.type === "image" ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={item.blobUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {item.uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                        <Loader2 size={18} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-gray-900">
                    <video
                      src={item.blobUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {item.uploading ? (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                        <Loader2 size={18} className="text-white animate-spin" />
                        <span className="text-[9px] text-white/80">Uploading…</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                          <Play size={14} className="text-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!item.uploading && (
                  <button onClick={() => removeMedia(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium">
              <ImageIcon size={17} /> Photo
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
            </label>
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 transition-colors px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium">
              <Video size={17} /> Video
              <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowCatMenu(!showCatMenu)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <SelectedIcon size={12} />
                <span>{selectedCat.label}</span>
                <ChevronDown size={11} />
              </button>
              <AnimatePresence>
                {showCatMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-20 w-44 max-h-56 overflow-y-auto scrollbar-hide"
                  >
                    {CATEGORIES.map((cat) => {
                      const { Icon } = cat;
                      return (
                        <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCatMenu(false); }}
                          className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                            category === cat.id
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}>
                          <Icon size={14} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className={`text-xs ${text.length > 2000 ? "text-red-500" : "text-gray-400"}`}>
              {text.length}/2000
            </span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit}
              disabled={submitting || !text.trim() || text.length > 2000 || mediaItems.some((m) => m.uploading)}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-btn"
              title="Publish">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
