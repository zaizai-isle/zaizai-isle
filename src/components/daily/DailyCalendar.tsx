"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLanguage, DailySeason, toDateKey } from "@/lib/daily-notes";

interface DailyCalendarProps {
  selectedDate: Date;
  todayKey: string;
  language: DailyLanguage;
  onSelect: (date: Date) => void;
  className?: string;
  season: DailySeason;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

export function DailyCalendar({ selectedDate, todayKey, language, onSelect, className, season }: DailyCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));
  const selectedKey = toDateKey(selectedDate);

  useEffect(() => {
    setVisibleMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const cells = useMemo(() => {
    const firstWeekday = (visibleMonth.getDay() + 6) % 7;
    const firstCell = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - firstWeekday, 12);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstCell);
      date.setDate(firstCell.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const weekdays = language === "zh"
    ? ["一", "二", "三", "四", "五", "六", "日"]
    : ["M", "T", "W", "T", "F", "S", "S"];
  const title = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(visibleMonth);

  const shiftMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12));
  };

  return (
    <section
      aria-label={language === "zh" ? "日签日历" : "Daily note calendar"}
      data-season={season}
      className={cn(
        "flex flex-col rounded-[2.25rem] border border-white/80 bg-[var(--daily-surface)] p-5 shadow-[-12px_-12px_26px_rgba(255,255,255,0.62),14px_16px_30px_var(--daily-shadow),inset_1px_1px_1px_rgba(255,255,255,0.8)] transition-colors duration-500 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--daily-muted)] opacity-70">
            {language === "zh" ? "日签档案" : "Daily archive"}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--daily-ink)]">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label={language === "zh" ? "上个月" : "Previous month"} className="grid h-10 w-10 place-items-center rounded-full border border-white/75 bg-[var(--daily-surface)] text-[var(--daily-muted)] shadow-[-4px_-4px_9px_rgba(255,255,255,0.75),5px_5px_10px_var(--daily-shadow)] transition hover:-translate-y-0.5 hover:text-[var(--daily-ink)] active:translate-y-0 active:shadow-[inset_3px_3px_6px_var(--daily-shadow),inset_-3px_-3px_6px_rgba(255,255,255,0.78)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--daily-accent)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} aria-label={language === "zh" ? "下个月" : "Next month"} className="grid h-10 w-10 place-items-center rounded-full border border-white/75 bg-[var(--daily-surface)] text-[var(--daily-muted)] shadow-[-4px_-4px_9px_rgba(255,255,255,0.75),5px_5px_10px_var(--daily-shadow)] transition hover:-translate-y-0.5 hover:text-[var(--daily-ink)] active:translate-y-0 active:shadow-[inset_3px_3px_6px_var(--daily-shadow),inset_-3px_-3px_6px_rgba(255,255,255,0.78)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--daily-accent)]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 rounded-[1.6rem] border border-white/55 bg-[var(--daily-surface-soft)] p-2 text-center shadow-[inset_5px_5px_12px_var(--daily-shadow),inset_-5px_-5px_12px_rgba(255,255,255,0.7)] sm:p-3">
        {weekdays.map((day, index) => (
          <div key={`${day}-${index}`} className="py-2 font-mono text-[9px] text-[var(--daily-muted)] opacity-55">{day}</div>
        ))}
        {cells.map((date) => {
          const key = toDateKey(date);
          const isSelected = key === selectedKey;
          const cellIsToday = key === todayKey;
          const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", { dateStyle: "full" }).format(date)}
              aria-current={cellIsToday ? "date" : undefined}
              className={cn(
                "relative grid aspect-square min-h-9 place-items-center rounded-xl text-sm transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--daily-accent)]",
                isCurrentMonth ? "text-[var(--daily-ink)] hover:bg-white/40" : "text-[var(--daily-muted)] opacity-35 hover:bg-white/25",
                isSelected && "bg-[var(--daily-accent)] font-semibold text-[var(--daily-ink)] opacity-100 shadow-[-3px_-3px_7px_rgba(255,255,255,0.55),4px_5px_9px_var(--daily-shadow)] hover:bg-[var(--daily-accent)]",
              )}
            >
              {date.getDate()}
              {cellIsToday && !isSelected ? <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[var(--daily-pop)]" /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--daily-muted)] opacity-65">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--daily-accent)]" />
        {language === "zh" ? "每一天，都有一页留在岛上" : "A page remains on the isle each day"}
      </div>
    </section>
  );
}
