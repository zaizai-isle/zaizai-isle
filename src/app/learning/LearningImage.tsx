"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function LearningImage({ sourceSet, sourceSizes, ...props }: ImageProps & { sourceSet?: string; sourceSizes?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="learning-image-error" role="img" aria-label={props.alt} style={{ aspectRatio: `${props.width} / ${props.height}` }}>图片暂时无法加载，可通过图片来源查看原作。</div>;
  const image = <Image {...props} alt={props.alt} onError={() => setFailed(true)} />;
  return sourceSet ? <picture><source srcSet={sourceSet} sizes={sourceSizes} />{image}</picture> : image;
}
