import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HandT Thrift Store",
  description: "A community-driven online thrift marketplace.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Global Marquee Beta Banner */}
        <div className="w-full bg-gradient-to-r from-lavender/30 via-blue/20 to-purple/20 border-b border-purple/20 text-xs sm:text-sm font-extrabold overflow-hidden py-2.5 sm:py-3 z-[9999] relative backdrop-blur-md hover:bg-lavender/40 transition-colors cursor-default">
          <div className="animate-marquee flex gap-8 w-max">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-8">
                <span className="tracking-[0.2em] uppercase text-purple-900 border border-purple/30 bg-white/60 px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                  ✨ Beta
                </span>
                <span className="opacity-80 tracking-widest text-gray-700 font-bold uppercase drop-shadow-sm">Exclusive to NIT Hamirpur students</span>
                <span className="opacity-30 font-light text-xl text-purple">|</span>
              </div>
            ))}
          </div>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
