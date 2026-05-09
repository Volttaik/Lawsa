import { Broadcast } from "@phosphor-icons/react";

export default function LivePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#111] border border-[#2f3336] flex items-center justify-center">
        <Broadcast className="w-10 h-10 text-red-500" weight="fill" />
      </div>
      <div>
        <h1 className="text-white text-2xl font-black mb-2">Live Streaming</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Go live and broadcast to your followers in real time.
          This feature is coming soon — stay tuned.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 text-sm font-semibold">Coming Soon</span>
      </div>
    </div>
  );
}
