import { learningImagePath } from "@/app/learning/learning-visuals";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { pickInitialEntry } from "@/app/learning/learning-content";
import { DailyLearningCardContent } from "./DailyLearningCardContent";

function pontianakDate() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function DailyLearningCard() {
  const entry = pickInitialEntry(pontianakDate());
  const asset = ({ "hokusai-great-wave": "wave", "bauhaus-chair-b3": "chair", "london-underground-map": "map" } as Record<string, string>)[entry.id];

  return (
    <BentoCard
      colSpan={4}
      rowSpan={2}
      theme="dark"
      className="h-full overflow-hidden p-5 sm:p-6"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="relative z-10 flex h-full flex-col">
        <DailyLearningCardContent fallbackEntry={entry} fallbackImage={learningImagePath(asset, "small")} />
      </div>
    </BentoCard>
  );
}
