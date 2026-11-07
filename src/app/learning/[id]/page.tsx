import { notFound } from "next/navigation";
import { learningEntries } from "../learning-content";
import { LearningArticle } from "../LearningArticle";
import { fetchPublishedPublicationByContentId, listPublishedContentIds } from "../learning-repository";
import { publicationRowToEntry } from "../learning-publication-entry";

// R8 深链统一：详情页以发布表的 content_id 为准（如 daily-learning:plan-07-…）。
// 旧的 5 个硬编码静态选题 id 继续生成页面并原样解析，旧链接不 404。
// 静态导出已知限制：两次构建之间新发布的 content_id 深链会 404，
// 直到下一次构建把它生成出来（本站每日有部署重建，窗口 ≤ 1 天）。
export async function generateStaticParams() {
  const staticParams = learningEntries.map(({ id }) => ({ id }));
  try {
    // 构建时从 Supabase 拉全量已发布 content_id（anon key 可读该表）。
    const contentIds = await listPublishedContentIds();
    const seen = new Set(staticParams.map((param) => param.id));
    return [...staticParams, ...contentIds.filter((id) => !seen.has(id)).map((id) => ({ id }))];
  } catch (error) {
    console.warn("[learning] generateStaticParams 未能从 Supabase 拉取已发布 content_id，回退到硬编码静态选题列表。", error);
    return staticParams;
  }
}
export const dynamicParams = false;

export default async function LearningEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 兼容映射：先按旧的静态选题 id 解析，再按发布表 content_id 解析。
  const staticEntry = learningEntries.find((item) => item.id === id);
  if (staticEntry) return <LearningArticle entry={staticEntry} />;

  let entry;
  try {
    const row = await fetchPublishedPublicationByContentId(id);
    if (!row) notFound();
    entry = publicationRowToEntry(row);
  } catch (error) {
    console.warn(`[learning] 详情页按 content_id "${id}" 读取发布内容失败，本页输出 404。`, error);
    notFound();
  }
  return <LearningArticle entry={entry} />;
}
