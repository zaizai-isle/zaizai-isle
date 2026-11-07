"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { LearningEntry } from "./learning-content";
import { LearningHeader } from "./LearningArticle";
import { learningEntryHref } from "./learning-publication-entry";

type ArchiveState =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "ready"; entries: LearningEntry[] };

// 往期合集独立页：全部可见发布按日期倒序；supabase 与素材清单保持动态导入，不进初始模块图。
export function LearningArchive() {
  const [state, setState] = useState<ArchiveState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      const { getOptionalSupabase, listAllPublicationSummaries } = await import("./learning-repository");
      const { withThumbs } = await import("./learning-publication-entry");
      try {
        const client = getOptionalSupabase();
        if (!client) throw new Error("Supabase 未配置。");
        const rows = await listAllPublicationSummaries();
        const entries = await withThumbs(rows);
        if (active) setState({ kind: "ready", entries });
      } catch (error) {
        console.warn("[learning] 往期合集读取失败。", error);
        if (active) setState({ kind: "failed" });
      }
    })();
    return () => { active = false; };
  }, []);

  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader archive />
      <section className="learning-archive" aria-labelledby="learning-archive-title">
        <div className="learning-section-heading">
          <h2 id="learning-archive-title">往期合集</h2>
          <p>{state.kind === "ready" ? `共 ${state.entries.length} 篇，按发布日期倒序。` : "按发布日期倒序排列。"}</p>
        </div>
        {state.kind === "loading" ? (
          <ul className="learning-history-grid learning-archive-skeleton" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <li key={index}><span className="learning-archive-skeleton-image" /><span className="learning-archive-skeleton-bar" /><span className="learning-archive-skeleton-bar learning-archive-skeleton-bar-short" /></li>)}
          </ul>
        ) : null}
        {state.kind === "failed" ? (
          <p className="learning-muted">往期合集暂时读不出来，稍后刷新再试试。</p>
        ) : null}
        {state.kind === "ready" ? (state.entries.length ? (
          <ul className="learning-history-grid">
            {state.entries.map((item) => (
              <li key={item.id}>
                <Link prefetch={false} href={learningEntryHref(item)} className="learning-history-link">
                  {item.imageUrl
                    ? <Image src={item.imageUrl} width={480} height={360} alt={item.subject} loading="lazy" />
                    : <span className="learning-archive-no-image" aria-hidden="true" />}
                  <span className="learning-kicker">{item.publishDate.replaceAll("-", ".")}</span>
                  <h3>{item.subject}</h3>
                  <p>{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="learning-muted">还没有已发布的内容。</p>
        )) : null}
      </section>
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}
