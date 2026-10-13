import { ActivityCard } from "@/components/bento/ActivityCard";
import { DeferredHomeGrids } from "@/components/bento/DeferredHomeGrids";
import { IdentityCard } from "@/components/bento/IdentityCard";
import { SocialCard } from "@/components/bento/SocialCard";
import { StatsCard } from "@/components/bento/StatsCard";

import { CoreBuildCard } from "@/components/bento/CoreBuildCard";
import { SystemBoundary } from "@/components/bento/SystemBoundary";
import { SystemStatus } from "@/components/SystemStatus";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const CardSlot = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="contents" data-card-slot={name}>
    {children}
  </div>
);

export default function Home() {
  const gridClass = "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[220px]";

  return (
    <main className="w-full min-h-screen flex flex-col">
      <SystemStatus />

      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-12 pb-8 space-y-6">

        {/* SECTION 1: SYSTEM ONLINE LAYER */}
        <section className="pt-0" data-grid-section="system-online">
          <div className={cn(gridClass, "mt-0")} data-bento-grid="system-online">
            <CardSlot name="identity"><IdentityCard /></CardSlot>
            <CardSlot name="stats"><StatsCard /></CardSlot>
            <CardSlot name="social"><SocialCard /></CardSlot>
            <CardSlot name="core-build"><CoreBuildCard /></CardSlot>
            <CardSlot name="activity"><ActivityCard /></CardSlot>
          </div>
        </section>

        <DeferredHomeGrids />
      </div>

      {/* FINAL BOUNDARY */}
      <SystemBoundary />
    </main >
  );
}
