// 构建期（Node/SSG）素材清单读取：直接读 public/learning/manifest.json，不走网络。
// 仅服务器路由段可导入；浏览器端用 learning-asset-cache.ts 的 loadLearningAssets()。
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LearningAssetMap } from "./learning-asset-cache";

export async function readLearningAssetsFromDisk(): Promise<LearningAssetMap | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "public", "learning", "manifest.json"), "utf8");
    return JSON.parse(raw) as LearningAssetMap;
  } catch (error) {
    console.warn("[learning] 构建期读取素材清单失败，详情页回退远端图片 URL。", error);
    return null;
  }
}
