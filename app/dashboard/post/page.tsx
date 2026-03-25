"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Video, X, Send, Loader2, ArrowLeft, Film } from "lucide-react";

type MediaItem = { type: "image" | "video"; data: string; name: string };

export default function CreatePostPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaItems((prev) => [...prev, { type, data: reader.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeMedia = (i: number) => setMediaItems((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");

    const images = mediaItems.filter((m) => m.type === "image").map((m) => m.data);
    const videos = mediaItems.filter((m) => m.type === "video").map((m) => m.data);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, images, videos }),
    });
    const data = await res.json();
    if (data.post) {
      router.push("/dashboard");
    } else {
      setError(data.error || "Failed to create post");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-soft">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Share something with your network</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-card p-6">
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl p-3 mb-4">
            {error}
          </motion.div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Share a thought, project, or idea..."
          className="w-full resize-none text-gray-800 dark:text-gray-200 dark:bg-gray-900 text-base focus:outline-none min-h-[140px] leading-relaxed placeholder-gray-400 dark:placeholder-gray-600"
          rows={5}
          autoFocus
        />

        {/* Media Previews */}
        <AnimatePresence>
          {mediaItems.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3 mt-4">
              {mediaItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="relative">
                  {item.type === "image" ? (
                    <img src={item.data} alt="" className="w-24 h-24 rounded-xl object-cover border border-black/10 dark:border-white/10" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-1 overflow-hidden relative">
                      <video src={item.data} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <Film size={20} className="relative z-10 text-white drop-shadow" />
                      <span className="relative z-10 text-[9px] text-white font-medium drop-shadow truncate px-1 max-w-full">{item.name}</span>
                    </div>
                  )}
                  <button onClick={() => removeMedia(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5">
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
          <div className="flex items-center gap-3">
            <span className={`text-xs ${text.length > 2000 ? "text-red-500" : "text-gray-400"}`}>
              {text.length}/2000
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={submitting || !text.trim() || text.length > 2000}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-btn"
              title="Publish"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
