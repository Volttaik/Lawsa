"use client";
import { useMemo } from "react";

const URL_RE =
  /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|\b[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.(com|org|net|io|edu|gov|co|app|dev|ai|uk|ng|ca|de|fr|au|us|info|biz|xyz|me|tv)\b(?:\/[^\s<>"']*)?)/g;

function toHref(raw: string) {
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return "https://" + raw;
}

export default function Linkify({
  text,
  className,
  linkClass,
}: {
  text: string;
  className?: string;
  linkClass?: string;
}) {
  const parts = useMemo(() => {
    if (!text) return [{ type: "text" as const, value: "" }];
    const out: { type: "text" | "link"; value: string }[] = [];
    let last = 0;
    URL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = URL_RE.exec(text)) !== null) {
      if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
      out.push({ type: "link", value: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === "link" ? (
          <a
            key={i}
            href={toHref(p.value)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass ?? "text-blue-500 hover:underline break-all"}
            onClick={(e) => e.stopPropagation()}
          >
            {p.value}
          </a>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  );
}
