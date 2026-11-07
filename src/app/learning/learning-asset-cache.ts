import manifest from "../../../data/learning/assets/manifest.json";

type CachedAsset = { path?: string; thumbnail_path?: string };
const cachedAssets = manifest as Record<string, CachedAsset>;

export function learningAssetUrl(assetId: string, fallback: string) {
  const path = cachedAssets[assetId]?.path;
  return path ? `/zaizai-isle/${path}` : fallback;
}

export function learningThumbnailUrl(assetId: string, fallback: string) {
  const asset = cachedAssets[assetId];
  const path = asset?.thumbnail_path ?? asset?.path;
  return path ? `/zaizai-isle/${path}` : fallback;
}
