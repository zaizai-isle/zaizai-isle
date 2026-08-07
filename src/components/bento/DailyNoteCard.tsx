"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { getDailyNote, getSeason, getTodayKey, parseDateKey } from "@/lib/daily-notes";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const seasonStyles = {
  spring: {
    background: "linear-gradient(135deg, rgba(245,249,234,0.97) 0%, rgba(238,245,223,0.94) 55%, rgba(220,236,200,0.94) 100%)",
    ink: "text-[#5f873f]",
    bodyInk: "text-[#7fb05a]",
    accent: "bg-[#7fb05a]",
    fold: "bg-[#cde9a7]/50",
  },
  summer: {
    background: "linear-gradient(135deg, rgba(247,247,232,0.97) 0%, rgba(239,245,232,0.94) 48%, rgba(215,236,236,0.95) 100%)",
    ink: "text-[#0d6593]",
    bodyInk: "text-[#107ab1]",
    accent: "bg-[#f5d609]",
    fold: "bg-[#9fd2d4]/50",
  },
  autumn: {
    background: "linear-gradient(135deg, rgba(250,246,237,0.97) 0%, rgba(246,236,222,0.94) 56%, rgba(231,211,190,0.94) 100%)",
    ink: "text-[#6a493b]",
    bodyInk: "text-[#6a493b]",
    accent: "bg-[#b47d5d]",
    fold: "bg-[#dab593]/50",
  },
  winter: {
    background: "linear-gradient(135deg, rgba(247,248,247,0.97) 0%, rgba(237,241,244,0.94) 55%, rgba(217,228,237,0.94) 100%)",
    ink: "text-[#40586b]",
    bodyInk: "text-[#40586b]",
    accent: "bg-[#7892a8]",
    fold: "bg-[#b8cad9]/50",
  },
} as const;

export function DailyNoteCard() {
  const { language } = useLanguage();
  const todayKey = getTodayKey();
  const today = parseDateKey(todayKey) ?? new Date();
  const note = getDailyNote(today, language);
  const season = getSeason(today.getMonth());
  const style = seasonStyles[season];
  const shortDate = `${String(today.getMonth() + 1).padStart(2, "0")} / ${String(today.getDate()).padStart(2, "0")}`;
  const weekday = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  }).format(today);

  return (
    <BentoCard
      colSpan={4}
      rowSpan={1}
      theme="light"
      className="group h-full min-h-[192px] cursor-pointer overflow-hidden bg-transparent p-0 hover:bg-transparent"
      style={{ backgroundImage: style.background }}
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#243b35_0.6px,transparent_0.6px)] [background-size:6px_6px]" />
      <div className={cn("pointer-events-none absolute -bottom-9 right-1 font-serif text-[124px] leading-none tracking-[-0.1em] opacity-[0.045] transition-transform duration-500 group-hover:-translate-y-1", style.ink)}>
        {String(today.getDate()).padStart(2, "0")}
      </div>
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/35 blur-3xl" />

      <Link
        href="/daily"
        aria-label={language === "zh" ? "打开今天的小岛日签" : "Open today's isle daily note"}
        className="relative z-10 flex h-full min-h-[192px] flex-col p-5 focus-visible:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
      >
        <header className="flex items-start justify-between gap-4">
          <div className={cn("flex items-center gap-2", style.ink)}>
            <span className="grid h-7 w-7 place-items-center rounded-full border border-current/10 bg-white/25">
              <BookOpen className="h-3.5 w-3.5 opacity-60" />
            </span>
            <div>
              <h3 className="text-sm font-semibold leading-none">
                {language === "zh" ? "小岛日签" : "Isle Daily"}
              </h3>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] opacity-45">Daily note</p>
            </div>
          </div>

          <div className={cn("flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]", style.ink)}>
            <span className="opacity-50">{shortDate} · {weekday}</span>
            <span className="grid h-7 w-7 place-items-center rounded-full border border-current/10 bg-white/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/50">
              <ArrowUpRight className="h-3.5 w-3.5 opacity-65" />
            </span>
          </div>
        </header>

        <blockquote className={cn("flex flex-1 flex-col justify-center py-2 font-serif font-medium tracking-wide", style.bodyInk)}>
          {note.lines.map((line) => (
            <p
              key={line}
              className={cn(
                language === "zh"
                  ? "text-[19px] leading-[1.58]"
                  : "max-w-[90%] text-[16px] leading-[1.42]",
              )}
            >
              {line}
            </p>
          ))}
        </blockquote>

        <footer className={cn("flex items-end justify-between gap-3 text-[10px]", style.ink)}>
          <div className="flex min-w-0 items-center gap-2 opacity-55">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.accent)} />
            <span className="truncate font-medium">{note.author}</span>
            <span className="truncate font-mono opacity-65">
              {language === "zh" ? `《${note.source}》` : note.source}
            </span>
          </div>
          <span className="shrink-0 font-mono uppercase tracking-[0.13em] opacity-40">
            {language === "zh" ? "今日已更新" : "Updated today"}
          </span>
        </footer>
      </Link>

      <div className={cn("pointer-events-none absolute bottom-0 right-0 z-20 h-7 w-7 origin-bottom-right opacity-0 shadow-[-5px_-5px_14px_rgba(71,85,105,0.08)] transition-all duration-300 [clip-path:polygon(100%_0,0_100%,100%_100%)] group-hover:opacity-100", style.fold)} />
    </BentoCard>
  );
}
