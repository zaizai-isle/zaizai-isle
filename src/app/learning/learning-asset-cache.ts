// 素材清单运行时加载：manifest.json 不再静态 import 进 JS 初始 chunk，
// 而是作为静态 JSON 由 Pages 发布（/zaizai-isle/learning/manifest.json，max-age=600），
// 客户端运行时 fetch 一次并内存缓存。资产入库只更新 JSON，访客端 JS 保持字节稳定。
// 分层规则不变：访客永远读 thumb/reading，原图只留本地归档 + 远端 URL。

export type CachedAsset = {
  path?: string;
  thumb_path?: string;
  thumbnail_path?: string; // 历史字段名，兼容旧条目
  reading_path?: string;
  original_url?: string;
};
export type LearningAssetMap = Record<string, CachedAsset>;

const MANIFEST_URL = "/zaizai-isle/learning/manifest.json";

let assets: LearningAssetMap | null = null;
let pending: Promise<LearningAssetMap | null> | null = null;

/** 拉取并缓存素材清单；失败返回 null（调用方回退远端图 URL），可安全并发/重复调用。 */
export function loadLearningAssets(): Promise<LearningAssetMap | null> {
  if (assets) return Promise.resolve(assets);
  pending ??= fetch(MANIFEST_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<LearningAssetMap>;
    })
    .then((map) => { assets = map; return map; })
    .catch((error) => {
      console.warn("[learning] 素材清单拉取失败，回退远端图片 URL。", error);
      pending = null;
      return null;
    });
  return pending;
}

const siteUrl = (path: string) => `/zaizai-isle/${path}`;

/** 访客正文图：阅读图 → 缩略图 → 远端回退。绝不回退本地原图。 */
export function learningAssetUrl(assets: LearningAssetMap | null, assetId: string, fallback: string) {
  const asset = assets?.[assetId];
  const path = asset?.reading_path ?? asset?.thumb_path ?? asset?.thumbnail_path;
  return path ? siteUrl(path) : fallback;
}

/** 卡片缩略：缩略图 → 阅读图 → 远端回退。绝不回退本地原图。 */
export function learningThumbnailUrl(assets: LearningAssetMap | null, assetId: string, fallback: string) {
  const asset = assets?.[assetId];
  const path = asset?.thumb_path ?? asset?.thumbnail_path ?? asset?.reading_path;
  return path ? siteUrl(path) : fallback;
}

/** 岛主审核入口：远端原图 URL；岛主补充图（仍在 public）回退本地 path。 */
export function learningOriginalUrl(assets: LearningAssetMap | null, assetId: string, fallback: string) {
  const asset = assets?.[assetId];
  if (asset?.original_url) return asset.original_url;
  const path = asset?.path;
  return path && path.startsWith("learning/assets/") ? siteUrl(path) : fallback;
}
