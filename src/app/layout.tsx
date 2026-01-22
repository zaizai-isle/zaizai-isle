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
  title: "Zaizai | AI Product Designer",
  description: "Personal homepage of Zaizai, an AI Product Designer & Project Manager.",
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
      <GoogleAnalytics gaId="G-9E6DSLBBQM" />
    </html>
  );
}
