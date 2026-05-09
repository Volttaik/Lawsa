export default function DiamondBadge({ size = 18 }: { size?: number }) {
  const id = `db-${size}`;
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0 select-none relative" style={{ width: size, height: size }} title="LAWSA Diamond Account">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", filter: `drop-shadow(0 0 ${size * 0.18}px rgba(103,232,249,0.85)) drop-shadow(0 0 ${size * 0.35}px rgba(192,132,252,0.55))` }}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" /><stop offset="28%" stopColor="#818cf8" />
            <stop offset="56%" stopColor="#e879f9" /><stop offset="80%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <clipPath id={`${id}-clip`}><polygon points="12,1 23,9 12,23 1,9" /></clipPath>
        </defs>
        <polygon points="12,1 23,9 12,23 1,9" fill={`url(#${id}-grad)`} />
        <polygon points="12,1 23,9 12,9" fill="white" fillOpacity="0.38" />
        <polygon points="1,9 12,9 12,23" fill="black" fillOpacity="0.14" />
        <polygon points="7,9 12,3.5 17,9 12,16.5" fill="white" fillOpacity="0.22" />
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="-6" y="0" width="10" height="24" fill="white" fillOpacity="0.72"
            style={{ transformOrigin: "12px 12px", transform: "skewX(-18deg)", animation: "diamond-sweep 2.8s ease-in-out infinite" }} />
        </g>
        <polygon points="12,1 23,9 12,23 1,9" fill="none" stroke="rgba(186,230,253,0.65)" strokeWidth="0.7" />
        <circle cx="12" cy="1.4" r="1.1" fill="white" fillOpacity="0.95" />
      </svg>
    </span>
  );
}
