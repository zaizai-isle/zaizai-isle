"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LearningImage } from "./LearningImage";
import { learningImagePath, type LearningDetail, type LearningVisual } from "./learning-visuals";

function CroppedImage({ detail, visual, large = false }: { detail: LearningDetail; visual: LearningVisual; large?: boolean }) {
  const [x, y, width, height] = detail.crop;
  const cropRatio = (visual.width * width) / (visual.height * height);
  return <div className={large ? "learning-crop learning-crop-large" : "learning-crop"} style={{ aspectRatio: `${visual.width * width} / ${visual.height * height}`, maxWidth: large ? `calc(84vh * ${cropRatio})` : undefined }}>
    <LearningImage
      src={learningImagePath(visual.asset, large ? "large" : "medium")}
      alt={detail.alt}
      width={visual.width}
      height={visual.height}
      loading={large ? "eager" : "lazy"}
      style={{ position: "absolute", maxWidth: "none", width: `${100 / width}%`, height: "auto", left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }}
    />
  </div>;
}

export function LearningDetailImage({ detail, visual }: { detail: LearningDetail; visual: LearningVisual }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    <button type="button" className="learning-crop-button" onClick={() => setOpen(true)} aria-label={`放大查看：${detail.title}`}>
      <CroppedImage detail={detail} visual={visual} />
      <span className="learning-crop-action"><Maximize2 aria-hidden="true" size={14} /> 点击放大</span>
    </button>
    {open ? <div className="learning-lightbox" role="dialog" aria-modal="true" aria-label={`放大查看：${detail.title}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <button type="button" className="learning-lightbox-close" onClick={() => setOpen(false)} aria-label="关闭大图"><X aria-hidden="true" size={20} /></button>
      <div className="learning-lightbox-content">
        <CroppedImage detail={detail} visual={visual} large />
        <p>{detail.title} · 原作局部</p>
      </div>
    </div> : null}
  </>;
}
