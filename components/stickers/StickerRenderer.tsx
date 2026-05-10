"use client";
import Linkify from "@/components/Linkify";
import { Sticker, isStickerKnown } from "./StickerLibrary";

interface Props {
  content: string;
  className?: string;
  linkClass?: string;
}

const STICKER_RE = /\[s:([a-z_]+)\]/g;

function parseSegments(text: string) {
  const segments: Array<{ type: "text"; value: string } | { type: "sticker"; id: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  STICKER_RE.lastIndex = 0;

  while ((match = STICKER_RE.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: text.slice(last, match.index) });
    }
    segments.push({ type: "sticker", id: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments;
}

export default function StickerRenderer({ content, className = "", linkClass = "text-blue-300 underline break-all" }: Props) {
  if (!content) return null;

  const hasSticker = STICKER_RE.test(content);
  STICKER_RE.lastIndex = 0;

  if (!hasSticker) {
    return (
      <Linkify text={content} className={`whitespace-pre-wrap break-words ${className}`} linkClass={linkClass} />
    );
  }

  const segments = parseSegments(content);

  const stickerCount = segments.filter(s => s.type === "sticker").length;
  const textCount    = segments.filter(s => s.type === "text" && s.value.trim()).length;

  const stickerSize = stickerCount === 1 && textCount === 0 ? 120 : 48;

  return (
    <span className={`whitespace-pre-wrap break-words inline-flex flex-wrap items-end gap-1 ${className}`}>
      {segments.map((seg, i) => {
        if (seg.type === "sticker") {
          const known = isStickerKnown(seg.id);
          if (!known) {
            return <span key={i}>[sticker]</span>;
          }
          return <Sticker key={i} id={seg.id} size={stickerSize} />;
        }
        if (!seg.value) return null;
        return (
          <Linkify key={i} text={seg.value} className="whitespace-pre-wrap break-words" linkClass={linkClass} />
        );
      })}
    </span>
  );
}
