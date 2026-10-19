"use client";

import { useEffect, useState } from "react";
import { Cloud, LogOut, Save } from "lucide-react";
import { getIslandOwnerClient, isIslandOwnerCloudConfigured } from "@/lib/island-owner-client";
import { type LearningEntry, type LearningReaction } from "./learning-content";
import { LEARNING_DRAFT_PREFIX, listLearningResponses, listLocalLearningResponses, saveLearningResponse, saveLocalLearningResponse, verifyIslandOwner, type LearningResponse } from "./learning-repository";

const reactions: Array<{ value: LearningReaction; label: string }> = [
  { value: "interesting", label: "有意思" },
  { value: "neutral", label: "没感觉" },
  { value: "unclear", label: "没看懂" },
];

type ViewState = "checking" | "guest" | "ready";

export function LearningExperience({ initialEntry }: { initialEntry: LearningEntry }) {
  const [state, setState] = useState<ViewState>(isIslandOwnerCloudConfigured() ? "checking" : "guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responses, setResponses] = useState<LearningResponse[]>([]);
  const [reaction, setReaction] = useState<LearningReaction | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const entry = initialEntry;
  const savedResponse = responses.find((item) => item.entryId === entry.id);

  useEffect(() => {
    if (!isIslandOwnerCloudConfigured()) {
      const timer = window.setTimeout(() => setResponses(listLocalLearningResponses()), 0);
      return () => window.clearTimeout(timer);
    }
    let active = true;
    void (async () => {
      try {
        const client = getIslandOwnerClient();
        const { data } = await client.auth.getSession();
        if (!active) return;
        if (!data.session) { setResponses(listLocalLearningResponses()); return setState("guest"); }
        const owner = await verifyIslandOwner();
        if (!active) return;
        if (!owner) { await client.auth.signOut({ scope: "local" }); setResponses(listLocalLearningResponses()); setMessage("这个账户不在岛主白名单中，已继续使用本地模式。"); return setState("guest"); }
        const rows = await listLearningResponses();
        if (active) { setResponses(rows); setState("ready"); }
      } catch (error) {
        if (active) { setResponses(listLocalLearningResponses()); setMessage(error instanceof Error ? error.message : "云端暂时不可用，已继续使用本地模式。"); setState("guest"); }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (state === "checking") return;
    const saved = responses.find((item) => item.entryId === entry.id);
    setReaction(saved?.reaction ?? null);
    try { setNote(localStorage.getItem(LEARNING_DRAFT_PREFIX + entry.id) ?? saved?.note ?? ""); }
    catch { setNote(saved?.note ?? ""); }
  }, [entry.id, responses, state]);

  function updateNote(value: string) {
    setNote(value);
    try { localStorage.setItem(LEARNING_DRAFT_PREFIX + entry.id, value); }
    catch { setMessage("浏览器暂时不能保存草稿，请保留当前页面并尝试保存回应。"); }
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const client = getIslandOwnerClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error("邮箱或密码不正确。");
      const owner = await verifyIslandOwner();
      if (!owner) { await client.auth.signOut({ scope: "local" }); setMessage("这个账户不在岛主白名单中。"); return; }
      setResponses(await listLearningResponses());
      setPassword(""); setState("ready");
    } catch (error) { setMessage(error instanceof Error ? error.message : "登录失败。"); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await getIslandOwnerClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      setResponses(listLocalLearningResponses()); setState("guest");
    } catch { setMessage("退出失败，请稍后重试。"); }
    finally { setBusy(false); }
  }

  async function save() {
    if (state === "checking") return;
    if (!reaction) return setMessage("先选一个最接近此刻感受的回应。");
    setBusy(true); setMessage("");
    try {
      if (state === "ready") {
        await saveLearningResponse(entry.id, reaction, note, savedResponse?.viewedSnapshot ?? { ...entry });
        setResponses(await listLearningResponses());
      } else {
        saveLocalLearningResponse({ entryId: entry.id, reaction, note: note.trim(), viewedSnapshot: savedResponse?.viewedSnapshot ?? { ...entry }, updatedAt: new Date().toISOString() });
        setResponses(listLocalLearningResponses());
      }
      try { localStorage.removeItem(LEARNING_DRAFT_PREFIX + entry.id); } catch { /* The saved response remains authoritative. */ }
      setMessage(state === "ready" ? "已保存到岛主云端。" : "已保存到当前浏览器。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败。"); }
    finally { setBusy(false); }
  }

  return <div className="learning-feedback">
    <fieldset disabled={busy || state === "checking"}>
      <legend>此刻最接近哪一种感受？</legend>
      <div className="learning-reactions">{reactions.map((item) => <button key={item.value} type="button" aria-pressed={reaction === item.value} onClick={() => setReaction(item.value)} className="learning-reaction">{item.label}</button>)}</div>
      <label className="learning-note-label">可以留下一句话，也可以空着<textarea className="learning-input" maxLength={1000} value={note} onChange={(event) => updateNote(event.target.value)} placeholder="哪里吸引了你，哪里还没看懂？" /></label>
      <button className="learning-primary" type="button" onClick={save}><Save className="h-4 w-4" />{busy ? "正在处理…" : "保存这次回应"}</button>
    </fieldset>
    <p className="learning-muted" role="status">{state === "checking" ? "正在确认岛主会话…" : state === "ready" ? "已连接岛主云端" : "本地模式 · 记录保存在当前浏览器"}</p>
    {message ? <p role="status">{message}</p> : null}
    <details className="learning-account"><summary>岛主账户与同步</summary>
      {state === "ready" ? <div className="learning-account-row"><span><Cloud className="inline h-4 w-4" /> 云端已连接</span><button className="learning-primary" type="button" disabled={busy} onClick={signOut}><LogOut className="h-4 w-4" />退出</button></div> : isIslandOwnerCloudConfigured() ? <form className="learning-login" onSubmit={signIn}>
        <p className="learning-muted">不登录也能使用。登录后读取云端记录，本地记录不会自动上传。</p>
        <input aria-label="岛主邮箱" className="learning-input" type="email" autoComplete="username" required placeholder="邮箱" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input aria-label="岛主密码" className="learning-input" type="password" autoComplete="current-password" required placeholder="密码" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="learning-primary" disabled={busy || state === "checking"} type="submit">{busy ? "正在登录…" : "登录并使用云端"}</button>
      </form> : <p>当前使用本地记录。</p>}
    </details>
    <details className="learning-saved"><summary>我的回应与当时的内容（{responses.length}）</summary>
      <p className="learning-muted">这里保留保存时的内容，之后的介绍修订不会改写这份快照。</p>
      {responses.length ? responses.map((response) => <div className="learning-saved-item" key={response.entryId}>
        <p>{typeof response.viewedSnapshot?.subject === "string" ? response.viewedSnapshot.subject : response.entryId} · {reactions.find((item) => item.value === response.reaction)?.label}</p>
        <p className="learning-muted">{response.updatedAt.slice(0, 10)}</p>
        {response.note ? <p className="whitespace-pre-wrap">{response.note}</p> : null}
        <details><summary>当时看到的文字</summary>{["title", "summary", "context", "influence", "question"].map((key) => typeof response.viewedSnapshot?.[key] === "string" ? <p key={key}>{response.viewedSnapshot[key] as string}</p> : null)}</details>
      </div>) : <p>还没有保存的回应。</p>}
    </details>
  </div>;
}
