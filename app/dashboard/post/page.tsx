"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Video, X, Send, Loader2, ArrowLeft, Play, ChevronDown,
  Globe, Scale, Cpu, Trophy, Newspaper, BookOpen, Briefcase,
  CalendarDays, HeartPulse, Music, Palette, CheckCircle2, AlertCircle,
  Film, FileImage, RotateCcw, HardDrive,
} from "lucide-react";
import { uploadFile } from "@/lib/uploadClient";

const CATEGORIES = [
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

type UploadStatus = "uploading" | "done" | "error";

type MediaItem = {
  id: string;
  type: "image" | "video";
  preview: string;
  serverUrl: string;
  status: UploadStatus;
  filename: string;
  fileSize: number;
  progress: number;
  file: File;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function MediaCard({ item, onRemove, onRetry }: {
  item: MediaItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const isUploading = item.status === "uploading";
  const isError = item.status === "error";
  const isDone = item.status === "done";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
        isError
          ? "border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.15)]"
          : isDone
          ? "border-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.15)]"
          : "border-blue-400 shadow-[0_0_0_3px_rgba(96,165,250,0.15)]"
      }`}
    >
      <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800 relative">
        {item.type === "image" ? (
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <video src={item.preview} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                <Play size={14} className="text-white ml-0.5" />
              </div>
            </div>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="text-white animate-spin" />
            <span className="text-[10px] text-white/90 font-semibold">Uploading…</span>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-1">
            <AlertCircle size={18} className="text-red-200" />
            <span className="text-[9px] text-red-200 font-semibold">Failed</span>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-blue-400 rounded-full"
            animate={{ width: ["10%", "90%"] }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
        </div>
      )}

      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-sm transition-colors z-10"
      >
        <X size={10} />
      </button>

      {isDone && (
        <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
          <CheckCircle2 size={11} className="text-white" />
        </div>
      )}

      {isError && (
        <button
          onClick={() => onRetry(item.id)}
          className="absolute top-1 left-1 w-5 h-5 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-sm transition-colors z-10"
          title="Retry upload"
        >
          <RotateCcw size={10} className="text-white" />
        </button>
      )}

      <div className="px-1.5 py-1 bg-black/50 absolute bottom-0 left-0 right-0">
        <p className="text-[9px] text-white/80 truncate">{item.filename}</p>
        <p className="text-[9px] text-white/50">{formatBytes(item.fileSize)}</p>
      </div>
    </motion.div>
  );
}

export default function CreatePostPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [category, setCategory] = useState("general");
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const previewRefs = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      previewRefs.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const uploadToServer = async (file: File, id: string) => {
    try {
      const url = await uploadFile(file, "posts", (progress) => {
        setMedia((prev) =>
          prev.map((m) => m.id === id ? { ...m, progress } : m)
        );
      });
      setMedia((prev) =>
        prev.map((m) => m.id === id ? { ...m, serverUrl: url, status: "done", progress: 100 } : m)
      );
    } catch {
      setMedia((prev) =>
        prev.map((m) => m.id === id ? { ...m, status: "error", progress: 0 } : m)
      );
    }
  };

  const handleFiles = (files: FileList | null, type: "image" | "video") => {
    if (!files) return;
    setGlobalError("");

    const MAX_MB = type === "video" ? 100 : 10;
    const MAX_BYTES = MAX_MB * 1024 * 1024;

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setGlobalError(`${file.name} is too large. Max ${MAX_MB}MB for ${type}s.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      previewRefs.current.push(preview);
      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const item: MediaItem = {
        id,
        type,
        preview,
        serverUrl: "",
        status: "uploading",
        filename: file.name,
        fileSize: file.size,
        progress: 0,
        file,
      };

      setMedia((prev) => [...prev, item]);
      uploadToServer(file, id);
    }
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const retryUpload = (id: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.file) {
        const updated = prev.map((m) => m.id === id ? { ...m, status: "uploading" as UploadStatus, serverUrl: "", progress: 0 } : m);
        uploadToServer(item.file, id);
        return updated;
      }
      return prev;
    });
  };

  const canSubmit =
    text.trim().length > 0 &&
    text.length <= 2000 &&
    !submitting &&
    media.every((m) => m.status !== "uploading");

  const hasFailedUploads = media.some((m) => m.status === "error");

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (hasFailedUploads) {
      setGlobalError("Some files failed to upload. Remove them or retry before posting.");
      return;
    }

    setSubmitting(true);
    setGlobalError("");

    try {
      const images = media
        .filter((m) => m.type === "image" && m.serverUrl)
        .map((m) => m.serverUrl);
      const videos = media
        .filter((m) => m.type === "video" && m.serverUrl)
        .map((m) => m.serverUrl);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim(), images, videos, category }),
      });

      const data = await res.json();

      if (res.ok && data.post) {
        cache.invalidate("posts:");
        cache.invalidate("dashboard:initial");
        router.push("/dashboard");
      } else {
        setGlobalError(data.error || "Failed to create post. Please try again.");
      }
    } catch {
      setGlobalError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const SelectedIcon = selectedCat.Icon;
  const uploadingCount = media.filter((m) => m.status === "uploading").length;
  const doneCount = media.filter((m) => m.status === "done").length;
  const totalSize = media.reduce((acc, m) => acc + m.fileSize, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Share something with your network</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-6">

        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl p-3 mb-4"
            >
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{globalError}</span>
              <button onClick={() => setGlobalError("")} className="flex-shrink-0 ml-1">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Share a thought, project, or idea..."
          className="w-full resize-none text-gray-800 dark:text-gray-200 dark:bg-gray-900 text-base focus:outline-none min-h-[140px] leading-relaxed placeholder-gray-400 dark:placeholder-gray-600"
          rows={5}
          autoFocus
        />

        {/* Media Library */}
        <AnimatePresence>
          {media.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <HardDrive size={12} />
                  <span>{media.length} file{media.length !== 1 ? "s" : ""} · {formatBytes(totalSize)}</span>
                  {uploadingCount > 0 && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Loader2 size={11} className="animate-spin" />
                      {uploadingCount} uploading…
                    </span>
                  )}
                  {uploadingCount === 0 && doneCount > 0 && hasFailedUploads === false && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 size={11} />
                      All uploaded
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMedia([])}
                  className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {media.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onRemove={removeMedia}
                      onRetry={retryUpload}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {hasFailedUploads && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-3 py-2"
                >
                  <AlertCircle size={12} />
                  Some uploads failed. Tap the orange retry button or remove the failed files.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop Zone (shown when no media) */}
        {media.length === 0 && (
          <label className="mt-4 w-full flex flex-col items-center gap-3 py-8 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileImage size={20} className="text-blue-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Film size={20} className="text-purple-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add photos or videos</p>
              <p className="text-xs text-gray-400 mt-0.5">Up to 10MB per image · Up to 100MB per video</p>
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
                const vidFiles = Array.from(files).filter((f) => f.type.startsWith("video/"));
                if (imgFiles.length > 0) handleFiles(Object.assign(new DataTransfer(), { files: imgFiles.reduce((dt, f) => { dt.items.add(f); return dt; }, new DataTransfer()) }).files, "image");
                if (vidFiles.length > 0) handleFiles(Object.assign(new DataTransfer(), { files: vidFiles.reduce((dt, f) => { dt.items.add(f); return dt; }, new DataTransfer()) }).files, "video");
                e.target.value = "";
              }}
            />
          </label>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium">
              <ImageIcon size={17} />
              Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files, "image"); e.target.value = ""; }}
              />
            </label>
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 transition-colors px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium">
              <Video size={17} />
              Video
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files, "video"); e.target.value = ""; }}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowCatMenu((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
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
                    {CATEGORIES.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => { setCategory(id); setShowCatMenu(false); }}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                          category === id
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className={`text-xs tabular-nums ${text.length > 2000 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
              {text.length}/2000
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={
                uploadingCount > 0
                  ? "Wait for uploads to finish"
                  : hasFailedUploads
                  ? "Fix failed uploads first"
                  : !text.trim()
                  ? "Write something first"
                  : "Publish"
              }
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-btn"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
