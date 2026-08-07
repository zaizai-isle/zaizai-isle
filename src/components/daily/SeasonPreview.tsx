"use client";

import type { CSSProperties } from "react";
import { Flower2, Leaf, RotateCcw, Snowflake, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLanguage, DailySeason } from "@/lib/daily-notes";
import { SeasonLandscape } from "./SeasonLandscape";

interface SeasonPreviewProps {
  language: DailyLanguage;
  actualSeason: DailySeason;
  activeSeason: DailySeason;
  onPreview: (season: DailySeason) => void;
  onReset: () => void;
}

const seasons = [
  { id: "spring", zh: "春日", en: "Spring", zhPalette: "粉紫 · 奶油黄", enPalette: "Lilac pink · Butter", color: "#9b87d6", soft: "#eee5fa", icon: Flower2 },
  { id: "summer", zh: "夏日", en: "Summer", zhPalette: "海盐蓝 · 柠檬", enPalette: "Sea salt · Lemon", color: "#8eb6b2", soft: "#d8e8e4", icon: SunMedium },
  { id: "autumn", zh: "秋日", en: "Autumn", zhPalette: "陶土 · 杏黄", enPalette: "Clay · Apricot", color: "#bc9076", soft: "#ead9cc", icon: Leaf },
  { id: "winter", zh: "冬日", en: "Winter", zhPalette: "雾蓝 · 冰白", enPalette: "Mist blue · Ice", color: "#86a6bd", soft: "#d6e2e9", icon: Snowflake },
] as const;

export function SeasonPreview({ language, actualSeason, activeSeason, onPreview, onReset }: SeasonPreviewProps) {
  const isPreviewing = activeSeason !== actualSeason;
  const activeLabel = seasons.find((season) => season.id === activeSeason);

  return (
    <section aria-labelledby="season-preview-title" className="mt-8 sm:mt-10">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--daily-muted)] opacity-60">
            Season widgets
          </p>
          <h2 id="season-preview-title" className="mt-0.5 text-sm font-semibold text-[var(--daily-ink)]">
            {language === "zh" ? "四季组件" : "Season widgets"}
          </h2>
        </div>

        {isPreviewing ? (
          <button type="button" onClick={onReset} className="flex items-center gap-1.5 rounded-full border border-white/75 bg-[var(--daily-surface)] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--daily-muted)] shadow-[-4px_-4px_9px_rgba(255,255,255,0.7),5px_5px_10px_var(--daily-shadow)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--daily-accent)]">
            <RotateCcw className="h-3 w-3" />
            {language === "zh" ? `正在预览${activeLabel?.zh}` : `Previewing ${activeLabel?.en}`}
          </button>
        ) : null}
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid min-w-[680px] grid-cols-4 gap-4 sm:min-w-0 sm:gap-5">
          {seasons.map((season) => {
            const isActive = season.id === activeSeason;
            const isCurrent = season.id === actualSeason;
            const Icon = season.icon;
            return (
              <button
                key={season.id}
                type="button"
                onClick={() => onPreview(season.id)}
                aria-pressed={isActive}
                className={cn(
                  "group relative min-h-28 touch-manipulation overflow-hidden rounded-[1.65rem] border border-white/75 bg-[var(--daily-surface)] p-4 text-left text-[var(--daily-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--daily-accent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  isActive
                    ? "shadow-[inset_5px_5px_11px_var(--daily-shadow),inset_-5px_-5px_11px_rgba(255,255,255,0.74)]"
                    : "shadow-[-5px_-5px_14px_rgba(255,255,255,0.58),8px_10px_24px_var(--daily-shadow)]",
                )}
                style={{ "--season-color": season.color, "--season-soft": season.soft } as CSSProperties}
              >
                <span className="relative flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold">{language === "zh" ? season.zh : season.en}</span>
                    <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--daily-muted)] opacity-65">
                      {language === "zh" ? season.zhPalette : season.enPalette}
                    </span>
                  </span>
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--daily-surface)] p-1 shadow-[-3px_-3px_7px_rgba(255,255,255,0.72),4px_4px_8px_var(--daily-shadow)]">
                    <SeasonLandscape season={season.id} className="h-full w-full" />
                    <Icon className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[var(--season-soft)] p-1 text-[var(--season-color)]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>
                <span className="absolute bottom-3.5 left-4 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--daily-muted)] opacity-60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--season-color)]" />
                  {isCurrent ? (language === "zh" ? "当前季节" : "Current") : isActive ? (language === "zh" ? "预览中" : "Previewing") : (language === "zh" ? "点击预览" : "Preview")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
