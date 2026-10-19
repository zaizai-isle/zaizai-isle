import "./review.css";
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getIslandOwnerClient, isIslandOwnerCloudConfigured } from "@/lib/island-owner-client";
import { verifyIslandOwner } from "../learning-repository";

type Status = "pending_review" | "changes_requested" | "approved" | "rejected";
interface Draft {
  id: string;
  source_id: string;
  source_record: Record<string, unknown>;
  content: Record<string, unknown>;
  version: number;
  status: Status;
  image_permission_verified: boolean;
  historical_sources_verified: boolean;
  review_note: string;
  created_at: string;
}

const fields = [
  ["title", "标题"], ["subject", "作品"], ["summary", "开篇观察"],
  ["observation", "观察与发现"], ["context", "历史理解"],
  ["connection", "当代连接"], ["question", "开放问题"],
] as const;

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(asText).join("\n\n");
  return value && typeof value === "object" ? JSON.stringify(value, null, 2) : "";
}

export default function LearningReview() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [rights, setRights] = useState(false);
  const [sources, setSources] = useState(false);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => rows.find((item) => item.id === selectedId), [rows, selectedId]);

  async function refresh() {
    const { data, error } = await getIslandOwnerClient().from("daily_learning_article_drafts")
      .select("id,source_id,source_record,content,version,status,image_permission_verified,historical_sources_verified,review_note,created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const drafts = (data ?? []) as Draft[];
    setRows(drafts);
    setSelectedId((current) => drafts.some((item) => item.id === current) ? current : (drafts[0]?.id ?? ""));
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!isIslandOwnerCloudConfigured()) throw new Error("Supabase 尚未配置。");
        const owner = await verifyIslandOwner();
        if (!active) return;
        if (!owner) return;
        setAuthenticated(true);
        await refresh();
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "无法读取审核数据。");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setNote(selected?.review_note ?? "");
    setRights(selected?.image_permission_verified ?? false);
    setSources(selected?.historical_sources_verified ?? false);
  }, [selectedId, selected?.version]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const { error } = await getIslandOwnerClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!await verifyIslandOwner()) throw new Error("此账户没有岛主审核权限。");
      setAuthenticated(true);
      setPassword("");
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "登录失败。"); }
    finally { setBusy(false); }
  }

  async function review(status: Status) {
    if (!selected || selected.status === "approved") return;
    if (status === "approved" && (!rights || !sources)) {
      setMessage("批准前必须核实图片使用许可和关键历史资料。"); return;
    }
    if (status === "changes_requested" && !note.trim()) {
      setMessage("退回修改需要填写修改意见。"); return;
    }
    setBusy(true); setMessage("");
    try {
      const { error } = await getIslandOwnerClient().from("daily_learning_article_drafts")
        .update({
          status, review_note: note.trim(), image_permission_verified: rights,
          historical_sources_verified: sources,
          approved_content: status === "approved" ? selected.content : null,
        })
        .eq("id", selected.id).eq("version", selected.version);
      if (error) throw error;
      await refresh();
      setMessage(status === "approved" ? "已批准当前版本。尚未发布到网站。" :
        status === "changes_requested" ? "已退回修改。" : "已放弃选题。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "审核操作失败。"); }
    finally { setBusy(false); }
  }

  return <main className="learning-page">
    <div className="learning-shell">
      <header className="learning-header">
        <div className="learning-header-heading"><Link href="/learning" className="learning-back" aria-label="返回每日一看">←</Link>
          <div className="learning-brand"><h1>内容审核</h1><p>每日一看 · 岛主专用</p></div></div>
      </header>
      {loading ? <p className="learning-muted">正在验证岛主身份…</p> : !authenticated ? <section className="learning-reading">
        <h2>岛主登录</h2>
        <p>草稿和审核记录仅对岛主账户开放。</p>
        <form onSubmit={signIn} className="learning-login">
          <input className="learning-input" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" aria-label="邮箱" />
          <input className="learning-input" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" aria-label="密码" />
          <button className="learning-primary" disabled={busy} type="submit">登录</button>
        </form></section> : <div className="review-layout">
        <aside className="review-list" aria-label="待审核文章">
          <h2>草稿列表 <small>({rows.length})</small></h2>
          {rows.length === 0 ? <p>当前没有草稿。采集与 Agent 生产完成后，草稿将显示在这里。</p> : rows.map(draft => <button
            type="button" className="review-list-item" aria-pressed={selectedId === draft.id}
            key={draft.id} onClick={() => setSelectedId(draft.id)}>
            <strong>{asText(draft.content.title) || asText(draft.source_record.title) || draft.source_id}</strong>
            <span>{draft.source_id} · v{draft.version}</span>
            <span>{({pending_review:"待审核",changes_requested:"待修改",approved:"已批准",rejected:"已放弃"} as Record<Status,string>)[draft.status]}</span>
          </button>)}
        </aside>
        {selected ? <section className="review-article">
          <p className="learning-kicker">内容预览 · v{selected.version}</p>
          <h2>{asText(selected.content.title) || "未命名草稿"}</h2>
          {typeof selected.source_record.image_url === "string" ? <figure className="review-artwork">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.source_record.image_url} alt={asText(selected.source_record.title) || "候选作品"} />
            <figcaption><a href={asText(selected.source_record.source_url)} target="_blank" rel="noreferrer">查看馆藏原始记录 ↗</a> · 图片许可待核实</figcaption>
          </figure> : null}
          {fields.filter(([key]) => key !== "title").map(([key, label]) =>
            asText(selected.content[key]) ? <section className="review-section" key={key}><h3>{label}</h3><p className="whitespace-pre-wrap">{asText(selected.content[key])}</p></section> : null)}
          <details className="review-sources"><summary>证据与来源</summary>
            <p><a href={asText(selected.source_record.source_url)} target="_blank" rel="noreferrer">馆藏记录 ↗</a></p>
            <pre>{JSON.stringify(selected.content.sources ?? [], null, 2)}</pre>
          </details>
          <section className="review-controls">
            <h3>审核</h3>
            <label><input type="checkbox" checked={rights} disabled={selected.status==="approved"} onChange={e=>setRights(e.target.checked)} /> 已核实图片使用许可</label>
            <label><input type="checkbox" checked={sources} disabled={selected.status==="approved"} onChange={e=>setSources(e.target.checked)} /> 已核实关键历史资料</label>
            <label>审核意见<textarea className="learning-input" maxLength={2000} rows={4} value={note} disabled={selected.status==="approved"} onChange={e=>setNote(e.target.value)} placeholder="退回修改时填写具体意见" /></label>
            <div className="review-buttons">
              <button className="learning-primary" type="button" disabled={busy||selected.status==="approved"} onClick={()=>review("approved")}>批准当前版本</button>
              <button className="learning-primary" type="button" disabled={busy||selected.status==="approved"} onClick={()=>review("changes_requested")}>退回修改</button>
              <button className="learning-primary" type="button" disabled={busy||selected.status==="approved"} onClick={()=>review("rejected")}>放弃选题</button>
            </div>
            <p className="learning-muted">批准只保存已审核版本。正式发布为独立操作。</p>
          </section>
        </section> : null}
      </div>}
      {message && <p role="status" className="review-message">{message}</p>}
    </div>
  </main>;
}
