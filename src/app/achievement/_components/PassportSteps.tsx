import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Download, RotateCcw, X } from "lucide-react";
import { ACHIEVEMENT_CATEGORIES, LIFE_ACHIEVEMENTS, type LifeAchievement } from "../achievements";
import { FILTERS, type FilterId } from "../canvas-renderer";
import {
  PHOTO_TEXTURES,
  STAMP_STYLES,
  type PhotoTextureId,
  type StampDraft,
  type StampStyleId,
} from "../passport-model";
import { AdaptivePaper } from "./AdaptivePaper";

export type PassportStep = "arrival" | "memory" | "style";

const STEP_ITEMS: { id: PassportStep; number: string; label: string; eyebrow: string; title: string; description: string }[] = [
  { id: "arrival", number: "01", label: "写下抵达", eyebrow: "LIFE PASSPORT / ARRIVAL", title: "你抵达了哪里？", description: "有些远方，不在地图上。" },
  { id: "memory", number: "02", label: "留住此刻", eyebrow: "LIFE PASSPORT / MEMORY", title: "那一天，发生了什么？", description: "时间会走，字迹会留下。" },
  { id: "style", number: "03", label: "盖下印记", eyebrow: "LIFE PASSPORT / STAMP", title: "为这一程盖章", description: "走到这里，已经值得好好纪念。" },
];

const EXPERIMENTAL_FILTERS = FILTERS.filter((filter) => filter.id !== "raw");

interface StepContentProps {
  children: React.ReactNode;
}

function StepContent({ children }: StepContentProps) {
  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 pt-3 sm:px-6 sm:pt-5">{children}</section>
  );
}

function StampStyleOutline({ style }: { style: StampStyleId }) {
  return <span aria-hidden="true" className={`stamp-style-outline stamp-style-outline-${style}`} />;
}

function HandDrawnCalendar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-5 w-5 overflow-visible fill-none">
      <path d="M5.2 8.3c4.6-.7 12.8-.8 17.5-.1.7 4.2.6 10.3-.2 14.2-4.9.7-11.9.6-16.8-.1-.7-4.4-.8-9.7-.5-14Z" />
      <path d="M9.2 4.8c-.3 2.3-.2 4.1.1 5.1M18.8 4.6c.2 2.2.1 3.8-.1 5.2M5.6 12.1c5.7.4 11.5.3 16.8-.1" />
      <path d="M9.4 15.8h.2m4.2 0h.2m4.2 0h.2m-9 3.7h.2m4.2 0h.2m4.2 0h.2" />
    </svg>
  );
}

function HandDrawnPin() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-5 w-5 overflow-visible fill-none">
      <path d="M14.1 24.2c-1.5-2.3-6.8-7.1-6.9-11.4-.1-4 2.9-7 6.9-7.2 4.2-.2 7 2.8 6.8 6.8-.2 4.1-4.8 9.3-6.8 11.8Z" />
      <path d="M14.3 9.5c2-.1 3.3 1.2 3.1 3.1-.1 1.8-1.4 3-3.2 3-1.9 0-3.1-1.2-3.1-3.1 0-1.7 1.3-2.9 3.2-3Z" />
    </svg>
  );
}

function HandDrawnPhoto() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10 overflow-visible fill-none">
      <path d="M7.4 11.5c8.7-1.2 23.1-1 32.6.1.8 7.4.8 17.8-.1 25.1-9.3.8-23.5.8-32.5-.2-.7-7.7-.6-17.5 0-25Z" />
      <path d="M10.1 32.9c3.9-4.8 6.9-8 9.7-10.2 2.2 2 4.4 4.3 6.2 6.2 2.5-2.8 4.5-4.7 6.3-6 2.8 2.9 5 6.1 7.3 9.8" />
      <path d="M29.3 9.1c.1-2.2.1-4.1.4-5.7M25.9 6.3c2.5.1 5.3 0 7.7-.2" />
      <path d="M15.7 16.3c1.8-.1 3 1 3 2.7 0 1.8-1.2 2.9-2.9 2.8-1.8-.1-2.8-1.1-2.8-2.8 0-1.6 1.1-2.6 2.7-2.7Z" />
    </svg>
  );
}

const CALENDAR_WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function parseCalendarValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date();
}

function formatCalendarValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function HandDrawnDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = parseCalendarValue(value);
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const closeCalendar = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeCalendar);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeCalendar);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selectedValue = value;
  const todayValue = formatCalendarValue(new Date());
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const moveMonth = (offset: number) => {
    setVisibleMonth(new Date(year, month + offset, 1));
  };

  const selectDate = (day: number) => {
    onChange(formatCalendarValue(new Date(year, month, day)));
    setOpen(false);
  };

  const displayValue = value ? value.replaceAll("-", " / ") : "选择日期";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="选择抵达日期"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="journal-input-line journal-date-trigger relative flex h-12 w-full items-center gap-4 px-2 text-left text-base text-[#202624]"
      >
        <span className="journal-hand-icon shrink-0 text-[#263b35]"><HandDrawnCalendar /></span>
        <span className={value ? "tracking-[0.12em]" : "text-[#8a8f8a]"}>{displayValue}</span>
      </button>

      {open ? (
        <div role="dialog" aria-label="选择日期" className="journal-calendar absolute left-0 top-[calc(100%+.65rem)] z-30 w-[min(22rem,calc(100vw-2rem))] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" aria-label="上个月" onClick={() => moveMonth(-1)} className="journal-calendar-arrow grid h-10 w-10 place-items-center text-xl">←</button>
            <strong className="achievement-title text-xl tracking-[0.12em] text-[#263b35]">{year} 年 {month + 1} 月</strong>
            <button type="button" aria-label="下个月" onClick={() => moveMonth(1)} className="journal-calendar-arrow grid h-10 w-10 place-items-center text-xl">→</button>
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-xs text-[#737972]">
            {CALENDAR_WEEKDAYS.map((weekday) => <span key={weekday} className="py-1.5">{weekday}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarDays.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} className="h-9" />;
              const dayValue = formatCalendarValue(new Date(year, month, day));
              const selected = dayValue === selectedValue;
              const today = dayValue === todayValue;
              return (
                <button
                  key={dayValue}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectDate(day)}
                  className={`journal-calendar-day relative mx-auto grid h-9 w-9 place-items-center text-sm ${selected ? "journal-calendar-day-selected" : today ? "journal-calendar-day-today" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              onChange(formatCalendarValue(today));
              setOpen(false);
            }}
            className="achievement-handwriting mt-3 block w-full py-2 text-center text-sm text-[#526b45]"
          >
            回到今天
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function StepHeader({ activeStep }: { activeStep: PassportStep }) {
  const activeIndex = STEP_ITEMS.findIndex((item) => item.id === activeStep);
  const currentStep = STEP_ITEMS[activeIndex];
  return (
    <section className="shrink-0 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-2.5 sm:py-3">
        <nav aria-label="创建人生印章进度">
          <ol className="grid grid-cols-3 gap-2 sm:gap-4">
            {STEP_ITEMS.map((item, index) => (
              <li
                key={item.id}
                aria-current={item.id === activeStep ? "step" : undefined}
                className={`relative border-t pt-1 ${index <= activeIndex ? "border-[#526b45]" : "border-[#bfc2bc]"}`}
              >
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                  <span className={`font-mono text-[9px] font-bold tracking-[0.12em] sm:text-[10px] ${index <= activeIndex ? "text-[#526b45]" : "text-[#8a8f8a]"}`}>{item.number}</span>
                  <span className={`whitespace-nowrap text-[11px] font-semibold sm:text-[13px] ${index === activeIndex ? "text-[#202624]" : index < activeIndex ? "text-[#686d68]" : "text-[#8a8f8a]"}`}>{item.label}</span>
                </span>
                {index < STEP_ITEMS.length - 1 ? <span aria-hidden="true" className="absolute -right-[5px] -top-0.5 h-1 w-1 rounded-full bg-[#a7aaa2] sm:-right-[9px]" /> : null}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-2 grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] sm:items-end sm:gap-8">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#526b45] sm:text-[11px]">{currentStep.eyebrow}</span>
            <h1 className="achievement-handwriting mt-0.5 text-balance text-[1.75rem] leading-tight tracking-wide text-[#202624] sm:text-[2.15rem]">{currentStep.title}</h1>
          </div>
          <p className="hidden text-pretty text-sm leading-6 text-[#686d68] sm:block sm:pb-0.5">{currentStep.description}</p>
        </div>
      </div>
    </section>
  );
}

interface ArrivalStepProps {
  draft: StampDraft;
  category: string;
  onCategoryChange: (category: string) => void;
  onDraftChange: (patch: Partial<StampDraft>) => void;
  onNext: () => void;
}

export function ArrivalStep({ draft, category, onCategoryChange, onDraftChange, onNext }: ArrivalStepProps) {
  const visibleAchievements = LIFE_ACHIEVEMENTS.filter((achievement) => achievement.category === category);
  const selectAchievement = (achievement: LifeAchievement) => {
    onDraftChange({
      achievementId: achievement.id,
      title: achievement.title,
      category: achievement.category,
      icon: achievement.icon,
      note: achievement.motto,
    });
  };

  return (
    <StepContent>
      <div className="arrival-journal min-h-0 flex-1">
        <section>
          <span className="achievement-section-title">01  用自己的话写下这一刻</span>
          <label className="block">
            <span className="journal-writing relative mt-1.5 block">
              <span aria-hidden="true" className="journal-tape absolute right-12 -top-1 hidden sm:block" />
              <textarea
                name="arrival-title"
                autoComplete="off"
                rows={2}
                value={draft.title}
                onChange={(event) => onDraftChange({ achievementId: undefined, title: event.target.value.slice(0, 24) })}
                placeholder="例如：第一次一个人生活……"
                className="achievement-title h-[82px] w-full resize-none bg-transparent px-5 py-3 pb-8 text-[1.4rem] leading-8 text-[#202624] outline-none placeholder:text-[#8a8f8a] sm:h-[104px] sm:px-7 sm:py-4 sm:pb-9 sm:text-[1.7rem] sm:leading-10"
              />
              <span className="achievement-handwriting pointer-events-none absolute bottom-2.5 right-3 z-[2] text-sm text-[#7d827d]">{draft.title.length} / 24</span>
            </span>
          </label>
        </section>

        <section className="mt-4 min-w-0 sm:mt-5">
          <span className="achievement-section-title">02  也许，这里正好有你的故事</span>
          <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 sm:mt-3 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-2">
            {ACHIEVEMENT_CATEGORIES.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategoryChange(item)}
                aria-pressed={category === item}
                className={`achievement-option-control journal-topic arrival-topic relative flex min-h-11 items-center gap-2 px-1.5 py-1 text-left sm:min-h-12 sm:gap-3 ${category === item ? "arrival-topic-selected" : ""}`}
              >
                <span className="relative z-[1] font-mono text-[11px] text-[#526b45] sm:text-[13px]">{String(index + 1).padStart(2, "0")}</span>
                <span className={`achievement-option-title truncate ${category === item ? "arrival-topic-label-selected" : ""}`}>{item}</span>
                <span aria-hidden="true" className={`relative z-[1] text-xs ${category === item ? "text-[#d1bd00]" : "text-[#90958f]"}`}>{category === item ? "◎" : "·"}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:gap-4 lg:grid-cols-4">
            {visibleAchievements.map((achievement) => {
              const selected = draft.achievementId === achievement.id;
              return (
                <div key={achievement.id} className="journal-slip-wrap achievement-choice relative">
                  <span aria-hidden="true" className={`journal-mini-tape absolute -top-0.5 right-4 z-10 ${selected ? "journal-mini-tape-selected" : ""}`} />
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectAchievement(achievement)}
                    className="achievement-option-control journal-paper-slip relative grid min-h-[72px] w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 px-3 py-3 text-left transition-transform hover:-translate-y-0.5 sm:min-h-24 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-3 sm:px-4"
                  >
                    <span className="grid h-8 w-8 place-items-center text-lg sm:h-10 sm:w-10 sm:text-xl">{achievement.icon}</span>
                    <span className="relative z-[1] min-w-0">
                      <strong className="achievement-option-title block truncate sm:text-lg">{achievement.title}</strong>
                      <small className="achievement-option-description mt-0.5 block truncate">{achievement.motto}</small>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <StepActions onNext={onNext} nextLabel="为这一刻留下记录" nextDisabled={!draft.title.trim()} />
    </StepContent>
  );
}

interface MemoryStepProps {
  draft: StampDraft;
  photoUrl: string;
  photoAspect: number;
  fileError: string;
  onDraftChange: (patch: Partial<StampDraft>) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function MemoryStep({ draft, photoUrl, photoAspect, fileError, onDraftChange, onPhotoChange, onRemovePhoto, onBack, onNext }: MemoryStepProps) {
  return (
    <StepContent>
      <div className="mx-auto grid w-full max-w-3xl content-start gap-6 pt-7 sm:gap-7 sm:pt-10">
        <div className="grid content-start gap-5">
          <HandDrawnDatePicker value={draft.date} onChange={(date) => onDraftChange({ date })} />
          <label className="block">
            <span className="journal-input-line journal-input-with-icon relative block">
              <span className="journal-hand-icon pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#263b35]"><HandDrawnPin /></span>
              <input aria-label="抵达地点" name="arrival-location" autoComplete="off" value={draft.location} onChange={(event) => onDraftChange({ location: event.target.value.slice(0, 28) })} placeholder="城市、房间，或特别的地方…" className="h-12 w-full border-0 bg-transparent pl-11 pr-2 text-base text-[#202624] outline-none placeholder:text-[#8a8f8a]" />
            </span>
          </label>
          <label className="block">
            <span className="journal-writing relative block">
              <textarea aria-label="留给这一刻的一句话" name="arrival-note" autoComplete="off" value={draft.note} onChange={(event) => onDraftChange({ note: event.target.value.slice(0, 72) })} rows={4} placeholder="留给这一刻的一句话……" className="achievement-handwriting h-32 w-full resize-none bg-transparent px-3 py-2 pb-9 text-lg leading-8 text-[#202624] outline-none placeholder:text-[#8a8f8a]" />
              <span className="achievement-handwriting pointer-events-none absolute bottom-2.5 right-3 z-[2] text-sm text-[#7d827d]">{draft.note.length} / 72</span>
            </span>
          </label>
        </div>

        <div className="min-w-0 pb-2">
          {photoUrl ? (
            <div
              className="journal-slip-wrap journal-photo-frame relative mx-auto"
              style={{ "--photo-aspect": photoAspect } as CSSProperties}
            >
              <span aria-hidden="true" className="journal-tape absolute -top-1 left-1/2 z-10 -translate-x-1/2" />
              <AdaptivePaper className="journal-paper-photo flex w-full justify-center" contentClassName="relative w-full">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: photoAspect }}>
                  <Image src={photoUrl} alt="所选人生时刻完整预览" fill unoptimized sizes="(min-width: 1024px) 42rem, calc(100vw - 3rem)" className="object-contain" />
                  <button type="button" onClick={onRemovePhoto} aria-label="移除照片" className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-[#f2f0e8] text-[#263b35] shadow-md hover:bg-white"><X className="h-4 w-4" /></button>
                </div>
              </AdaptivePaper>
            </div>
          ) : (
            <div className="journal-slip-wrap relative">
              <span aria-hidden="true" className="journal-tape absolute -top-1 left-1/2 z-10 -translate-x-1/2" />
              <label className="journal-paper-slip relative grid min-h-44 cursor-pointer place-items-center bg-[#f2f0e8]/65 p-5 text-center transition-transform hover:-translate-y-0.5 sm:min-h-48">
                <span>
                  <span className="journal-hand-icon mx-auto block w-fit text-[#526b45]"><HandDrawnPhoto /></span>
                  <strong className="achievement-option-title mt-3 block">放入一张照片</strong>
                  <small className="achievement-option-description mt-1.5 block">有些记忆，一眼就能回来</small>
                  <span aria-hidden="true" className="achievement-handwriting mt-2 block text-[#d8ce25]">↗</span>
                </span>
                <input name="arrival-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
              </label>
            </div>
          )}
          {fileError ? <p role="alert" className="mt-2 text-sm text-[#a02f28]">{fileError}</p> : null}
        </div>
      </div>

      <StepActions onBack={onBack} onNext={onNext} nextLabel="选择印章样式" />
    </StepContent>
  );
}

interface StyleStepProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  draft: StampDraft;
  hasPhoto: boolean;
  onDraftChange: (patch: Partial<StampDraft>) => void;
  onBack: () => void;
  onExport: () => void;
  onRestart: () => void;
}

export function StyleStep({ canvasRef, draft, hasPhoto, onDraftChange, onBack, onExport, onRestart }: StyleStepProps) {
  return (
    <StepContent>
      <div className="grid min-h-0 flex-1 items-stretch gap-5 lg:basis-0 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] lg:gap-7">
        <figure className="flex min-h-0 flex-col">
          <div className="grid min-h-64 flex-1 place-items-center">
            <canvas ref={canvasRef} aria-label={`${draft.title}印章样式实时预览`} className="max-h-[250px] w-auto max-w-full shadow-[0_18px_45px_rgba(32,38,36,0.2)] sm:max-h-[320px] lg:max-h-[calc(100dvh-285px)]" />
          </div>
          <figcaption className="mt-2 flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.08em] text-[#686d68]">
            <span>这一程，确实发生过</span><span>LIFE PASSPORT</span>
          </figcaption>
        </figure>

        <div className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <h2 className="achievement-section-title">01   印章样式</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {STAMP_STYLES.map((style) => {
              const selected = draft.style === style.id;
              return (
                <div key={style.id} className="journal-slip-wrap relative">
                  <span aria-hidden="true" className={`journal-mini-tape absolute -top-1 right-4 z-10 ${selected ? "journal-mini-tape-selected" : ""}`} />
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onDraftChange({ style: style.id as StampStyleId })}
                    className="achievement-option-control journal-paper-slip relative grid min-h-20 w-full grid-cols-[48px_1fr] items-center gap-2 p-2 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <StampStyleOutline style={style.id} />
                    <span className="relative z-[1] min-w-0"><strong className="achievement-option-title block">{style.label}</strong><small className="achievement-option-description mt-0.5 block text-pretty">{style.description}</small></span>
                  </button>
                </div>
              );
            })}
          </div>

          {hasPhoto ? (
            <div className="mt-4 pt-1">
              <h2 className="achievement-section-title">02 / 照片质感</h2>
              <div className="mt-1.5 grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-3">
                {PHOTO_TEXTURES.map((texture) => (
                  <button
                    key={texture.id}
                    type="button"
                    aria-pressed={draft.texture === texture.id}
                    onClick={() => onDraftChange({ texture: texture.id as PhotoTextureId })}
                    className={`achievement-option-control achievement-texture-option journal-topic relative text-left ${draft.texture === texture.id ? "journal-topic-selected" : ""}`}
                  >
                    <strong className="achievement-option-title block">{texture.label}</strong>
                    <small className="achievement-option-description mt-1 block text-pretty">{texture.description}</small>
                  </button>
                ))}
              </div>

              {draft.texture === "experimental" ? (
                <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 sm:grid-cols-4 xl:grid-cols-6">
                  {EXPERIMENTAL_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={draft.experimentalFilter === filter.id}
                      onClick={() => onDraftChange({ experimentalFilter: filter.id as FilterId })}
                      className={`achievement-filter-option journal-topic relative w-full px-2 py-1 ${draft.experimentalFilter === filter.id ? "journal-topic-selected" : ""}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <StepActions
        onBack={onBack}
        onNext={onExport}
        nextLabel="收下这张纪念卡"
        nextIcon={<Download className="h-4 w-4" />}
        onSecondary={onRestart}
        secondaryLabel="记录另一次抵达"
        secondaryIcon={<RotateCcw className="h-3.5 w-3.5" />}
      />
    </StepContent>
  );
}

interface StepActionsProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  nextIcon?: React.ReactNode;
  onSecondary?: () => void;
  secondaryLabel?: string;
  secondaryIcon?: React.ReactNode;
}

function StepActions({ onBack, onNext, nextLabel, nextDisabled = false, nextIcon, onSecondary, secondaryLabel, secondaryIcon }: StepActionsProps) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto flex shrink-0 flex-col-reverse gap-2 pt-5 pb-[calc(.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
      {onBack ? <button type="button" onClick={onBack} className="flex h-11 items-center justify-center gap-2 px-3 text-sm text-[#5f6560] hover:text-[#263b35]"><ArrowLeft className="h-4 w-4" />返回上一步</button> : <span />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {onSecondary && secondaryLabel ? <button type="button" onClick={onSecondary} className="flex h-11 items-center justify-center gap-2 px-3 text-sm text-[#5f6560] hover:text-[#263b35]">{secondaryIcon}{secondaryLabel}</button> : null}
        <button type="button" disabled={nextDisabled} onClick={onNext} className="journal-ink-button flex h-10 items-center justify-center gap-2 bg-[#263b35] px-5 text-base font-semibold text-[#f2f0e8] hover:bg-[#526b45] disabled:cursor-not-allowed disabled:bg-[#929792]">{nextLabel}{nextIcon ?? <ArrowRight className="h-4 w-4 text-[#e2d849]" />}</button>
      </div>
    </div>
  );
}
