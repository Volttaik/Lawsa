export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#111] rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-white/10 rounded-full w-32" />
              <div className="h-2.5 bg-white/10 rounded-full w-20" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded-full w-full" />
            <div className="h-3 bg-white/10 rounded-full w-4/5" />
            <div className="h-3 bg-white/10 rounded-full w-3/5" />
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="h-3 bg-white/10 rounded-full w-12" />
            <div className="h-3 bg-white/10 rounded-full w-12" />
            <div className="h-3 bg-white/10 rounded-full w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
