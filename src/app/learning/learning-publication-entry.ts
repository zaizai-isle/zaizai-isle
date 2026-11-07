// Pure mapping from `daily_learning_publications` rows to reader-facing LearningEntry.
// Shared by the client list (PublishedLearning) and the static detail route ([id]/page.tsx);
// keep it free of "use client" and browser APIs so both sides can import it.
import type { LearningArticleAsset, LearningEntry } from "./learning-content";
import { learningAssetUrl } from "./learning-asset-cache";
import { learningDetailCrop } from "./learning-detail-decisions";

export type PublicationRow = {
  id: string;
  content_id?: string | null;
  source_id: string;
  source_record: Record<string, unknown>;
  content: Record<string, unknown>;
  published_at: string;
  package_schema_version?: number | null;
  package_snapshot?: Record<string, unknown> | null;
  display_date?: string | null;
};

export type PublicationSummaryRow = {
  id: string;
  content_id?: string | null;
  display_date?: string | null;
  published_at: string;
  title?: string | null;
  subject?: string | null;
  assets?: Array<{ role?: string; asset_id?: string; image_url?: string }> | null;
};

const text = (value: unknown) => typeof value === "string" ? value : "";

function sourceLabel(source: string) {
  return ({ smk: "SMK 丹麦国家美术馆", artic: "Art Institute of Chicago", cleveland: "Cleveland Museum of Art", met: "The Metropolitan Museum of Art", loc: "Library of Congress" } as Record<string, string>)[source] || source || "馆藏机构";
}

export function publicationDisplayDate(row: { display_date?: string | null; published_at: string }) {
  return row.display_date ?? row.published_at.slice(0, 10);
}

export function publicationRowToEntry(row: PublicationRow): LearningEntry {
  const snapshot = row.package_schema_version === 2 && row.package_snapshot ? row.package_snapshot : null;
  const record = snapshot && snapshot.work && typeof snapshot.work === "object" ? snapshot.work as Record<string, unknown> : row.source_record;
  const content = snapshot && snapshot.article && typeof snapshot.article === "object" ? snapshot.article as Record<string, unknown> : row.content;
  const contentId = text(row.content_id) || (snapshot ? text(snapshot.content_id) : "");
  const assets = snapshot && Array.isArray(snapshot.assets) ? snapshot.assets as Record<string, unknown>[] : [];
  const mainAsset = assets.find(asset => asset.role === "main");
  const rights = record.rights && typeof record.rights === "object" ? record.rights as Record<string, unknown> : {};
  const observations = Array.isArray(content.observations) ? content.observations.flatMap((item, observationIndex) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const heading = text(value.heading);
    const body = text(value.body);
    const assetIds = Array.isArray(value.asset_ids) ? value.asset_ids.filter((assetId): assetId is string => typeof assetId === "string") : [];
    const rawCrop = value.crop && typeof value.crop === "object" ? value.crop as Record<string, unknown> : null;
    const crop = rawCrop ? { x: Number(rawCrop.x), y: Number(rawCrop.y), width: Number(rawCrop.width), height: Number(rawCrop.height) } : learningDetailCrop(contentId, observationIndex);
    return heading && body ? [{ heading, body, assetIds, crop }] : [];
  }) : [];
  const articleAssets: LearningArticleAsset[] = assets.flatMap((asset) => {
    const id = text(asset.asset_id);
    const imageUrl = text(asset.image_url);
    const sourceUrl = text(asset.source_page);
    const role = asset.role;
    if (!id || !imageUrl || !sourceUrl || !["main", "detail", "comparison"].includes(String(role))) return [];
    const rawCrop = asset.crop && typeof asset.crop === "object" ? asset.crop as Record<string, unknown> : null;
    const crop = rawCrop ? { x: Number(rawCrop.x), y: Number(rawCrop.y), width: Number(rawCrop.width), height: Number(rawCrop.height) } : undefined;
    return [{ id, role: role as LearningArticleAsset["role"], imageUrl: learningAssetUrl(id, imageUrl), sourceUrl, width: Number(asset.width) || 1024, height: Number(asset.height) || 1024, alt: text(asset.alt) || text(record.title), attribution: text(asset.attribution), rightsStatement: text(asset.rights_statement), licenseUrl: text(asset.license_url), crop }];
  });
  return {
    id: `publication-${row.id}`,
    contentId,
    publishDate: publicationDisplayDate(row),
    title: text(content.title) || text(record.title),
    subject: text(content.subject) || text(record.title),
    creator: text(content.creator) || text(record.creator) || "作者未详",
    era: text(content.era) || text(record.date),
    summary: text(content.introduction),
    context: text(content.history),
    influence: text(content.connection),
    question: text(content.question),
    sourceLabel: text(record.institution) || sourceLabel(text(record.source)),
    sourceUrl: text(record.source_url),
    imageUrl: mainAsset ? learningAssetUrl(text(mainAsset.asset_id), text(mainAsset.image_url)) : text(record.image_url) || undefined,
    imageWidth: Number(mainAsset?.width) || Number(record.image_width) || 1024,
    imageHeight: Number(mainAsset?.height) || Number(record.image_height) || 1024,
    imageAlt: text(mainAsset?.alt) || text(record.title) || text(content.subject) || "馆藏作品",
    imageCredit: text(mainAsset?.attribution) || `${text(record.institution) || sourceLabel(text(record.source))} · ${text(record.title)}`,
    imageLicense: text(mainAsset?.rights_statement) || text(record.rights_label) || (rights.catalog_public_domain ? "Public Domain" : text(rights.source_rights_note)),
    imageLicenseUrl: text(mainAsset?.license_url) || text(rights.rights_url),
    medium: text(record.medium),
    category: "艺术与设计",
    observations,
    assets: articleAssets,
    isPublishedRecord: true,
  };
}

