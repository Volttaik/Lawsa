"use client";
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { CheckCircle, Warning, Info, X } from "@phosphor-icons/react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; message: string; type: ToastType; }
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: Warning,
  info: Info,
};
const colors: Record<ToastType, string> = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    const timer = setTimeout(() => dismiss(id), 3200);
    timers.current.set(id, timer);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-4 z-[999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 bg-gray-900 border border-white/10 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto max-w-[320px]"
              style={{ animation: "slide-up 0.3s ease-out" }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${colors[t.type]}`} weight="fill" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-gray-500 hover:text-white flex-shrink-0 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
