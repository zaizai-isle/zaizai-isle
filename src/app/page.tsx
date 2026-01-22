"use client";

import { IdentityCard } from "@/components/bento/IdentityCard";
import { WeatherCard } from "@/components/bento/WeatherCard";
import { StatsCard } from "@/components/bento/StatsCard";
import { GuestbookCard } from "@/components/bento/GuestbookCard";
import { QRCodeCard } from "@/components/bento/QRCodeCard";
import { WorksCard } from "@/components/bento/WorksCard";
import { ToolsCard } from "@/components/bento/ToolsCard";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <main className="max-w-4xl w-full mx-auto" id="portfolio-container">
      <div className="grid grid-cols-2 md:grid-cols-[repeat(4,200px)] gap-4 auto-rows-[200px] justify-center">
        {/* Row 1 & 2 Left: Identity Card (2x2) */}
        <IdentityCard />
        
        {/* Row 1 Right: Weather Card (2x1) */}
        <WeatherCard />

        {/* Row 2 Right: Stats & QRCode */}
        <StatsCard />
        <QRCodeCard />

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
        <footer className="mt-16 text-gray-400 text-sm">
          {t('page.footer')}
        </footer>
      </motion.div>
    </main>
  );
}
