import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from "@/lib/language-context";
import { BackgroundProvider } from "@/lib/background-context";
import { BackgroundWrapper } from "@/components/BackgroundWrapper";
import { BackgroundController } from "@/components/BackgroundController";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zaizai Isle | AI Product Designer",
  description: "Zaizai Isle - A digital sanctuary for AI Product Design. Build more, think more, find the spark. 专注 AI 产品设计与交付，在静谧中捕捉逻辑的火花。",
  keywords: ["Zaizai", "Zaizai Isle", "AI Product Designer", "UIUX", "Minimalist Design", "Shoebill", "产品经理", "AI设计", "极简主义"],
  openGraph: {
    title: "Zaizai Isle | AI Product Designer",
    description: "Zaizai Isle - A digital sanctuary for AI Product Design. Build more, think more, find the spark. 专注 AI 产品设计与交付，在静谧中捕捉逻辑的火花。",     
    images: "https://zaizai-isle.github.io/zaizai-isle/T.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} antialiased min-h-screen p-4 md:p-8 flex items-center justify-center`}>
        <BackgroundProvider>
          <BackgroundWrapper />
          <LanguageProvider>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
              <LanguageSwitcher className="w-9 h-9 p-0" />
              <BackgroundController className="w-9 h-9 p-0" />
            </div>
          </LanguageProvider>
        </BackgroundProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
