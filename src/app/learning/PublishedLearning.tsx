"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LearningArticle, LearningArticleLoading, LearningPublicationUnavailable, LearningTodayEmpty } from "./LearningArticle";
import { learningEntries, type LearningEntry } from "./learning-content";

type PublishedState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "empty" }
  | { kind: "article"; entry: LearningEntry };

export function PublishedLearning() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("entry");
  const [state, setState] = useState<PublishedState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      // 数据层与完整正文映射保持动态导入：supabase-js 与素材清单不进入初始模块图。
      const { getOptionalSupabase, fetchTodayPublishedPublication, fetchPublishedPublicationById, pontianakToday } = await import("./learning-repository");
      try {
        const client = getOptionalSupabase();
        if (!client) {
          if (active) setState({ kind: "unavailable" });
          return;
        }

        // 旧深链兼容：/learning?entry=publication-<id> 或 ?entry=<静态选题 id>。
        if (requested) {
          if (requested.startsWith("publication-")) {
            const [{ publicationRowToEntry }, { loadLearningAssets }] = await Promise.all([import("./learning-publication-entry"), import("./learning-asset-cache")]);
            const [row, assets] = await Promise.all([fetchPublishedPublicationById(requested.slice("publication-".length)), loadLearningAssets()]);
            if (!active) return;
            setState(row ? { kind: "article", entry: publicationRowToEntry(row, assets) } : { kind: "unavailable" });
            return;
          }
          const selected = learningEntries.find((item) => item.id === requested);
          if (active) setState(selected ? { kind: "article", entry: selected } : { kind: "unavailable" });
          return;
        }

        // 当日全文只读 is_visible 行；往期归往期合集页，这里不再拉取。
        const today = pontianakToday();
        const todayRow = await fetchTodayPublishedPublication(today);
        if (!active) return;
        if (todayRow) {
          const [{ publicationRowToEntry }, { loadLearningAssets }] = await Promise.all([import("./learning-publication-entry"), import("./learning-asset-cache")]);
          setState({ kind: "article", entry: publicationRowToEntry(todayRow, await loadLearningAssets()) });
          return;
        }
        // 诚实空状态：今天没有已发布内容，不展示旧稿正文。
        setState({ kind: "empty" });
      } catch (error) {
        console.warn("[learning] 已发布内容读取失败，显示不可用状态（不回退旧稿）。", error);
        if (active) setState({ kind: "unavailable" });
      }
    })();
    return () => { active = false; };
  }, [requested]);

  if (state.kind === "loading") return <LearningArticleLoading />;
  if (state.kind === "unavailable") return <LearningPublicationUnavailable />;
  if (state.kind === "empty") return <LearningTodayEmpty />;
  return <LearningArticle entry={state.entry} />;
}
