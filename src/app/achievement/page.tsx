"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { BookOpen, Compass } from "lucide-react";
import { AchievementCreator } from "./_components/PassportSteps";
import { ACHIEVEMENT_CATEGORIES } from "./achievements";
import { createInitialStampDraft, type StampDraft } from "./passport-model";
import { preparePassportPhoto } from "./passport-photo";
import { renderPassportCanvas } from "./passport-renderer";
import { ensureDefaultPassport, getStamp, getStampPhoto, passportStorageErrorMessage, saveStamp } from "./passport-storage";

type ExportState = "idle" | "exporting" | "success" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

export default function AchievementPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [category, setCategory] = useState<string>(ACHIEVEMENT_CATEGORIES[0]);
  const [draft, setDraft] = useState<StampDraft>(createInitialStampDraft);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [savedStampId, setSavedStampId] = useState<string>();
  const updateDraft = useCallback((patch: Partial<StampDraft>) => {
    setExportState("idle");
    setSaveState("idle");
    setSaveError("");
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    const stampId = new URLSearchParams(window.location.search).get("stamp");
    if (!stampId) return;
    let active = true;

    const loadSavedStamp = async () => {
      try {
        const [stamp, photo] = await Promise.all([getStamp(stampId), getStampPhoto(stampId)]);
        if (!stamp) throw new Error("没有找到这枚印章，它可能已经被删除。");
        if (!active) return;
        setDraft({
          achievementId: stamp.achievementId,
          title: stamp.title,
          category: stamp.category,
          icon: stamp.icon,
          date: stamp.date,
          note: stamp.note,
          location: stamp.location,
          style: stamp.style,
          texture: stamp.texture,
          experimentalFilter: stamp.experimentalFilter,
        });
        setCategory(stamp.category);
        setSavedStampId(stamp.id);
        if (!photo) return;

        const file = new File([photo.sourceBlob], `${stamp.id}.webp`, { type: photo.mimeType });
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          if (!active) {
            URL.revokeObjectURL(url);
            return;
          }
          setSourceFile(file);
          setPhotoUrl(url);
          setSourceImage(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          if (active) setFileError("这枚印章的本地照片暂时无法读取，你仍然可以编辑文字内容。");
        };
        image.src = url;
      } catch (error) {
        if (!active) return;
        setSaveError(passportStorageErrorMessage(error));
        setSaveState("error");
      }
    };

    void loadSavedStamp();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = window.requestAnimationFrame(() => {
        if (!canvasRef.current) return;
        try {
          renderPassportCanvas(canvasRef.current, sourceImage, draft);
          setPreviewError("");
        } catch (error) {
          console.error("Life Passport preview rendering failed", error);
          setPreviewError("预览暂时无法生成，请尝试移除照片或更换照片质感。");
        }
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [draft, sourceImage]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const handlePhotoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setExportState("idle");
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
      setSourceFile(file);
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
    setExportState("idle");
    setSaveState("idle");
    setSaveError("");
    setSourceFile(null);
    setPhotoUrl("");
    setSourceImage(null);
    setFileError("");
    updateDraft({ texture: "original" });
  }, [updateDraft]);

  const saveToPassport = useCallback(async () => {
    if (!draft.title.trim()) return;
    setSaveState("saving");
    setSaveError("");
    try {
      const [, photo] = await Promise.all([
        ensureDefaultPassport(),
        sourceFile ? preparePassportPhoto(sourceFile) : Promise.resolve(null),
      ]);
      const stamp = await saveStamp({ id: savedStampId, draft, photo });
      setSavedStampId(stamp.id);
      setSaveState("success");
    } catch (error) {
      console.error("Life Passport local save failed", error);
      setSaveError(passportStorageErrorMessage(error));
      setSaveState("error");
    }
  }, [draft, savedStampId, sourceFile]);

  const exportImage = useCallback(async () => {
    setExportState("exporting");
    try {
      await document.fonts.ready;
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas is unavailable");
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas export returned an empty image"));
        }, "image/png");
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `life-passport-portrait-${draft.date}-${draft.achievementId ?? "arrival"}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setExportState("success");
    } catch (error) {
      console.error("Life Passport export failed", error);
      setExportState("error");
    }
  }, [draft.achievementId, draft.date]);

  const restart = useCallback(() => {
    setDraft(createInitialStampDraft());
    setCategory(ACHIEVEMENT_CATEGORIES[0]);
    setSavedStampId(undefined);
    setSaveState("idle");
    setSaveError("");
    removePhoto();
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [removePhoto]);

  return (
    <main className="achievement-paper flex h-dvh min-h-0 flex-col overflow-hidden bg-[#d9ddda] text-[#202624]">
      <a href="#passport-creator" className="sr-only z-[100] bg-[#f2f0e8] px-4 py-2 text-[#202624] focus:not-sr-only focus:fixed focus:left-3 focus:top-3">跳到创建内容</a>
      <header className="shrink-0 border-b border-[#56615d] bg-[#202624] text-[#f2f0e8]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="achievement-title flex items-center gap-2.5 text-lg tracking-wide">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#7c847f] text-[#e2d849]"><Compass className="h-4 w-4" /></span>
            人生成就
          </Link>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-[#b9bfba] sm:gap-5 sm:tracking-[0.18em]">
            <Link href="/achievement/passport" className="flex min-h-10 items-center gap-1.5 text-[#e3e5df] hover:text-white"><BookOpen className="h-3.5 w-3.5" />我的护照</Link>
            <span className="hidden sm:inline">PASSPORT v0.2.2</span>
          </div>
        </div>
      </header>

      <div id="passport-creator" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden">
        <AchievementCreator
          canvasRef={canvasRef}
          draft={draft}
          category={category}
          photoUrl={photoUrl}
          fileError={fileError}
          previewError={previewError}
          exportState={exportState}
          saveState={saveState}
          saveError={saveError}
          isEditing={Boolean(savedStampId)}
          onCategoryChange={setCategory}
          onDraftChange={updateDraft}
          onPhotoChange={handlePhotoChange}
          onRemovePhoto={removePhoto}
          onSave={saveToPassport}
          onExport={exportImage}
          onRestart={restart}
        />
      </div>
    </main>
  );
}