/** 往期合集卡片只需要标题/日期/主图：摘要行 → 轻量 LearningEntry（纯字段映射）。 */
export function summaryToEntry(row: PublicationSummaryRow, imageUrl?: string): LearningEntry {
  const title = row.title || "未命名作品";
  return {
    id: `publication-${row.id}`,
    contentId: row.content_id || undefined,
    publishDate: row.display_date ?? row.published_at.slice(0, 10),
    title,
    subject: row.subject || title,
    era: "",
    summary: "",
    context: "",
    influence: "",
    question: "",
    creator: "",
    sourceLabel: "",
    sourceUrl: "",
    category: "艺术与设计",
    imageUrl,
    isPublishedRecord: true,
  };
}

/** 摘要行主图缩略：优先本地清单缩略，回退远端 image_url。素材清单动态导入，不进调用方初始模块图。 */
export async function withThumbs(rows: PublicationSummaryRow[]): Promise<LearningEntry[]> {
  if (!rows.length) return [];
  const { learningThumbnailUrl } = await import("./learning-asset-cache");
  return rows.map((row) => {
    const main = (row.assets ?? []).find((asset) => asset.role === "main");
    const assetId = typeof main?.asset_id === "string" ? main.asset_id : "";
    const remote = typeof main?.image_url === "string" ? main.image_url : "";
    return summaryToEntry(row, assetId || remote ? learningThumbnailUrl(assetId, remote) : undefined);
  });
}

/** 文章链接：生产静态导出用 content_id 深链（构建期已按发布表生成）；dev 走 ?entry= 客户端解析。 */
export function learningEntryHref(item: { id: string; contentId?: string; isPublishedRecord?: boolean }) {
  if (item.contentId && process.env.NODE_ENV === "production") return `/learning/${encodeURIComponent(item.contentId)}`;
  return item.isPublishedRecord ? `/learning?entry=${encodeURIComponent(item.id)}` : `/learning/${item.id}`;
}
