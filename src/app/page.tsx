import { DailyLearningCard } from "@/components/bento/DailyLearningCard";
import { DeferredHomeGrids } from "@/components/bento/DeferredHomeGrids";
import { IdentityCard } from "@/components/bento/IdentityCard";
import { SocialCard } from "@/components/bento/SocialCard";
import { StatsCard } from "@/components/bento/StatsCard";

import { CoreBuildCard } from "@/components/bento/CoreBuildCard";
import { SystemBoundary } from "@/components/bento/SystemBoundary";
import { SystemStatus } from "@/components/SystemStatus";
import type { ReactNode } from "react";

const CardSlot = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="contents" data-card-slot={name}>
    {children}
  </div>
);

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <SystemStatus />

      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-12 pb-8 space-y-6">

        {/* SECTION 1: SYSTEM ONLINE LAYER */}
        <section className="pt-0" data-grid-section="system-online">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12" data-bento-grid="system-online">
            <div className="xl:col-span-4 xl:aspect-square">
              <CardSlot name="identity"><IdentityCard /></CardSlot>
            </div>
            <div className="flex flex-col gap-6 xl:col-span-4 xl:grid xl:aspect-square xl:grid-cols-4 xl:grid-rows-4" data-card-group="island-owner-state">
              <CardSlot name="stats"><StatsCard /></CardSlot>
              <CardSlot name="social"><SocialCard /></CardSlot>
              <CardSlot name="daily-learning"><DailyLearningCard /></CardSlot>
            </div>
            <div className="xl:col-span-4 xl:aspect-square">
              <CardSlot name="core-build"><CoreBuildCard /></CardSlot>
            </div>
          </div>
        </section>

        <DeferredHomeGrids />
      </div>

      {/* FINAL BOUNDARY */}
      <SystemBoundary />
    </main >
  );
}
