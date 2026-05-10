import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://sosa-socials.replit.app"),
  title: "LAWSA — Social Platform",
  description: "LAWSA — Connect, Share & Grow with your community.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  manifest: "/manifest.json",
  openGraph: {
    title: "LAWSA — Social Platform",
    description: "LAWSA — Connect, Share & Grow with your community.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "LAWSA" }],
    type: "website",
    siteName: "LAWSA",
  },
  twitter: {
    card: "summary_large_image",
    title: "LAWSA — Social Platform",
    description: "LAWSA — Connect, Share & Grow with your community.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
