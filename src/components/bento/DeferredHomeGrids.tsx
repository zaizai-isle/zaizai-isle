import type { ReactNode } from "react";
import { WorksCard } from "./WorksCard";
import { DeferredAIHubCard, DeferredDailyNoteCard, DeferredGuestbookCard, DeferredWeatherCard } from "./DeferredViewportCards";

const CardSlot = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="contents" data-card-slot={name}>{children}</div>
);

const gridClass = "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[220px]";

export function DeferredHomeGrids() {
  return (
    <>
      <section data-grid-section="selected-structures">
        <div className={gridClass} data-bento-grid="selected-structures">
          <CardSlot name="ai-hub"><DeferredAIHubCard /></CardSlot>
          <CardSlot name="works"><WorksCard /></CardSlot>
          <CardSlot name="weather"><DeferredWeatherCard /></CardSlot>
          <CardSlot name="daily-note"><DeferredDailyNoteCard /></CardSlot>
          <CardSlot name="guestbook"><DeferredGuestbookCard /></CardSlot>
        </div>
      </section>
    </>
  );
}
