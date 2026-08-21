import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import Link from "next/link";
import { BookMarked, Download, RotateCcw, X } from "lucide-react";
import { ACHIEVEMENT_CATEGORIES, LIFE_ACHIEVEMENTS, type LifeAchievement } from "../achievements";
import { FILTERS, type FilterId } from "../canvas-renderer";
import {
  PHOTO_TEXTURES,
  STAMP_STYLES,
  type PhotoTextureId,
  type StampDraft,
  type StampStyleId,
} from "../passport-model";

const EXPERIMENTAL_FILTERS = FILTERS.filter((filter) => filter.id !== "raw");

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
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-6 w-6 overflow-visible fill-none">
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

interface AchievementCreatorProps {
  draft: StampDraft;
  category: string;
  photoUrl: string;
  fileError: string;
  previewError: string;
  exportState: "idle" | "exporting" | "success" | "error";
  saveState: "idle" | "saving" | "success" | "error";
  saveError: string;
  isEditing: boolean;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onCategoryChange: (category: string) => void;
  onDraftChange: (patch: Partial<StampDraft>) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onSave: () => void;
  onExport: () => void;
  onRestart: () => void;
}

export function AchievementCreator({ draft, category, photoUrl, fileError, previewError, exportState, saveState, saveError, isEditing, canvasRef, onCategoryChange, onDraftChange, onPhotoChange, onRemovePhoto, onSave, onExport, onRestart }: AchievementCreatorProps) {
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [selectedInspirationId, setSelectedInspirationId] = useState<string | undefined>(draft.achievementId);
  const inspirationTriggerRef = useRef<HTMLButtonElement>(null);
  const inspirationCloseRef = useRef<HTMLButtonElement>(null);
  const inspirationDialogRef = useRef<HTMLElement>(null);
  const visibleAchievements = LIFE_ACHIEVEMENTS.filter((achievement) => achievement.category === category);
  const selectedInspiration = LIFE_ACHIEVEMENTS.find((achievement) => achievement.id === selectedInspirationId);

  useEffect(() => {
    if (!inspirationOpen) return;
    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInspirationOpen(false);
        window.requestAnimationFrame(() => inspirationTriggerRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusableElements = inspirationDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleDialogKeyDown);
    window.requestAnimationFrame(() => inspirationCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleDialogKeyDown);
    };
  }, [inspirationOpen]);

  const closeInspiration = () => {
    setInspirationOpen(false);
    window.requestAnimationFrame(() => inspirationTriggerRef.current?.focus());
  };

  const useInspiration = () => {
    if (!selectedInspiration) return;
    onDraftChange({ achievementId: selectedInspiration.id, title: selectedInspiration.title, category: selectedInspiration.category, icon: selectedInspiration.icon, note: selectedInspiration.motto });
    closeInspiration();
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:pb-5">
      <div className="mb-5 grid shrink-0 gap-1 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(280px,.7fr)] sm:items-end sm:gap-8">
        <div><span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#526b45] sm:text-[11px]">LIFE PASSPORT / CREATE</span><h1 className="achievement-handwriting mt-1 text-balance text-[1.75rem] leading-tight tracking-wide text-[#202624] sm:text-[2.15rem]">把这一程，好好记下来</h1></div>
        <p className="hidden text-right text-pretty text-sm leading-6 text-[#686d68] sm:block">记录这一程，也为它留下一枚印记。</p>
      </div>

      <div className="grid items-start gap-7 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,.72fr)] lg:gap-9">
        <div className="achievement-form-scroll grid min-w-0 auto-rows-max content-start gap-3 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pb-8 lg:pr-3">
          <section>
            <label className="sr-only" htmlFor="achievement-title">写下成就</label>
            <span className="journal-input-line relative block">
              <input id="achievement-title" name="achievement-title" autoComplete="off" maxLength={24} value={draft.title} onChange={(event) => onDraftChange({ achievementId: undefined, title: event.target.value })} placeholder="例如：第一次一个人生活……" className="achievement-title h-12 w-full border-0 bg-transparent px-2 pr-32 text-xl text-[#202624] outline-none placeholder:text-[#8a8f8a] sm:pr-36 sm:text-2xl" />
              <button ref={inspirationTriggerRef} type="button" aria-haspopup="dialog" onClick={() => { setSelectedInspirationId(draft.achievementId); setInspirationOpen(true); }} className="achievement-handwriting absolute inset-y-0 right-1 flex min-h-11 items-center px-2 text-sm text-[#526b45] hover:text-[#263b35]">寻找灵感 ↗</button>
            </span>
          </section>

          <section>
            <label className="sr-only" htmlFor="achievement-note">留下一句话</label>
            <span className="journal-writing relative block"><textarea id="achievement-note" name="achievement-note" autoComplete="off" maxLength={72} value={draft.note} onChange={(event) => onDraftChange({ note: event.target.value })} rows={4} placeholder="关于这一程，你最想让未来的自己记住什么？" className="achievement-handwriting h-32 w-full resize-none bg-transparent px-3 py-2 text-lg leading-8 text-[#202624] outline-none placeholder:text-[#8a8f8a]" /></span>
          </section>

          <section aria-label="时间与地点">
            <div className="grid gap-3 sm:grid-cols-2">
              <HandDrawnDatePicker value={draft.date} onChange={(date) => onDraftChange({ date })} />
              <label className="block"><span className="journal-input-line journal-input-with-icon relative block"><span className="journal-hand-icon pointer-events-none absolute inset-y-0 left-2 flex items-center text-[#263b35]"><HandDrawnPin /></span><input aria-label="抵达地点" name="arrival-location" autoComplete="off" value={draft.location} onChange={(event) => onDraftChange({ location: event.target.value.slice(0, 28) })} placeholder="城市、房间，或特别的地方…" className="h-12 w-full border-0 bg-transparent pl-11 pr-2 text-base text-[#202624] outline-none placeholder:text-[#8a8f8a]" /></span></label>
            </div>
          </section>

          <section className="min-w-0" aria-label="照片（可选）">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2">
                <label className="journal-input-line relative flex h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 text-left focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-[#526b45]">
                <span className="journal-hand-icon shrink-0 text-[#526b45]"><HandDrawnPhoto /></span>
                <strong className="achievement-handwriting min-w-0 flex-1 text-base font-normal text-[#526b45]">{photoUrl ? "替换照片" : "添加照片（可选）"}</strong>
                <span aria-hidden="true" className="achievement-handwriting shrink-0 text-[#526b45]">↗</span>
                <input name="arrival-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
                </label>
                {photoUrl ? <button type="button" onClick={onRemovePhoto} className="h-11 shrink-0 px-2 text-sm text-[#686d68] hover:text-[#a02f28]">移除照片</button> : null}
              </div>
              {fileError ? <p role="alert" className="mt-2 text-sm text-[#a02f28]">{fileError}</p> : null}
            </div>
          </section>

          <section aria-label="选择印章">
            <div className="grid gap-2 sm:grid-cols-3">
              {STAMP_STYLES.map((style) => { const selected = draft.style === style.id; return <div key={style.id} className="journal-slip-wrap relative"><span aria-hidden="true" className={`journal-mini-tape absolute -top-1 right-4 z-10 ${selected ? "journal-mini-tape-selected" : ""}`} /><button type="button" aria-pressed={selected} onClick={() => onDraftChange({ style: style.id as StampStyleId })} className="achievement-option-control journal-paper-slip relative grid min-h-20 w-full grid-cols-[48px_1fr] items-center gap-2 p-2 text-left transition-transform hover:-translate-y-0.5"><StampStyleOutline style={style.id} /><span className="relative z-[1] min-w-0"><strong className="achievement-option-title block">{style.label}</strong><small className="achievement-option-description mt-0.5 block text-pretty">{style.description}</small></span></button></div>; })}
            </div>

            {photoUrl ? (
              <div className="mt-5 pt-1" aria-label="照片质感"><div className="grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-3">{PHOTO_TEXTURES.map((texture) => <button key={texture.id} type="button" aria-pressed={draft.texture === texture.id} onClick={() => onDraftChange({ texture: texture.id as PhotoTextureId })} className={`achievement-option-control achievement-texture-option journal-topic relative text-left ${draft.texture === texture.id ? "journal-topic-selected" : ""}`}><strong className="achievement-option-title block">{texture.label}</strong><small className="achievement-option-description mt-1 block text-pretty">{texture.description}</small></button>)}</div>{draft.texture === "experimental" ? <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 sm:grid-cols-4 xl:grid-cols-6">{EXPERIMENTAL_FILTERS.map((filter) => <button key={filter.id} type="button" aria-pressed={draft.experimentalFilter === filter.id} onClick={() => onDraftChange({ experimentalFilter: filter.id as FilterId })} className={`achievement-filter-option journal-topic relative w-full px-2 py-1 ${draft.experimentalFilter === filter.id ? "journal-topic-selected" : ""}`}>{filter.label}</button>)}</div> : null}</div>
            ) : null}
          </section>
        </div>

        <aside className="lg:min-h-0">
          <figure><div className="grid min-h-72 place-items-center"><canvas ref={canvasRef} aria-label={`${draft.title || "人生凭证"}实时预览`} className="max-h-[520px] w-auto max-w-full shadow-[0_18px_45px_rgba(32,38,36,0.2)] lg:max-h-[calc(100dvh-250px)]" /></div><figcaption className="mt-2 flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.08em] text-[#686d68]"><span>这一程，确实发生过</span><span>LIFE PASSPORT</span></figcaption></figure>
          {previewError ? <p role="alert" className="mt-3 text-sm text-[#a02f28]">{previewError}</p> : null}
          <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center"><button type="button" onClick={onRestart} className="flex h-11 items-center justify-center gap-2 px-3 text-sm text-[#5f6560] hover:text-[#263b35]"><RotateCcw className="h-3.5 w-3.5" />重新填写</button><div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={!draft.title.trim() || exportState === "exporting" || Boolean(previewError)} onClick={onExport} className="achievement-handwriting journal-topic relative flex h-10 items-center justify-center gap-2 px-4 text-base text-[#526b45] hover:text-[#263b35] disabled:cursor-not-allowed disabled:opacity-45">{exportState === "exporting" ? "正在生成…" : "下载 PNG"}<Download className="h-4 w-4" /></button><button type="button" disabled={!draft.title.trim() || saveState === "saving" || Boolean(previewError)} onClick={onSave} className="journal-ink-button flex h-10 items-center justify-center gap-2 bg-[#263b35] px-5 text-base font-semibold text-[#f2f0e8] hover:bg-[#526b45] disabled:cursor-not-allowed disabled:bg-[#929792]">{saveState === "saving" ? "正在收入护照…" : isEditing ? "更新这枚印章" : "保存到我的护照"}<BookMarked className="h-4 w-4" /></button></div></div>
          {saveState === "success" ? <p role="status" className="mt-2 text-right text-sm text-[#526b45]">这枚印章已收入护照。<Link href="/achievement/passport" className="ml-2 underline underline-offset-4">打开我的护照</Link></p> : null}
          {saveState === "error" ? <p role="alert" className="mt-2 text-right text-sm text-[#a02f28]">{saveError}</p> : null}
          {exportState === "success" ? <p role="status" className="mt-2 text-right text-sm text-[#526b45]">人生凭证已开始下载。</p> : null}
          {exportState === "error" ? <p role="alert" className="mt-2 text-right text-sm text-[#a02f28]">下载生成失败，请稍后重试或更换照片。</p> : null}
        </aside>
      </div>

      {inspirationOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#202624]/55 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeInspiration(); }}>
          <section ref={inspirationDialogRef} role="dialog" aria-modal="true" aria-labelledby="inspiration-title" className="achievement-paper relative flex max-h-[min(88dvh,760px)] w-full max-w-5xl flex-col overflow-hidden px-4 pb-4 pt-5 shadow-[0_24px_80px_rgba(20,24,22,.35)] sm:px-7 sm:pb-6 sm:pt-7">
            <span aria-hidden="true" className="journal-tape absolute -top-1 left-1/2 -translate-x-1/2" />
            <div className="flex items-start justify-between gap-5"><div><h2 id="inspiration-title" className="achievement-title text-2xl text-[#263b35] sm:text-3xl">找一个接近此刻的说法</h2><p className="mt-1 text-sm text-[#686d68]">它只是一个起点，确认后仍然可以修改。</p></div><button ref={inspirationCloseRef} type="button" onClick={closeInspiration} aria-label="关闭灵感选择" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#526b45] hover:bg-[#526b45]/10"><X className="h-5 w-5" /></button></div>
            <div className="achievement-hide-scrollbar mt-4 min-h-0 overflow-y-auto overscroll-contain pr-1">
              <div className="grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-8 sm:gap-y-2">{ACHIEVEMENT_CATEGORIES.map((item, index) => <button key={item} type="button" onClick={() => { onCategoryChange(item); setSelectedInspirationId(undefined); }} aria-pressed={category === item} className={`achievement-option-control journal-topic arrival-topic relative flex min-h-11 items-center gap-2 px-1.5 py-1 text-left sm:min-h-12 sm:gap-3 ${category === item ? "arrival-topic-selected" : ""}`}><span className="relative z-[1] font-mono text-[11px] text-[#526b45] sm:text-[13px]">{String(index + 1).padStart(2, "0")}</span><span className={`achievement-option-title truncate ${category === item ? "arrival-topic-label-selected" : ""}`}>{item}</span></button>)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:gap-4 lg:grid-cols-4">{visibleAchievements.map((achievement: LifeAchievement) => { const selected = selectedInspirationId === achievement.id; return <div key={achievement.id} className="journal-slip-wrap achievement-choice relative"><span aria-hidden="true" className={`journal-mini-tape absolute -top-0.5 right-4 z-10 ${selected ? "journal-mini-tape-selected" : ""}`} /><button type="button" aria-pressed={selected} onClick={() => setSelectedInspirationId(achievement.id)} className="achievement-option-control journal-paper-slip relative grid min-h-[72px] w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 px-3 py-3 text-left transition-transform hover:-translate-y-0.5 sm:min-h-24 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-3 sm:px-4"><span className="grid h-8 w-8 place-items-center text-lg sm:h-10 sm:w-10 sm:text-xl">{achievement.icon}</span><span className="relative z-[1] min-w-0"><strong className="achievement-option-title block truncate sm:text-lg">{achievement.title}</strong><small className="achievement-option-description mt-0.5 block truncate">{achievement.motto}</small></span></button></div>; })}</div>
            </div>
            <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-[#b7b9b2] pt-4 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={closeInspiration} className="h-11 px-3 text-sm text-[#5f6560] hover:text-[#263b35]">取消</button><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="min-w-0 truncate text-sm text-[#686d68]">{selectedInspiration ? `当前选择「${selectedInspiration.title}」` : "选择一个灵感后继续"}</span><button type="button" disabled={!selectedInspiration} onClick={useInspiration} className="journal-ink-button flex h-10 items-center justify-center px-5 text-base font-semibold text-[#f2f0e8] disabled:cursor-not-allowed disabled:opacity-50">用这个灵感</button></div></div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
