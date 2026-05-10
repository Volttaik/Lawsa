import Image from "next/image";

export function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="LAWSA Logo"
      width={size}
      height={size}
      className="rounded-full object-cover object-center shrink-0"
      style={{ width: size, height: size }}
      priority
    />
  );
}

export function Logo({ size = 28, showText = true, textClass = "font-bold text-gray-900 dark:text-white" }: {
  size?: number;
  showText?: boolean;
  textClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon size={size} />
      {showText && <span className={textClass}>LAWSA</span>}
    </div>
  );
}
