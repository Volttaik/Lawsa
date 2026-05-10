"use client";
import { useState, useRef, useEffect, CSSProperties } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export default function ProgressiveImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  style,
  aspectRatio,
  objectFit = "cover",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect(); }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}
      style={{ aspectRatio, ...style }}
    >
      {!loaded && !error && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s linear infinite",
          }}
        />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full transition-opacity duration-400 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
          style={{ objectFit }}
        />
      )}
    </div>
  );
}
