import { renderPassportCanvas } from "./passport-renderer";
import type { StampPhotoRecord, StampRecord } from "./passport-storage";

function imageFromBlob(blob: Blob) {
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取这枚印章的本地照片"));
    };
    image.src = url;
  });
}

function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("人生凭证生成失败"));
    }, "image/png");
  });
}

export async function exportSavedStamp(stamp: StampRecord, photo?: StampPhotoRecord) {
  await document.fonts.ready;
  const loadedPhoto = photo ? await imageFromBlob(photo.sourceBlob) : undefined;
  try {
    const canvas = document.createElement("canvas");
    renderPassportCanvas(canvas, loadedPhoto?.image ?? null, stamp);
    const blob = await canvasToPng(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `life-passport-portrait-${stamp.date}-${stamp.achievementId ?? stamp.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  } finally {
    if (loadedPhoto) URL.revokeObjectURL(loadedPhoto.url);
  }
}
