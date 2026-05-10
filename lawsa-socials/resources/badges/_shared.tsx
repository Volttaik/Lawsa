import type { ReactNode, CSSProperties } from "react";

export interface BadgeProps {
  size?: number;
}

export function SvgBadge({ size, children, style }: { size: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", ...style }}
    >
      {children}
    </svg>
  );
}

export function BadgeWrap({ size, children, title }: { size: number; children: ReactNode; title?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title={title}
    >
      {children}
    </span>
  );
}
