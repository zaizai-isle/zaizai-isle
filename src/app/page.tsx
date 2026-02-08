"use client";

import { IdentityCard } from "@/components/bento/IdentityCard";
import { WeatherCard } from "@/components/bento/WeatherCard";
import { StatsCard } from "@/components/bento/StatsCard";
import { GuestbookCard } from "@/components/bento/GuestbookCard";
import { SocialCard } from "@/components/bento/SocialCard";
import { WorksCard } from "@/components/bento/WorksCard";
import { AIHubCard } from "@/components/bento/AIHubCard";
import { CompressorCard } from "@/components/bento/CompressorCard";
import { ActivityCard } from "@/components/bento/ActivityCard";
import { TechStackCard } from "@/components/bento/TechStackCard";
import { SharePoster } from "@/components/SharePoster";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

import { CoreBuildCard } from "@/components/bento/CoreBuildCard";
import { EnvironmentNotes } from "@/components/bento/EnvironmentNotes";
import { SystemBoundary } from "@/components/bento/SystemBoundary";
import { SystemStatus } from "@/components/SystemStatus";
import { cn } from "@/lib/utils";

export default function Home() {
  const { t } = useLanguage();

  const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="mb-4 ml-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-6 bg-white/20 rounded-full"></span>
        <h2 className="text-xl font-bold text-white tracking-tight uppercase">{title}</h2>
      </div>
      <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase ml-3.5">{subtitle}</p>
    </div>
  );

  const gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 auto-rows-auto md:auto-rows-[192px]";

  return (
    <main className="w-full min-h-screen flex flex-col">
      {/* Hidden Share Poster for Image Generation */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <SharePoster />
      </div>

      <SystemStatus />

      <div className="w-full max-w-[1336px] mx-auto px-4 md:px-8 pb-8 space-y-6">

        {/* SECTION 1: SYSTEM ONLINE LAYER */}
        <section className="pt-0">
          <div className={cn(gridClass, "mt-0")}>
            <IdentityCard />
            <StatsCard />
            <SocialCard />
            <CoreBuildCard />
            <ActivityCard />
          </div>
        </section>

        {/* SECTION 2: CONSTRUCTION ZONE */}
        <section>
          {/* <SectionTitle title="Construction Zone" subtitle="Current build outputs & operational modules" /> */}
          <div className={gridClass}>
            <TechStackCard />
            <WorksCard />
            <CompressorCard />
            <AIHubCard />
          </div>
        </section>

        {/* SECTION 3: OBSERVATION & ARCHIVE ZONE */}
        <section>
          <div className={gridClass}>
            <GuestbookCard />
            <EnvironmentNotes />
            <WeatherCard />
          </div>
        </section>
      </div>

      {/* FINAL BOUNDARY */}
      <SystemBoundary />
    </main >
  );
}
