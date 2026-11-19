"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadResearchPoolState } from "./research-pool-data";

const DISMISS_KEY = "daily-learning-owner-alert-dismissed";
// 与 @/lib/island-owner-client 的 DAILY_LEARNING_SESSION_KEY 保持一致；
// 此处用字面量做零依赖的匿名快速判断，避免把 supabase-js 拉进初始包。
const OWNER_SESSION_KEY = "daily-learning-owner-session";

type OwnerAlert = { pendingCount: number; dryDays: number; poolIssue: string };

export function OwnerAlertModal() {
  const [alert, setAlert] = useState<OwnerAlert | null>(null);
  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    let live = true;
    const run = () => void (async () => {
      try {
        if (!sessionStorage.getItem(OWNER_SESSION_KEY)) return; // 匿名快速跳过，不加载 SDK
        const { verifyIslandOwner } = await import("./learning-repository");
        const { getIslandOwnerClient } = await import("@/lib/island-owner-client");
        const owner = await verifyIslandOwner();
        if (!live || !owner) return; // anon / 非岛主永不显示
        const [draftResult, pool] = await Promise.all([
          getIslandOwnerClient()
            .from("daily_learning_article_drafts")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending_review"),
          loadResearchPoolState(),
        ]);
        if (!live) return;
        const pendingCount = draftResult.error ? 0 : draftResult.count ?? 0;
        if (!pendingCount && !pool.poolIssue) return;
        setAlert({ pendingCount, dryDays: pool.dryDays, poolIssue: pool.poolIssue });
      } catch { /* 检查失败不打扰访客 */ }
    })();
    if (window.requestIdleCallback) window.requestIdleCallback(() => { if (!sessionStorage.getItem(DISMISS_KEY)) run(); });
    else window.setTimeout(() => { if (!sessionStorage.getItem(DISMISS_KEY)) run(); }, 2000);
    return () => { live = false; };
  }, []);
  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setAlert(null);
  }
  if (!alert) return null;
  return (
    <div className="owner-alert-backdrop" role="dialog" aria-modal="true" aria-labelledby="owner-alert-title" onClick={dismiss}>
      <div className="owner-alert-card" onClick={event=>event.stopPropagation()}>
        <h2 id="owner-alert-title">岛主工作提醒</h2>
        {alert.pendingCount > 0 ? <p>有 <strong>{alert.pendingCount}</strong> 篇草稿等待审核。</p> : null}
        {alert.poolIssue ? <p>采集候选池{alert.poolIssue}{alert.dryDays > 0 ? `，距上次采集已 <strong>${alert.dryDays}</strong> 天` : ""}。</p> : null}
        <div className="owner-alert-actions">
          <Link href="/learning/review" className="owner-alert-primary" onClick={dismiss}>去审核</Link>
          <button type="button" className="owner-alert-ghost" onClick={dismiss}>知道了</button>
        </div>
      </div>
    </div>
  );
}
