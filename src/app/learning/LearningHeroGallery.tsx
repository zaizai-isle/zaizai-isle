"use client";

import { useState } from "react";
import type { LearningArticleAsset } from "./learning-content";
import { LearningImage } from "./LearningImage";

type LearningHeroGalleryProps = {
  assets: LearningArticleAsset[];
  subject: string;
};

export function LearningHeroGallery({ assets, subject }: LearningHeroGalleryProps) {
  const [selectedId, setSelectedId] = useState(assets[0]?.id ?? "");
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0];
  if (!selected) return null;

  return <div className="learning-hero-gallery">
    <figure className="learning-hero">
      <a href={selected.sourceUrl} target="_blank" rel="noreferrer" aria-label={`打开${selected.alt || subject}原图（新窗口）`}>
        <LearningImage
          key={selected.id}
          src={selected.imageUrl}
          width={selected.width}
          height={selected.height}
          alt={selected.alt || subject}
          loading="eager"
          fetchPriority="high"
          className="learning-hero-image"
          sizes="(max-width: 900px) calc(100vw - 48px), 58vw"
        />
      </a>
      <figcaption><span>{selected.attribution}</span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">查看原图 ↗</a></figcaption>
    </figure>
    {assets.length > 1 ? <div className="learning-hero-thumbnails" aria-label="切换作品图片">
      {assets.map((asset, index) => <button
        className="learning-hero-thumbnail"
        type="button"
        key={asset.id}
        aria-pressed={asset.id === selected.id}
        aria-label={`显示${asset.role === "main" ? "主图" : `参考图 ${index}`}`}
        onClick={() => setSelectedId(asset.id)}
      >
        <LearningImage src={asset.imageUrl} width={asset.width} height={asset.height} alt="" loading="lazy" sizes="96px" />
        <span>{asset.role === "main" ? "主图" : `参考图 ${index}`}</span>
      </button>)}
    </div> : null}
  </div>;
}
