import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sosa Socials — Connect, Share & Grow",
  description: "Sosa Socials is a modern social networking platform to connect, collaborate, and share ideas.",
  icons: { icon: "/icon.jpg", apple: "/icon.jpg" },
  openGraph: {
    title: "Sosa Socials — Connect, Share & Grow",
    description: "A modern social networking platform to connect, collaborate, and share ideas.",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "Sosa Socials" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sosa Socials — Connect, Share & Grow",
    description: "A modern social networking platform to connect, collaborate, and share ideas.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.jpg" type="image/jpeg" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
