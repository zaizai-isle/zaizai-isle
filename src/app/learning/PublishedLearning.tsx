"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LearningArticle, LearningArticleLoading, LearningPublicationUnavailable, LearningTodayEmpty } from "./LearningArticle";
import { learningEntries, type LearningEntry } from "./learning-content";
import type { PublicationSummaryRow } from "./learning-publication-entry";

type PublishedState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "empty"; recent: PublicationSummaryRow[] }
  | { kind: "article"; entry: LearningEntry; recent: PublicationSummaryRow[] };

// 精选/历史卡片只渲染标题与日期，纯字段映射，留在本文件避免把素材清单带进初始模块图。
function summaryToEntry(row: PublicationSummaryRow): LearningEntry {
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
    isPublishedRecord: true,
  };
}

export function PublishedLearning() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("entry");
  const [state, setState] = useState<PublishedState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      // 数据层与完整正文映射保持动态导入：supabase-js 与素材清单不进入初始模块图。
      const { getOptionalSupabase, fetchTodayPublishedPublication, fetchPublishedPublicationById, listRecentPublicationSummaries, pontianakToday } = await import("./learning-repository");
      try {
        const client = getOptionalSupabase();
        if (!client) {
          if (active) setState({ kind: "unavailable" });
          return;
        }

        // 旧深链兼容：/learning?entry=publication-<id> 或 ?entry=<静态选题 id>。
        if (requested) {
          if (requested.startsWith("publication-")) {
            const { publicationRowToEntry } = await import("./learning-publication-entry");
            const row = await fetchPublishedPublicationById(requested.slice("publication-".length));
            if (!active) return;
            setState(row ? { kind: "article", entry: publicationRowToEntry(row), recent: [] } : { kind: "unavailable" });
            return;
          }
          const selected = learningEntries.find((item) => item.id === requested);
          if (active) setState(selected ? { kind: "article", entry: selected, recent: [] } : { kind: "unavailable" });
          return;
        }

        // 当日全文与往期精选并行请求；两者都只读 is_visible 行。
        const today = pontianakToday();
        const [todayResult, recentResult] = await Promise.allSettled([
          fetchTodayPublishedPublication(today),
          listRecentPublicationSummaries(today, 5),
        ]);
        if (!active) return;
        if (todayResult.status === "rejected") {
          console.warn("[learning] 今日内容读取失败，显示不可用状态（不回退旧稿）。", todayResult.reason);
          setState({ kind: "unavailable" });
          return;
        }
        const recent = recentResult.status === "fulfilled" ? recentResult.value : [];
        if (recentResult.status === "rejected") console.warn("[learning] 往期精选读取失败，列表暂时为空。", recentResult.reason);
        if (todayResult.value) {
          const { publicationRowToEntry } = await import("./learning-publication-entry");
          if (active) setState({ kind: "article", entry: publicationRowToEntry(todayResult.value), recent });
          return;
        }
        // 诚实空状态：今天没有已发布内容，不展示旧稿正文。
        if (active) setState({ kind: "empty", recent });
      } catch (error) {
        console.warn("[learning] 已发布内容读取失败，显示不可用状态（不回退旧稿）。", error);
        if (active) setState({ kind: "unavailable" });
      }
    })();
    return () => { active = false; };
  }, [requested]);

  if (state.kind === "loading") return <LearningArticleLoading />;
  if (state.kind === "unavailable") return <LearningPublicationUnavailable />;
  if (state.kind === "empty") return <LearningTodayEmpty recent={state.recent.map(summaryToEntry)} />;

  const entries = [...state.recent.map(summaryToEntry), ...learningEntries];
  return <LearningArticle entry={state.entry} entries={entries} />;
}
