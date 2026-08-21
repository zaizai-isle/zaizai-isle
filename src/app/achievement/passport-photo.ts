export interface PreparedPassportPhoto {
  sourceBlob: Blob;
  thumbnailBlob: Blob;
  width: number;
  height: number;
  mimeType: "image/webp";
}

const preparedPhotoCache = new WeakMap<File, Promise<PreparedPassportPhoto>>();

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("图片压缩失败"));
    }, "image/webp", quality);
  });
}

function scaledSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawScaledImage(image: HTMLImageElement, maxDimension: number) {
  const size = scaledSize(image.naturalWidth, image.naturalHeight, maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法处理这张照片");
  context.drawImage(image, 0, 0, size.width, size.height);
  return canvas;
}

async function prepare(file: File): Promise<PreparedPassportPhoto> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const sourceCanvas = drawScaledImage(image, 1600);
    const thumbnailCanvas = drawScaledImage(image, 480);
    const [sourceBlob, thumbnailBlob] = await Promise.all([
      canvasToBlob(sourceCanvas, 0.82),
      canvasToBlob(thumbnailCanvas, 0.72),
    ]);
    return {
      sourceBlob,
      thumbnailBlob,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      mimeType: "image/webp",
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function preparePassportPhoto(file: File) {
  const cached = preparedPhotoCache.get(file);
  if (cached) return cached;
  const pending = prepare(file);
  preparedPhotoCache.set(file, pending);
  return pending;
}
