import type { Metadata } from "next";
import "./globals.css";

import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from "@/lib/language-context";
import { BackgroundProvider } from "@/lib/background-context";
import { BackgroundWrapper } from "@/components/BackgroundWrapper";
import { BackgroundController } from "@/components/BackgroundController";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TextModeSwitcher } from "@/components/TextModeSwitcher";

export const metadata: Metadata = {
  title: "Zaizai Isle | AI Product Designer",
  description: "Zaizai Isle — Personal site of an AI Product Designer. Focused on AI-driven product design, UX systems, and end-to-end delivery. Build more, think more, find the spark.",
  keywords: ["Zaizai",
    "Zaizai Isle",
    "AI Product Designer",
    "AI Product Manager",
    "AI UX Design",
    "AI-driven Design",
    "Product Design",
    "End-to-End Delivery",
    "AI产品设计",
    "AI产品经理",
    "极简设计",
    "产品设计",
    "Shoebill"],
  openGraph: {
    title: "Zaizai Isle | AI Product Designer",
    description: "Zaizai Isle — Personal site of an AI Product Designer. Focused on AI-driven product design, UX systems, and end-to-end delivery. Build more, think more, find the spark.",
    images: "https://zaizai-isle.github.io/zaizai-isle/Zaizai-Isle_Shoebill.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProd = process.env.NODE_ENV === 'production';
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen relative overflow-x-hidden">
        <BackgroundProvider>
          <BackgroundWrapper />
          <LanguageProvider>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
              <TextModeSwitcher className="w-9 h-9 p-0" />
              <LanguageSwitcher className="w-9 h-9 p-0" />
              <BackgroundController className="w-9 h-9 p-0" />
            </div>
          </LanguageProvider>
        </BackgroundProvider>
        {isProd && gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
