"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DailyLanguage, DailyNote, DailySeason, getTraditionalDate } from "@/lib/daily-notes";
import { SeasonLandscape } from "./SeasonLandscape";

interface DailyPosterProps {
  date: Date;
  note: DailyNote;
  language: DailyLanguage;
  dateKey: string;
  season: DailySeason;
}

const chineseMonths = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

export function DailyPoster({ date, note, language, dateKey, season }: DailyPosterProps) {
  const weekday = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  }).format(date);
  const traditionalDate = getTraditionalDate(date, language);
  const month = language === "zh"
    ? chineseMonths[date.getMonth()]
    : new Intl.DateTimeFormat("en-US", { month: "long" }).format(date).toUpperCase();

  return (
    <motion.article
      key={`${dateKey}-${language}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate flex min-h-[450px] flex-col overflow-hidden rounded-[2.25rem] border border-white/80 bg-[var(--daily-surface)] p-5 shadow-[-14px_-14px_30px_rgba(255,255,255,0.66),16px_18px_36px_var(--daily-shadow),inset_1px_1px_1px_rgba(255,255,255,0.8)] sm:min-h-[490px] sm:p-8 lg:aspect-[1.56/1] lg:min-h-0"
    >
      <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[var(--daily-accent-soft)] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-12 text-[9rem] font-semibold leading-none text-[var(--daily-accent)] opacity-[0.035]">
        {note.label}
      </div>

      <header className="relative z-10 w-[58%] min-w-0 pt-2 sm:pt-3">
        <div>
          <div className="mb-3 flex items-center gap-5 font-serif text-[11px] tracking-[0.18em] text-[var(--daily-muted)] sm:text-xs">
            <span>{month}</span>
            <span>{weekday}</span>
          </div>
          <div className="flex items-end gap-3 sm:gap-5">
            <span className="font-serif text-[4.15rem] font-normal leading-[0.78] tracking-[-0.07em] text-[var(--daily-ink)] sm:text-[5.5rem] lg:text-[5.75rem]">
              {date.getDate()}
            </span>
            <div className="grid gap-1 pb-1 font-serif text-[var(--daily-muted)] sm:gap-2 sm:pb-2">
              <span className="text-sm tracking-[0.08em] sm:text-base">{date.getFullYear()}</span>
              <span className="whitespace-nowrap text-[9px] tracking-[0.06em] sm:text-[10px] sm:tracking-[0.08em]">
                {traditionalDate.lunar}
              </span>
            </div>
          </div>
        </div>
      </header>

      <figure className="absolute right-5 top-5 z-10 shrink-0 sm:right-8 sm:top-8">
        <div className="rounded-full border border-white/80 bg-[var(--daily-surface)] p-1.5 shadow-[-8px_-8px_18px_rgba(255,255,255,0.76),9px_11px_22px_var(--daily-shadow)] sm:p-3">
          <SeasonLandscape season={season} className="h-24 w-24 sm:h-48 sm:w-48 lg:h-52 lg:w-52" />
        </div>
      </figure>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-2 py-4 sm:px-5 sm:py-5">
        <blockquote className="relative max-w-2xl sm:max-w-[68%]">
          <span aria-hidden="true" className="pointer-events-none absolute -left-3 -top-10 font-serif text-7xl leading-none text-[var(--daily-accent)] opacity-15 sm:-left-6 sm:text-8xl">
            “
          </span>
          {note.lines.map((line) => (
            <p
              key={line}
              className={`font-serif font-medium tracking-wide text-[var(--daily-ink)] ${
                language === "zh"
                  ? "text-[1.85rem] leading-[1.5] sm:text-[2.2rem] lg:text-[2.35rem]"
                  : "text-[1.75rem] leading-[1.35] sm:text-[2.1rem] lg:text-[2.25rem]"
              }`}
            >
              {line}
            </p>
          ))}
        </blockquote>

        <div className="mt-4 flex justify-end text-right text-xs text-[var(--daily-muted)] sm:mt-5">
          <div className="min-w-0">
            <div className="font-medium text-[var(--daily-ink)] opacity-80">
              {language === "zh" ? "—— " : "— "}{note.author}
            </div>
            <div className="mt-1 truncate font-mono text-[10px] opacity-55">
              {language === "zh" ? "《" : ""}{note.source}{language === "zh" ? "》" : ""}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-[var(--daily-muted)]/10 pt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--daily-muted)] opacity-65 sm:pt-4">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Daily · {String(note.index + 1).padStart(3, "0")}
        </span>
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">{language === "zh" ? "小岛日签" : "Isle Daily"}</span>
          <span className="block h-2 w-2 shrink-0 rounded-full bg-[var(--daily-pop)] shadow-[0_2px_4px_var(--daily-shadow)]" />
        </span>
      </footer>
    </motion.article>
  );
}
