"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { BookOpen, Compass } from "lucide-react";
import {
  ArrivalStep,
  CompleteStep,
  MemoryStep,
  StepHeader,
  StyleStep,
  type PassportStep,
} from "./_components/PassportSteps";
import { ACHIEVEMENT_CATEGORIES } from "./achievements";
import { createInitialStampDraft, type StampDraft } from "./passport-model";
import { renderPassportCanvas } from "./passport-renderer";

export default function AchievementPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stylePreviewRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<PassportStep>("arrival");
  const [category, setCategory] = useState<string>(ACHIEVEMENT_CATEGORIES[0]);
  const [draft, setDraft] = useState<StampDraft>(createInitialStampDraft);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [fileError, setFileError] = useState("");

  const updateDraft = useCallback((patch: Partial<StampDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    if (step !== "style" && step !== "complete") return;
    const frame = window.requestAnimationFrame(() => {
      const target = step === "style" ? stylePreviewRef.current : canvasRef.current;
      if (target) renderPassportCanvas(target, sourceImage, draft);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [draft, sourceImage, step]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const handlePhotoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("请选择 JPG、PNG 或 WEBP 图片。");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError("图片请小于 15 MB。");
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setPhotoUrl(url);
      setSourceImage(image);
      setFileError("");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setFileError("当前浏览器无法读取这张图片，请换一张试试。");
    };
    image.src = url;
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoUrl("");
    setSourceImage(null);
    setFileError("");
    updateDraft({ texture: "original" });
  }, [updateDraft]);

  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `life-passport-portrait-${draft.date}-${draft.achievementId ?? "arrival"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [draft.achievementId, draft.date]);

  const restart = useCallback(() => {
    setDraft(createInitialStampDraft());
    setCategory(ACHIEVEMENT_CATEGORIES[0]);
    setStep("arrival");
    removePhoto();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [removePhoto]);

  return (
    <main className="achievement-paper flex h-dvh min-h-0 flex-col overflow-hidden bg-[#d9ddda] text-[#202624]">
      <a href="#passport-step-content" className="sr-only z-[100] bg-[#f2f0e8] px-4 py-2 text-[#202624] focus:not-sr-only focus:fixed focus:left-3 focus:top-3">跳到当前步骤</a>
      <header className="shrink-0 border-b border-[#56615d] bg-[#202624] text-[#f2f0e8]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-wide">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#7c847f] text-[#e2d849]"><Compass className="h-4 w-4" /></span>
            人生成就
          </Link>
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-[#b9bfba]">
            <BookOpen className="h-3.5 w-3.5" />
            PASSPORT v0.1.10
          </div>
        </div>
      </header>

      <StepHeader activeStep={step} />

      <div id="passport-step-content" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {step === "arrival" ? (
          <ArrivalStep
            draft={draft}
            category={category}
            onCategoryChange={setCategory}
            onDraftChange={updateDraft}
            onNext={() => setStep("memory")}
          />
        ) : null}

        {step === "memory" ? (
          <MemoryStep
            draft={draft}
            photoUrl={photoUrl}
            fileError={fileError}
            onDraftChange={updateDraft}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={removePhoto}
            onBack={() => setStep("arrival")}
            onNext={() => setStep("style")}
          />
        ) : null}

        {step === "style" ? (
          <StyleStep
            canvasRef={stylePreviewRef}
            draft={draft}
            hasPhoto={Boolean(sourceImage)}
            onDraftChange={updateDraft}
            onBack={() => setStep("memory")}
            onNext={() => setStep("complete")}
          />
        ) : null}

        {step === "complete" ? (
          <CompleteStep
            canvasRef={canvasRef}
            draft={draft}
            onBack={() => setStep("style")}
            onExport={exportImage}
            onRestart={restart}
          />
        ) : null}
      </div>
    </main>
  );
}
