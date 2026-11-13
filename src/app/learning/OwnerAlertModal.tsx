"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { learningResearchPoolUrl } from "./learning-research-pool";

const DISMISS_KEY = "daily-learning-owner-alert-dismissed";
// 与 @/lib/island-owner-client 的 DAILY_LEARNING_SESSION_KEY 保持一致；
// 此处用字面量做零依赖的匿名快速判断，避免把 supabase-js 拉进初始包。
const OWNER_SESSION_KEY = "daily-learning-owner-session";
const DRY_THRESHOLD_DAYS = 3;

type OwnerAlert = { pendingCount: number; dryDays: number; poolIssue: string };

function pontianakToday() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

async function fetchResearchPool(): Promise<{ dryDays: number; poolIssue: string }> {
  try {
    const url = learningResearchPoolUrl();
    if (!url) return { dryDays: 0, poolIssue: "未配置 Supabase 地址" };
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { dryDays: 0, poolIssue: "无法读取，采集任务可能未运行" };
    const data = await response.json() as { status?: unknown; research_date?: unknown };
    if (typeof data.status !== "string" || data.status !== "research_candidates_only") return { dryDays: 0, poolIssue: `状态异常（${String(data.status ?? "缺失")}）` };
    if (typeof data.research_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.research_date)) return { dryDays: 0, poolIssue: "缺少采集日期" };
    const dryDays = daysBetween(data.research_date, pontianakToday()) ?? 0;
    return dryDays >= DRY_THRESHOLD_DAYS ? { dryDays, poolIssue: "已干涸" } : { dryDays: 0, poolIssue: "" };
  } catch {
    return { dryDays: 0, poolIssue: "无法读取，采集任务可能未运行" };
  }
}

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
          fetchResearchPool(),
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
