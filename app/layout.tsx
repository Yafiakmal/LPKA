import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LPKA Kelas 1 Martapura — Inventaris",
  description: "Sistem Inventaris Barang LPKA Kelas 1 Martapura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "h-full",
        inter.variable,
        figtree.variable,
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
