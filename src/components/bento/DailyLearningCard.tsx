import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { DailyLearningCardContent } from "./DailyLearningCardContent";

export function DailyLearningCard() {
  return (
    <BentoCard
      colSpan={4}
      rowSpan={2}
      theme="dark"
      className="h-full overflow-hidden p-5 sm:p-6"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="relative z-10 flex h-full flex-col">
        <DailyLearningCardContent />
      </div>
    </BentoCard>
  );
}
