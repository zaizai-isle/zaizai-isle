"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getIslandOwnerClient } from "@/lib/island-owner-client";
import { verifyIslandOwner } from "../learning-repository";

type Draft = {
  id: string; source_id: string; version: number; status: string;
  source_record: Record<string, unknown>; content: Record<string, unknown>;
  review_note: string; image_permission_verified: boolean;
  historical_sources_verified: boolean; updated_at: string;
};
const statuses: Record<string,string> = {
  pending_review:"待审核", changes_requested:"退回修改",
  approved:"已批准（未发布）", rejected:"放弃"
};
const text = (v: unknown) => typeof v === "string" ? v : "";
async function functionErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as {context?: unknown}).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json() as {error?: unknown; status?: unknown; provider_status?: unknown};
        const detail = text(body.error);
        const status = body.provider_status ?? body.status;
        if (detail) return status ? `${detail}（上游状态 ${String(status)}）` : detail;
      } catch { /* Fall back to the client error below. */ }
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
type LearningReviewProps = {
  initialCandidates: Record<string, unknown>[];
  researchDate: string;
};
export function LearningReview({initialCandidates,researchDate}:LearningReviewProps) {
  const [auth,setAuth]=useState<"loading"|"denied"|"ready">("loading");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [rows,setRows]=useState<Draft[]>([]); const [selected,setSelected]=useState("");
  const [note,setNote]=useState(""); const [imageRights,setImageRights]=useState(false);
  const [sourcesOk,setSourcesOk]=useState(false); const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [publishedDrafts,setPublishedDrafts]=useState<Record<string,string>>({});
  const [publicationReady,setPublicationReady]=useState(true);
  const [candidateJson,setCandidateJson]=useState("");
  const [creating,setCreating]=useState(false);
  const [generatingSourceId,setGeneratingSourceId]=useState("");
  const current=rows.find(x=>x.id===selected);
  async function reload(){
    const client=getIslandOwnerClient();
    const [draftResult,publicationResult]=await Promise.all([
      client.from("daily_learning_article_drafts")
        .select("id,source_id,version,status,source_record,content,review_note,image_permission_verified,historical_sources_verified,updated_at")
        .order("updated_at",{ascending:false}).limit(100),
      client.from("daily_learning_publications").select("draft_id,published_at")
    ]);
    if(draftResult.error)throw draftResult.error;
    const list=(draftResult.data??[]) as Draft[]; setRows(list);
    if(publicationResult.error){
      setPublicationReady(false);setPublishedDrafts({});
    }else{
      setPublicationReady(true);
      setPublishedDrafts(Object.fromEntries((publicationResult.data??[]).map(row=>[row.draft_id,row.published_at])));
    }
    setSelected(prev=>list.some(x=>x.id===prev)?prev:(list[0]?.id??""));
  }
  useEffect(()=>{
    let live=true;
    void (async()=>{
      try{
        const owner=await verifyIslandOwner();
        if(!live)return;
        if(!owner){setAuth("denied");return;}
        setAuth("ready");await reload();
      }catch{if(live){setAuth("denied");setMessage("无法验证岛主身份。");}}
    })();
    return()=>{live=false;};
  },[]);
  useEffect(()=>{
    setNote(current?.review_note??"");
    setImageRights(current?.image_permission_verified??false);
    setSourcesOk(current?.historical_sources_verified??false);
  },[current]);
  async function signIn(event:React.FormEvent){
    event.preventDefault();setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().auth.signInWithPassword({email,password});
      if(error)throw error;
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("该账户不是岛主账户。");
      setPassword("");setAuth("ready");await reload();
    }catch(e){setMessage(e instanceof Error?e.message:"登录失败");}
    finally{setBusy(false);}
  }
  async function decide(status:"approved"|"changes_requested"|"rejected"){
    if(!current)return;
    if(status==="approved"&&(!imageRights||!sourcesOk)){setMessage("批准前必须核实图片使用权和历史资料。");return;}
    if(status==="changes_requested"&&!note.trim()){setMessage("请填写修改意见。");return;}
    if(!window.confirm(status==="approved"?"批准当前版本？批准后不可修改。此操作不会发布。":"确认更新审核状态？"))return;
    setBusy(true);setMessage("");
    try{
      const fields:Record<string,unknown>={
        status,review_note:note.trim(),image_permission_verified:imageRights,
        historical_sources_verified:sourcesOk
      };
      if(status==="approved")fields.approved_content=current.content;
      const {error}=await getIslandOwnerClient().from("daily_learning_article_drafts")
        .update(fields).eq("id",current.id).eq("version",current.version);
      if(error)throw error;await reload();setMessage(status==="approved"?"已批准并锁定版本。未发布。":"审核状态已更新。");
    }catch(e){setMessage(e instanceof Error?e.message:"保存失败");}
    finally{setBusy(false);}
  }
  async function publish(){
    if(!publicationReady){setMessage("发布表尚未部署。草稿生成和审核可以继续，正式发布暂不可用。");return;}
    if(!current||current.status!=="approved"||publishedDrafts[current.id])return;
    if(!window.confirm(`正式发布 ${text(current.content.title)||current.source_id} v${current.version}？发布记录不可修改或删除。`))return;
    setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().from("daily_learning_publications").insert({
        owner_id:(await verifyIslandOwner())?.id,
        draft_id:current.id,
        source_id:current.source_id,
        draft_version:current.version,
        source_record:current.source_record,
        content:current.content
      });
      if(error)throw error;
      await reload();setMessage("已创建不可变发布记录。公开阅读页接入将在下一步完成。");
    }catch(error){setMessage(error instanceof Error?error.message:"发布失败");}
    finally{setBusy(false);}
  }

  async function generateCandidate(candidate:Record<string,unknown>){
    const sourceId=text(candidate.source_id);
    setGeneratingSourceId(sourceId);setMessage(`正在生成《${text(candidate.title)||sourceId}》草稿，请稍候…`);
    try{
      const {data,error}=await getIslandOwnerClient().functions.invoke("daily-learning-generate",{body:{candidate}});
      if(error)throw new Error(await functionErrorMessage(error,"文章生成失败。"));
      if(data?.error)throw new Error(String(data.error));
      await reload();
      if(typeof data?.draft?.id==="string")setSelected(data.draft.id);
      setMessage("文章草稿已生成。审核后才能批准，批准也不会自动发布。");
    }catch(error){setMessage(error instanceof Error?error.message:"文章生成失败。");}
    finally{setGeneratingSourceId("");}
  }
    async function createArticleDraft(event:React.FormEvent){
    event.preventDefault();setCreating(true);setMessage("");
    try{
      const record=JSON.parse(candidateJson);
      const candidate=Array.isArray(record.items)?record.items[0]:record;
      if(!candidate || typeof candidate.source_id!=="string" || !String(candidate.source_url||"").startsWith("https://"))throw new Error("需要有效的候选作品 JSON。");
      const {data,error}=await getIslandOwnerClient().functions.invoke("daily-learning-generate",{body:{candidate}});
      if(error)throw new Error(await functionErrorMessage(error,"草稿生成失败。"));
      if(data?.error)throw new Error(String(data.error));
      setCandidateJson("");await reload();
      if(typeof data?.draft?.id==="string")setSelected(data.draft.id);
      setMessage("文章草稿已生成。请核实作品、历史资料及图片许可。");
    }catch(error){setMessage(error instanceof Error?error.message:"草稿生成失败");}
    finally{setCreating(false);}
  }
  const c=current?.content??{};
  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div className="learning-brand"><h1>每日一看 · 内容审核</h1><p>仅岛主账户可以访问草稿与提交审核</p></div><Link href="/learning" className="learning-pill">返回每日一看</Link></header>
    {auth==="loading"?<div className="learning-review-state"><p>正在验证岛主身份…</p></div>:auth==="denied"?<section className="learning-review-login" aria-labelledby="owner-login-title"><p className="learning-kicker">私人工作区</p><h2 id="owner-login-title">岛主登录</h2><p className="learning-muted">登录后可以生成、审核和发布文章版本。</p><form className="learning-login" onSubmit={signIn}>
      <label htmlFor="owner-email">邮箱</label><input id="owner-email" name="email" className="learning-input" type="email" placeholder="请输入岛主邮箱…" required autoComplete="username" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)}/>
      <label htmlFor="owner-password">密码</label><input id="owner-password" name="password" className="learning-input" type="password" placeholder="请输入密码…" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="learning-primary" disabled={busy}>{busy?"正在登录…":"登录"}</button></form>{message?<p className="learning-review-message" role="alert">{message} 请检查账户或稍后重试。</p>:null}</section>:
    <div className="learning-review-layout"><aside className="learning-review-sidebar"><div className="learning-review-sidebar-heading"><h2>内容草稿</h2><span>{rows.length} 篇</span></div>
      {message?<p className="learning-review-message" role="status" aria-live="polite">{message}</p>:null}
      {!publicationReady?<p className="learning-review-notice">发布功能等待数据库迁移，不影响草稿生成与审核。</p>:null}
      <button className="learning-primary" type="button" disabled={busy||creating||Boolean(generatingSourceId)} onClick={()=>void reload()}>刷新列表</button>
      <details className="learning-review-import"><summary>手动导入候选 JSON</summary><form onSubmit={createArticleDraft} className="learning-login">
        <label htmlFor="candidate-json">候选作品 JSON</label><textarea id="candidate-json" name="candidate-json" className="learning-input" rows={6} value={candidateJson} onChange={e=>setCandidateJson(e.target.value)} autoComplete="off" spellCheck={false} placeholder='例如：{"source_id":"met:123", …}' />
        <button className="learning-primary" disabled={creating||!candidateJson.trim()} type="submit">{creating?"生成中…":"生成导入草稿"}</button>
      </form></details>
      <h3>最新候选{researchDate?" · "+researchDate:""}</h3>
      {initialCandidates.length?initialCandidates.map(item=><div key={text(item.source_id)} className="learning-review-item">
        <strong>{text(item.title)}</strong>
        <small>{text(item.source_id)} · {text(item.creator)}</small>
        <a href={text(item.source_url)} target="_blank" rel="noreferrer">查看馆藏</a>
        <button className="learning-primary" type="button" disabled={creating||Boolean(generatingSourceId)} onClick={()=>void generateCandidate(item)}>{generatingSourceId===text(item.source_id)?"正在生成…":"生成草稿"}</button>
      </div>):<p>暂无候选资料。可粘贴候选作品 JSON。</p>}
      <h3>待审核草稿</h3>
      {rows.map(x=><button type="button" className="learning-review-item" aria-pressed={x.id===selected} key={x.id} onClick={()=>setSelected(x.id)}><strong>{text(x.content.title)||x.source_id}</strong><small>{statuses[x.status]??x.status} · v{x.version}</small></button>)}
      {!rows.length?<p>暂无草稿。采集与文章生成完成后将在此显示。</p>:null}
    </aside><section className="learning-review-content">
    {!current?<p>选择一篇草稿</p>:<article><p className="learning-kicker">{statuses[current.status]??current.status} · 版本 {current.version}</p>
      <h2>{text(c.title)||current.source_id}</h2><p className="learning-muted">{text(c.subject)} · {text(c.creator)} · {text(c.era)}</p>
      {publishedDrafts[current.id]?<p className="learning-kicker">已发布 · {publishedDrafts[current.id].slice(0,10)}</p>:null}
      {text(current.source_record.image_url)?<figure><a href={text(current.source_record.source_url)} target="_blank" rel="noreferrer"><Image className="learning-review-image" src={text(current.source_record.image_url)} alt={text(current.source_record.title)||"候选作品"} width={1024} height={1024} sizes="(max-width: 900px) 100vw, 50vw" unoptimized/></a><figcaption>候选图片：尚未确认发布许可</figcaption></figure>:null}
      <p><strong>核心问题：</strong>{text(c.title)}</p>
      <p>{text(c.introduction)}</p>
      {Array.isArray(c.observations)?c.observations.map((o,i)=><section key={i}><h3>{text((o as Record<string,unknown>).heading)}</h3><p>{text((o as Record<string,unknown>).body)}</p></section>):null}
      <h3>历史理解</h3><p>{text(c.history)}</p>
      <h3>当代连接</h3><p>{text(c.connection)}</p>
      <h3>阅读回应</h3><p>{text(c.question)}</p>
      <h3>来源</h3><a href={text(current.source_record.source_url)} rel="noreferrer" target="_blank">{text(current.source_record.source_url)}</a>
      {Array.isArray(c.editorial_caveats)?<section><h3>Agent 不确定事项</h3><ul>{c.editorial_caveats.map((v,i)=><li key={i}>{text(v)}</li>)}</ul></section>:null}
      <div className="learning-review-actions"><label><input type="checkbox" checked={imageRights} disabled={current.status==="approved"} onChange={e=>setImageRights(e.target.checked)}/> 已核实图片使用许可</label>
      <label><input type="checkbox" checked={sourcesOk} disabled={current.status==="approved"} onChange={e=>setSourcesOk(e.target.checked)}/> 已核实历史事实和来源</label>
      <label>审核意见<textarea className="learning-input" maxLength={2000} value={note} disabled={current.status==="approved"} onChange={e=>setNote(e.target.value)} /></label>
      {current.status!=="approved"&&current.status!=="rejected"?<div className="learning-reactions"><button className="learning-primary" disabled={busy} onClick={()=>void decide("approved")}>批准当前版本（不发布）</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("changes_requested")}>退回修改</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("rejected")}>放弃选题</button></div>:null}
      {current.status==="approved"&&!publishedDrafts[current.id]?<button className="learning-primary" disabled={busy||!publicationReady} onClick={()=>void publish()}>发布这个已批准版本</button>:null}
      </div></article>}</section></div>}
  </div></main>;
}
