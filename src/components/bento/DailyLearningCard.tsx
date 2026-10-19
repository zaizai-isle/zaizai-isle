import { TranslatedText } from "@/components/TranslatedText";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { learningImagePath } from "@/app/learning/learning-visuals";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { pickInitialEntry } from "@/app/learning/learning-content";

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
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
            <BookOpen className="h-3.5 w-3.5" />
            <TranslatedText translationKey="learning.card.eyebrow" />
          </p>
          <span className="font-mono text-[9px] tracking-[0.14em] text-white/30">{entry.era}</span>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_44%] items-center gap-4">
          <div><h2 className="text-lg font-medium leading-relaxed tracking-[-0.025em] text-white sm:text-xl">{entry.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-6 text-white/55">{entry.subject} · {entry.creator}</p></div>
          <div className="relative h-28 min-w-0 sm:h-32"><Image src={learningImagePath(asset, "small")} alt={entry.subject} fill sizes="(max-width: 640px) 40vw, 220px" className="object-contain" loading="lazy" /></div>
        </div>

        <Link href="/learning" className="group mt-3 inline-flex min-h-10 w-fit items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <TranslatedText translationKey="learning.card.action" />
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </BentoCard>
  );
}
