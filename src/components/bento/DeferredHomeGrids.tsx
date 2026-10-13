import type { ReactNode } from "react";
import { PassportCard } from "./PassportCard";
import { TechStackCard } from "./TechStackCard";
import { WorksCard } from "./WorksCard";
import { DeferredAIHubCard, DeferredCompressorCard, DeferredDailyNoteCard, DeferredGuestbookCard, DeferredWeatherCard } from "./DeferredViewportCards";

const CardSlot = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="contents" data-card-slot={name}>{children}</div>
);

const gridClass = "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[220px]";

export function DeferredHomeGrids() {
  return (
    <>
      <section data-grid-section="construction-zone">
        <div className={gridClass} data-bento-grid="construction-zone">
          <CardSlot name="tech-stack"><TechStackCard /></CardSlot>
          <CardSlot name="works"><WorksCard /></CardSlot>
          <CardSlot name="passport"><PassportCard /></CardSlot>
          <CardSlot name="compressor"><DeferredCompressorCard /></CardSlot>
          <CardSlot name="ai-hub"><DeferredAIHubCard /></CardSlot>
        </div>
      </section>

      <section data-grid-section="observation-archive">
        <div className={gridClass} data-bento-grid="observation-archive">
          <CardSlot name="guestbook"><DeferredGuestbookCard /></CardSlot>
          <CardSlot name="daily-note"><DeferredDailyNoteCard /></CardSlot>
          <CardSlot name="weather"><DeferredWeatherCard /></CardSlot>
        </div>
      </section>
    </>
  );
}
