"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, RotateCcw } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import { DailyCalendar } from "./DailyCalendar";
import { DailyPoster } from "./DailyPoster";
import { SeasonPreview } from "./SeasonPreview";
import { DailySeason, getDailyNote, getSeason, getTodayKey, parseDateKey, toDateKey } from "@/lib/daily-notes";
import { useLanguage } from "@/lib/language-context";

const seasonThemes: Record<DailySeason, CSSProperties> = {
  spring: {
    "--daily-canvas": "#eee7f6",
    "--daily-surface": "#fff9f7",
    "--daily-surface-soft": "#f5e9f2",
    "--daily-ink": "#4b4256",
    "--daily-muted": "#82758c",
    "--daily-accent": "#9b87d6",
    "--daily-accent-soft": "#e2d7f7",
    "--daily-pop": "#ecafc4",
    "--daily-warm": "#f7d8a8",
    "--daily-shadow": "rgba(113, 88, 142, 0.20)",
  } as CSSProperties,
  summer: {
    "--daily-canvas": "#e8efec",
    "--daily-surface": "#f5f4ed",
    "--daily-surface-soft": "#edf3ef",
    "--daily-ink": "#2f3b3a",
    "--daily-muted": "#6b7b78",
    "--daily-accent": "#8eb6b2",
    "--daily-accent-soft": "#d8e8e4",
    "--daily-pop": "#e7a2a7",
    "--daily-warm": "#e9cc7f",
    "--daily-shadow": "rgba(69, 93, 88, 0.20)",
  } as CSSProperties,
  autumn: {
    "--daily-canvas": "#eee7df",
    "--daily-surface": "#f6f0e8",
    "--daily-surface-soft": "#f0e8de",
    "--daily-ink": "#433936",
    "--daily-muted": "#83736b",
    "--daily-accent": "#bc9076",
    "--daily-accent-soft": "#ead9cc",
    "--daily-pop": "#c7776c",
    "--daily-warm": "#d8ad69",
    "--daily-shadow": "rgba(104, 79, 65, 0.20)",
  } as CSSProperties,
  winter: {
    "--daily-canvas": "#e4e9ed",
    "--daily-surface": "#f1f2f1",
    "--daily-surface-soft": "#e8edf0",
    "--daily-ink": "#303b49",
    "--daily-muted": "#6d7b89",
    "--daily-accent": "#86a6bd",
    "--daily-accent-soft": "#d6e2e9",
    "--daily-pop": "#c88f98",
    "--daily-warm": "#d8bd79",
    "--daily-shadow": "rgba(66, 82, 99, 0.22)",
  } as CSSProperties,
};

export function DailyPage() {
  const { language } = useLanguage();
  const [seasonPreview, setSeasonPreview] = useState<{ dateKey: string; season: DailySeason } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const todayKey = getTodayKey();
  const requestedDate = searchParams.get("date");
  const selectedDate = useMemo(
    () => parseDateKey(requestedDate) ?? parseDateKey(todayKey) ?? new Date(),
    [requestedDate, todayKey],
  );
  const selectedKey = toDateKey(selectedDate);
  const note = useMemo(() => getDailyNote(selectedDate, language), [selectedDate, language]);
  const isToday = selectedKey === todayKey;
  const actualSeason = getSeason(selectedDate.getMonth());
  const activeSeason = seasonPreview?.dateKey === selectedKey ? seasonPreview.season : actualSeason;

  const selectDate = useCallback((date: Date) => {
    const key = toDateKey(date);
    const query = key === todayKey ? "" : `?date=${key}`;
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [pathname, router, todayKey]);

  return (
    <main
      className="daily-theme relative min-h-screen overflow-hidden bg-[var(--daily-canvas)] px-4 py-4 text-[var(--daily-ink)] transition-colors duration-700 sm:px-7 sm:py-6 lg:px-10 lg:py-8"
      style={seasonThemes[activeSeason]}
    >
      <div className="pointer-events-none absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-white/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-[8%] h-96 w-96 rounded-full bg-[var(--daily-accent-soft)]/45 blur-3xl" />
      {activeSeason === "spring" ? (
        <div className="pointer-events-none absolute -right-20 top-[-7rem] h-80 w-80 rounded-full bg-[var(--daily-warm)] opacity-25 blur-3xl" />
      ) : null}
      <div className="pointer-events-none absolute right-[8%] top-28 h-16 w-16 rounded-full border border-white/55 bg-white/15 shadow-[inset_-5px_-7px_12px_rgba(255,255,255,0.2),inset_5px_7px_12px_rgba(70,90,80,0.06)]" />

      <div className="relative mx-auto max-w-[1160px]">
        <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label={language === "zh" ? "返回小岛首页" : "Back to isle home"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/75 bg-[var(--daily-surface)] text-[var(--daily-muted)] shadow-[-5px_-5px_12px_rgba(255,255,255,0.72),6px_7px_14px_var(--daily-shadow)] transition duration-200 hover:-translate-y-0.5 hover:text-[var(--daily-ink)] active:translate-y-0 active:shadow-[inset_3px_3px_7px_var(--daily-shadow),inset_-3px_-3px_7px_rgba(255,255,255,0.8)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--daily-accent)]">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-[var(--daily-accent)]" />
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {language === "zh" ? "小岛日签" : "Isle Daily"}
                </h1>
              </div>
              <p className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--daily-muted)] sm:block">
                {language === "zh" ? "在时间里，留下一页" : "A page held in time"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => selectDate(parseDateKey(todayKey) ?? new Date())}
              disabled={isToday}
              aria-label={language === "zh" ? "回到今天" : "Back to today"}
              className="flex h-11 items-center gap-2 rounded-full border border-white/75 bg-[var(--daily-surface)] px-3 text-xs font-medium text-[var(--daily-muted)] shadow-[-5px_-5px_12px_rgba(255,255,255,0.72),6px_7px_14px_var(--daily-shadow)] transition duration-200 hover:-translate-y-0.5 hover:text-[var(--daily-ink)] active:translate-y-0 active:shadow-[inset_3px_3px_7px_var(--daily-shadow),inset_-3px_-3px_7px_rgba(255,255,255,0.8)] disabled:cursor-default disabled:opacity-45 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--daily-accent)] sm:px-4"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === "zh" ? "今天" : "Today"}</span>
            </button>
          </div>
        </header>

        <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.48fr)_minmax(330px,0.72fr)] lg:gap-8">
          <DailyPoster date={selectedDate} note={note} language={language} dateKey={selectedKey} season={activeSeason} />

          <aside>
            <DailyCalendar selectedDate={selectedDate} todayKey={todayKey} language={language} onSelect={selectDate} season={activeSeason} className="h-full" />
          </aside>
        </section>

        <SeasonPreview
          language={language}
          actualSeason={actualSeason}
          activeSeason={activeSeason}
          onPreview={(season) => setSeasonPreview({ dateKey: selectedKey, season })}
          onReset={() => setSeasonPreview(null)}
        />

        <footer className="mt-8 flex items-center justify-center gap-3 pb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--daily-muted)] opacity-65">
          <span className="h-px w-8 bg-current opacity-30" />
          {language === "zh" ? "Zaizai Isle · 每日一页" : "Zaizai Isle · One page a day"}
          <span className="h-px w-8 bg-current opacity-30" />
        </footer>
      </div>
    </main>
  );
}
