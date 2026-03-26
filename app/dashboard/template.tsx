"use client";
import { motion } from "framer-motion";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0, 0.2, 1] }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
