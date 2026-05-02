"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, attribute, defaultTheme, enableSystem }: { children: React.ReactNode; attribute?: string; defaultTheme?: string; enableSystem?: boolean }) {
  return (
    <NextThemesProvider attribute={attribute || "class"} defaultTheme={defaultTheme || "system"} enableSystem={enableSystem !== false}>
      {children}
    </NextThemesProvider>
  );
}
