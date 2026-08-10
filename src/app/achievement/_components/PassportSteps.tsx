import type { ChangeEvent, CSSProperties, RefObject } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera, Download, ImagePlus, MapPin, RotateCcw, X } from "lucide-react";
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
  { id: "arrival", number: "01", label: "选择抵达", eyebrow: "LIFE PASSPORT / ARRIVAL", title: "你抵达了哪里？", description: "从一段熟悉的人生经历开始，或者写下只有你知道的抵达。" },
  { id: "memory", number: "02", label: "留下记录", eyebrow: "LIFE PASSPORT / MEMORY", title: "为这一刻留下记录", description: "照片与地点都可以留空，只留下你真正想记住的话。" },
  { id: "style", number: "03", label: "装帧并保存", eyebrow: "LIFE PASSPORT / STAMP", title: "装帧并保存这一程", description: "行至此处，为这一程留下最后的印记。" },
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
                  <span className={`font-mono text-[8px] font-bold tracking-[0.12em] sm:text-[9px] ${index <= activeIndex ? "text-[#526b45]" : "text-[#8a8f8a]"}`}>{item.number}</span>
                  <span className={`whitespace-nowrap text-[9px] font-semibold sm:text-[11px] ${index === activeIndex ? "text-[#202624]" : index < activeIndex ? "text-[#686d68]" : "text-[#8a8f8a]"}`}>{item.label}</span>
                </span>
                {index < STEP_ITEMS.length - 1 ? <span aria-hidden="true" className="absolute -right-[5px] -top-0.5 h-1 w-1 rounded-full bg-[#a7aaa2] sm:-right-[9px]" /> : null}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-2 grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] sm:items-end sm:gap-8">
          <div>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#526b45]">{currentStep.eyebrow}</span>
            <h1 className="achievement-handwriting mt-0.5 text-balance text-2xl leading-tight tracking-wide text-[#202624] sm:text-[1.85rem]">{currentStep.title}</h1>
          </div>
          <p className="hidden text-pretty text-xs leading-5 text-[#686d68] sm:block sm:pb-0.5">{currentStep.description}</p>
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
      description: achievement.description,
    });
  };

  return (
    <StepContent>
      <div className="arrival-journal min-h-0 flex-1">
        <section>
          <span className="achievement-handwriting text-xs tracking-[0.14em] text-[#526b45] sm:text-sm">01 / 自定义</span>
          <label className="block">
            <span className="mb-1.5 mt-1 flex items-center justify-between gap-4">
              <span className="achievement-handwriting text-sm text-[#263b35] sm:text-base">用自己的话写下这一刻</span>
              <span className="achievement-handwriting text-xs text-[#7d827d]">{draft.title.length} / 24</span>
            </span>
            <span className="journal-writing relative block">
              <span aria-hidden="true" className="journal-tape absolute right-12 -top-1 hidden sm:block" />
              <textarea
                name="arrival-title"
                autoComplete="off"
                rows={2}
                value={draft.title}
                onChange={(event) => onDraftChange({ achievementId: undefined, title: event.target.value.slice(0, 24) })}
                placeholder="例如：第一次一个人生活……"
                className="achievement-handwriting h-[82px] w-full resize-none bg-transparent px-5 py-3 text-xl leading-8 text-[#202624] outline-none placeholder:text-[#8a8f8a] sm:h-[104px] sm:px-7 sm:py-4 sm:text-2xl sm:leading-10"
              />
            </span>
          </label>
        </section>

        <section className="mt-4 min-w-0 sm:mt-5">
          <span className="achievement-handwriting text-xs tracking-[0.14em] text-[#526b45] sm:text-sm">02 / 选择主题</span>
          <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="achievement-handwriting text-sm text-[#263b35] sm:text-base">或者，从已有的抵达中选择</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 sm:mt-3 sm:grid-cols-3 sm:gap-x-12 sm:gap-y-2">
            {ACHIEVEMENT_CATEGORIES.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategoryChange(item)}
                aria-pressed={category === item}
                className={`journal-topic arrival-topic achievement-handwriting relative flex min-h-9 items-center gap-2 px-1.5 py-1 text-left text-sm sm:min-h-12 sm:gap-3 sm:text-[17px] ${category === item ? "arrival-topic-selected text-[#202624]" : "text-[#4f5651] hover:text-[#263b35]"}`}
              >
                <span className="relative z-[1] font-mono text-[10px] text-[#526b45] sm:text-xs">{String(index + 1).padStart(2, "0")}</span>
                <span className={`relative z-[1] truncate ${category === item ? "arrival-topic-label-selected" : ""}`}>{item}</span>
                <span aria-hidden="true" className={`relative z-[1] text-xs ${category === item ? "text-[#d1bd00]" : "text-[#90958f]"}`}>{category === item ? "◎" : "·"}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:gap-4 lg:grid-cols-4">
            {visibleAchievements.map((achievement) => {
              const selected = draft.achievementId === achievement.id;
              return (
                <div key={achievement.id} className="journal-slip-wrap achievement-choice relative">
                  <span aria-hidden="true" className={`journal-mini-tape absolute -top-0.5 left-4 z-10 ${selected ? "journal-mini-tape-selected" : ""}`} />
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectAchievement(achievement)}
                    className="journal-paper-slip relative grid min-h-[72px] w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 px-3 py-3 text-left transition-transform hover:-translate-y-0.5 sm:min-h-24 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-3 sm:px-4"
                  >
                    <span className="grid h-8 w-8 place-items-center text-lg sm:h-10 sm:w-10 sm:text-xl">{achievement.icon}</span>
                    <span className="relative z-[1] min-w-0">
                      <strong className="achievement-handwriting block truncate text-sm font-medium text-[#202624] sm:text-base">{achievement.title}</strong>
                      <small className="achievement-handwriting mt-0.5 block truncate text-[11px] text-[#686d68] sm:text-xs">{achievement.motto}</small>
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
      <div className="grid min-h-0 flex-1 content-start gap-5 pt-7 sm:pt-10 lg:basis-0 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-8">
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="achievement-handwriting mb-1 block text-sm text-[#263b35]">01 / 抵达日期</span>
            <span className="journal-input-line block">
              <input name="arrival-date" autoComplete="off" type="date" value={draft.date} onChange={(event) => onDraftChange({ date: event.target.value })} className="h-11 w-full border-0 bg-transparent px-2 text-sm text-[#202624] outline-none" />
            </span>
          </label>
          <label className="block">
            <span className="achievement-handwriting mb-1 flex items-center gap-1.5 text-sm text-[#263b35]"><MapPin className="h-3.5 w-3.5" />02 / 地点（可选）</span>
            <span className="journal-input-line block">
              <input name="arrival-location" autoComplete="off" value={draft.location} onChange={(event) => onDraftChange({ location: event.target.value.slice(0, 28) })} placeholder="城市、房间，或特别的地方…" className="h-11 w-full border-0 bg-transparent px-2 text-sm text-[#202624] outline-none placeholder:text-[#8a8f8a]" />
            </span>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 flex items-center justify-between text-sm text-[#263b35]"><span className="achievement-handwriting">03 / 想留给这一刻的一句话</span><span className="achievement-handwriting text-xs text-[#7d827d]">{draft.note.length} / 72</span></span>
            <span className="journal-writing relative block">
              <textarea name="arrival-note" autoComplete="off" value={draft.note} onChange={(event) => onDraftChange({ note: event.target.value.slice(0, 72) })} rows={3} placeholder="例如：原来我已经走了这么远…" className="achievement-handwriting h-24 w-full resize-none bg-transparent px-3 py-2 text-base leading-8 text-[#202624] outline-none placeholder:text-[#8a8f8a]" />
            </span>
          </label>
        </div>

        <div className="min-w-0">
          <span className="achievement-handwriting mb-1.5 flex items-center justify-between gap-3 text-sm text-[#263b35]">
            <span className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />04 / 照片（可选）</span>
            {photoUrl ? <small className="font-mono text-[9px] font-normal text-[#686d68]">完整显示 · 原比例</small> : null}
          </span>
          {photoUrl ? (
            <div
              className="journal-slip-wrap journal-photo-frame relative mx-auto"
              style={{ "--photo-aspect": photoAspect } as CSSProperties}
            >
              <span aria-hidden="true" className="journal-tape absolute -top-1 left-1/2 z-10 -translate-x-1/2" />
              <AdaptivePaper className="journal-paper-photo flex w-full justify-center" contentClassName="relative w-full">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: photoAspect }}>
                  <Image src={photoUrl} alt="所选人生时刻完整预览" fill unoptimized sizes="(min-width: 1024px) 42rem, calc(100vw - 3rem)" className="object-contain" />
                  <button type="button" onClick={onRemovePhoto} aria-label="移除照片" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-[#f2f0e8] text-[#263b35] shadow-md hover:bg-white"><X className="h-4 w-4" /></button>
                </div>
              </AdaptivePaper>
            </div>
          ) : (
            <div className="journal-slip-wrap relative">
              <span aria-hidden="true" className="journal-tape absolute -top-1 left-1/2 z-10 -translate-x-1/2" />
              <label className="journal-paper-slip relative grid min-h-56 cursor-pointer place-items-center bg-[#f2f0e8]/65 p-5 text-center transition-transform hover:-translate-y-0.5">
                <span>
                  <ImagePlus className="mx-auto h-8 w-8 stroke-[1.5] text-[#526b45]" />
                  <strong className="mt-3 block text-sm text-[#263b35]">放入一张照片</strong>
                  <small className="mt-1.5 block text-[11px] leading-4 text-[#686d68]">JPG、PNG 或 WEBP<br />仅在当前浏览器处理</small>
                  <span aria-hidden="true" className="achievement-handwriting mt-2 block text-[#d8ce25]">↗</span>
                </span>
                <input name="arrival-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
              </label>
            </div>
          )}
          {fileError ? <p className="mt-2 text-xs text-[#a02f28]">{fileError}</p> : null}
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
  const outputSize = "1080 × 1920";

  return (
    <StepContent>
      <div className="grid min-h-0 flex-1 items-stretch gap-5 lg:basis-0 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] lg:gap-7">
        <figure className="flex min-h-0 flex-col">
          <div className="grid min-h-64 flex-1 place-items-center">
            <canvas ref={canvasRef} aria-label={`${draft.title}印章样式实时预览`} className="max-h-[250px] w-auto max-w-full shadow-[0_18px_45px_rgba(32,38,36,0.2)] sm:max-h-[320px] lg:max-h-[calc(100dvh-285px)]" />
          </div>
          <figcaption className="mt-2 flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.08em] text-[#686d68]">
            <span>实时预览</span><span>{outputSize}</span>
          </figcaption>
        </figure>

        <div className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <h2 className="achievement-handwriting text-xl text-[#263b35]">01 / 印章样式</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {STAMP_STYLES.map((style) => {
              const selected = draft.style === style.id;
              return (
                <div key={style.id} className="journal-slip-wrap relative">
                  <span aria-hidden="true" className={`journal-mini-tape absolute -top-1 left-1/2 z-10 -translate-x-1/2 ${selected ? "journal-mini-tape-selected" : ""}`} />
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onDraftChange({ style: style.id as StampStyleId })}
                    className="journal-paper-slip relative grid min-h-20 w-full grid-cols-[42px_1fr] items-center gap-2 p-2 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <span aria-hidden="true" className={`stamp-style-mark stamp-style-mark-${style.id}`}><span>{style.mark}</span></span>
                    <span className="relative z-[1] min-w-0"><strong className="block text-xs text-[#263b35]">{style.label}</strong><small className="mt-0.5 block text-pretty text-[10px] leading-4 text-[#686d68]">{style.description}</small></span>
                  </button>
                </div>
              );
            })}
          </div>

          {hasPhoto ? (
            <div className="mt-4 pt-1">
              <h2 className="achievement-handwriting text-xl text-[#263b35]">02 / 照片质感</h2>
              <div className="mt-1.5 grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-3">
                {PHOTO_TEXTURES.map((texture) => (
                  <button
                    key={texture.id}
                    type="button"
                    aria-pressed={draft.texture === texture.id}
                    onClick={() => onDraftChange({ texture: texture.id as PhotoTextureId })}
                    className={`journal-topic relative min-h-12 px-2 py-1.5 text-left ${draft.texture === texture.id ? "journal-topic-selected text-[#202624]" : "text-[#263b35] hover:text-[#526b45]"}`}
                  >
                    <strong className="relative z-[1] block text-xs">{texture.label}</strong>
                    <small className="relative z-[1] mt-0.5 block text-pretty text-[10px] leading-4 text-[#686d68]">{texture.description}</small>
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
                      className={`journal-topic relative min-h-8 w-full px-1.5 py-1 text-[11px] ${draft.experimentalFilter === filter.id ? "journal-topic-selected text-[#202624]" : "text-[#5f6560] hover:text-[#263b35]"}`}
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
        nextLabel="导出纪念卡"
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
    <div className="sticky bottom-0 z-20 mt-auto flex shrink-0 flex-col-reverse gap-2 bg-[linear-gradient(to_bottom,transparent,rgba(238,235,224,.9)_30%)] pt-5 pb-[calc(.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
      {onBack ? <button type="button" onClick={onBack} className="flex h-10 items-center justify-center gap-2 px-3 text-xs text-[#5f6560] hover:text-[#263b35]"><ArrowLeft className="h-4 w-4" />返回上一步</button> : <span />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {onSecondary && secondaryLabel ? <button type="button" onClick={onSecondary} className="flex h-10 items-center justify-center gap-2 px-3 text-xs text-[#5f6560] hover:text-[#263b35]">{secondaryIcon}{secondaryLabel}</button> : null}
        <button type="button" disabled={nextDisabled} onClick={onNext} className="journal-ink-button flex h-10 items-center justify-center gap-2 bg-[#263b35] px-5 text-sm font-semibold text-[#f2f0e8] hover:bg-[#526b45] disabled:cursor-not-allowed disabled:bg-[#929792]">{nextLabel}{nextIcon ?? <ArrowRight className="h-4 w-4 text-[#e2d849]" />}</button>
      </div>
    </div>
  );
}
