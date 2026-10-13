import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const colSpanClasses: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const rowSpanClasses: Record<number, string> = {
  1: "md:row-span-1",
  2: "md:row-span-2",
  3: "md:row-span-3",
  4: "md:row-span-4",
  5: "md:row-span-5",
  6: "md:row-span-6",
};

interface BentoCardPlaceholderProps {
  name: string;
  colSpan: number;
  rowSpan?: number;
}

/**
 * Keeps the exported HTML's bento geometry intact while a below-the-fold card
 * waits for its client bundle. The marker also makes the static export easy to
 * audit without executing JavaScript.
 */
export const BentoCardPlaceholder = forwardRef<HTMLDivElement, BentoCardPlaceholderProps>(
  function BentoCardPlaceholder({ name, colSpan, rowSpan = 1 }, ref) {
    return (
    <div
      ref={ref}
      aria-label={`${name} card placeholder`}
      data-card-placeholder={name}
      className={cn(
        "min-h-[192px] rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl",
        "md:min-h-0",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
      )}
    >
      <span className="sr-only">{name}</span>
    </div>
    );
  },
);
