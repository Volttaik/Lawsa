import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Warning, X } from "@phosphor-icons/react";

interface Toast { id: string; message: string; type: "success" | "error" | "info"; }
interface ToastContextValue { toast: (message: string, type?: Toast["type"]) => void; }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl pointer-events-auto max-w-sm
                ${t.type === "error" ? "bg-red-950/90 border-red-800/50 text-red-200" : t.type === "info" ? "bg-blue-950/90 border-blue-800/50 text-blue-200" : "bg-[#111] border-white/10 text-white"}`}>
              {t.type === "error" ? <Warning size={16} weight="fill" className="text-red-400 flex-shrink-0" /> : <CheckCircle size={16} weight="fill" className="text-green-400 flex-shrink-0" />}
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"><X size={14} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
