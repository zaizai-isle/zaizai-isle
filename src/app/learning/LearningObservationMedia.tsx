"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LearningImage } from "./LearningImage";
import type { LearningArticleAsset } from "./learning-content";

const roleLabels: Record<LearningArticleAsset["role"], string> = {
  main: "对应画面",
  detail: "原作局部",
  comparison: "对照作品",
};

function AssetImage({ asset, large = false }: { asset: LearningArticleAsset; large?: boolean }) {
  const crop = asset.crop;
  const cropRatio = crop ? (asset.width * crop.width) / (asset.height * crop.height) : asset.width / asset.height;
  return <div
    className={`${crop ? "learning-observation-crop" : "learning-observation-full-image"}${large ? " learning-crop-large" : ""}`}
    style={{ aspectRatio: String(cropRatio), maxWidth: large ? `calc(84vh * ${cropRatio})` : undefined }}
  >
    <LearningImage
      src={asset.imageUrl}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      loading={large ? "eager" : "lazy"}
      className={crop ? "learning-observation-cropped-image" : "learning-observation-image"}
      style={crop ? { width: `${100 / crop.width}%`, left: `${-crop.x / crop.width * 100}%`, top: `${-crop.y / crop.height * 100}%` } : undefined}
      sizes={large ? "94vw" : "(max-width: 760px) calc(100vw - 48px), 560px"}
    />
  </div>;
}

export function LearningObservationMedia({ assets }: { assets: LearningArticleAsset[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeAsset = activeId ? assets.find((asset) => asset.id === activeId) : undefined;

  useEffect(() => {
    if (!activeAsset) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeAsset]);

  if (!assets.length) return null;

  return <>
    <div className={`learning-observation-media${assets.length > 1 ? " learning-observation-media-grid" : ""}`}>
      {assets.map((asset) => <figure className="learning-observation-figure" key={asset.id}>
        <button type="button" className="learning-crop-button" onClick={() => setActiveId(asset.id)} aria-label={`放大查看：${asset.alt}`}>
          <AssetImage asset={asset} />
          <span className="learning-crop-action"><Maximize2 aria-hidden="true" size={14} /> 点击放大</span>
        </button>
        <figcaption><span>{roleLabels[asset.role]} · {asset.attribution}</span><a href={asset.sourceUrl} target="_blank" rel="noreferrer">查看来源 ↗</a></figcaption>
      </figure>)}
    </div>
    {activeAsset ? <div className="learning-lightbox" role="dialog" aria-modal="true" aria-label={`放大查看：${activeAsset.alt}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) setActiveId(null);
    }}>
      <button type="button" className="learning-lightbox-close" onClick={() => setActiveId(null)} aria-label="关闭大图"><X aria-hidden="true" size={20} /></button>
      <div className="learning-lightbox-content">
        <AssetImage asset={activeAsset} large />
        <p>{activeAsset.alt} · 原作局部</p>
      </div>
    </div> : null}
  </>;
}
