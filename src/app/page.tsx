"use client";

import dynamic from "next/dynamic";

const IdentityCard = dynamic(() => import("@/components/bento/IdentityCard").then(mod => mod.IdentityCard), { ssr: false });
const WeatherCard = dynamic(() => import("@/components/bento/WeatherCard").then(mod => mod.WeatherCard), { ssr: false });
const StatsCard = dynamic(() => import("@/components/bento/StatsCard").then(mod => mod.StatsCard), { ssr: false });
const GuestbookCard = dynamic(() => import("@/components/bento/GuestbookCard").then(mod => mod.GuestbookCard), { ssr: false });
const SocialCard = dynamic(() => import("@/components/bento/SocialCard").then(mod => mod.SocialCard), { ssr: false });
const WorksCard = dynamic(() => import("@/components/bento/WorksCard").then(mod => mod.WorksCard), { ssr: false });
const AIHubCard = dynamic(() => import("@/components/bento/AIHubCard").then(mod => mod.AIHubCard), { ssr: false });
const CompressorCard = dynamic(() => import("@/components/bento/CompressorCard").then(mod => mod.CompressorCard), { ssr: false });
const ActivityCard = dynamic(() => import("@/components/bento/ActivityCard").then(mod => mod.ActivityCard), { ssr: false });
const TechStackCard = dynamic(() => import("@/components/bento/TechStackCard").then(mod => mod.TechStackCard), { ssr: false });
import { SharePoster } from "@/components/SharePoster";

import { CoreBuildCard } from "@/components/bento/CoreBuildCard";
import { EnvironmentNotes } from "@/components/bento/EnvironmentNotes";
import { SystemBoundary } from "@/components/bento/SystemBoundary";
import { SystemStatus } from "@/components/SystemStatus";
import { cn } from "@/lib/utils";

export default function Home() {
  const gridClass = "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[220px]";

  return (
    <main className="w-full min-h-screen flex flex-col">
      {/* Hidden Share Poster for Image Generation */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <SharePoster />
      </div>

      <SystemStatus />

      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-12 pb-8 space-y-6">

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
