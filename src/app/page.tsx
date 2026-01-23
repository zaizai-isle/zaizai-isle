"use client";

import { IdentityCard } from "@/components/bento/IdentityCard";
import { WeatherCard } from "@/components/bento/WeatherCard";
import { StatsCard } from "@/components/bento/StatsCard";
import { GuestbookCard } from "@/components/bento/GuestbookCard";
import { QRCodeCard } from "@/components/bento/QRCodeCard";
import { WorksCard } from "@/components/bento/WorksCard";
import { ToolsCard } from "@/components/bento/ToolsCard";
import { SharePoster } from "@/components/SharePoster";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <main className="max-w-4xl w-full mx-auto p-4 md:p-0" id="portfolio-container">
      {/* Hidden Share Poster for Image Generation */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <SharePoster />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(4,200px)] gap-4 auto-rows-auto md:auto-rows-[200px] justify-center">
        {/* Row 1 & 2 Left: Identity Card (2x2) */}
        <IdentityCard />
        
        {/* Row 1 Right: Weather Card (2x1) */}
        <WeatherCard />

        {/* Row 2 Right: Stats & QRCode */}
        <div className="grid grid-cols-2 gap-4 md:contents">
          <StatsCard />
          <QRCodeCard />
        </div>

        {/* Row 3 */}
        <GuestbookCard />
        <WorksCard />

        {/* Row 4: Tools Card (Full Width) */}
        <ToolsCard />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <footer className="mt-16 text-sm text-white mix-blend-difference font-medium z-50 relative opacity-60">
          {t('page.footer')}
          <span className="block mt-2 text-xs opacity-60">v1.2.1</span>
        </footer>
      </motion.div>
    </main>
  );
}
