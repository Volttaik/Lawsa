"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  onExpand?: () => void;
}

export default function VideoPlayer({ src, onExpand }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2800);
  }, []);

  const revealControls = () => {
    setShowControls(true);
    if (playing) scheduleHide();
  };

  const togglePlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      scheduleHide();
    } else {
      v.pause();
      setPlaying(false);
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setProgress(v.duration ? v.currentTime / v.duration : 0);
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1) / (v.duration || 1));
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  useEffect(() => () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }, []);

  if (!src || errored) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden select-none"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={revealControls}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        muted={muted}
        className="w-full block max-h-[72vh] object-contain"
        style={{ display: "block" }}
        onError={() => setErrored(true)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setShowControls(true); setProgress(0); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Centre play button when paused */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center shadow-[0_2px_24px_0_rgba(0,0,0,0.5)]">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 bottom-0 pointer-events-none"
          >
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2.5 px-3 pb-3 pt-2 pointer-events-auto">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-7 h-7 flex items-center justify-center text-white hover:text-white/80 transition-colors flex-shrink-0"
              >
                {playing
                  ? <Pause size={16} fill="white" />
                  : <Play size={16} fill="white" className="ml-0.5" />}
              </button>

              {/* Progress bar */}
              <div
                className="flex-1 h-1 bg-white/25 rounded-full relative cursor-pointer group/bar"
                onClick={handleScrub}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const el = e.currentTarget as HTMLDivElement;
                  const onMove = (ev: MouseEvent) => {
                    const v = videoRef.current;
                    if (!v || !v.duration) return;
                    const rect = el.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                    v.currentTime = ratio * v.duration;
                    setProgress(ratio);
                  };
                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${buffered * 100}%` }} />
                <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>

              {/* Time */}
              <span className="text-[10px] text-white/80 tabular-nums flex-shrink-0 font-medium">
                {fmt(progress * duration)} / {fmt(duration)}
              </span>

              {/* Mute */}
              <button
                onClick={toggleMute}
                className="w-7 h-7 flex items-center justify-center text-white hover:text-white/80 transition-colors flex-shrink-0"
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Expand / fullscreen */}
              <button
                onClick={handleExpand}
                className="w-7 h-7 flex items-center justify-center text-white hover:text-white/80 transition-colors flex-shrink-0"
              >
                <Maximize size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
