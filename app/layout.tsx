import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lawsa Socials — Connect, Share & Grow",
  description: "Lawsa Socials is a modern social networking platform for students and professionals to connect, collaborate, and share ideas.",
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "Lawsa Socials — Connect, Share & Grow",
    description: "A modern social networking platform for students and professionals to connect, collaborate, and share ideas.",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "Lawsa Socials" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawsa Socials — Connect, Share & Grow",
    description: "A modern social networking platform for students and professionals to connect, collaborate, and share ideas.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.jpg" type="image/jpeg" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-950`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
