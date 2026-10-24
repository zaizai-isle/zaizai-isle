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
  const [candidateJson,setCandidateJson]=useState("");
  const [creating,setCreating]=useState(false);
  const current=rows.find(x=>x.id===selected);
  async function reload(){
    const {data,error}=await getIslandOwnerClient().from("daily_learning_article_drafts")
      .select("id,source_id,version,status,source_record,content,review_note,image_permission_verified,historical_sources_verified,updated_at")
      .order("updated_at",{ascending:false}).limit(100);
    if(error) throw error;
    const list=(data??[]) as Draft[]; setRows(list);
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

  async function generateCandidate(candidate:Record<string,unknown>){
    setCreating(true);setMessage("");
    try{
      const {data,error}=await getIslandOwnerClient().functions.invoke("daily-learning-generate",{body:{candidate}});
      if(error)throw error;
      if(data?.error)throw new Error(String(data.error));
      await reload();
      setMessage("文章草稿已生成。审核后才能批准，批准也不会自动发布。");
    }catch(error){setMessage(error instanceof Error?error.message:"文章生成失败。");}
    finally{setCreating(false);}
  }
    async function createArticleDraft(event:React.FormEvent){
    event.preventDefault();setCreating(true);setMessage("");
    try{
      const record=JSON.parse(candidateJson);
      const candidate=Array.isArray(record.items)?record.items[0]:record;
      if(!candidate || typeof candidate.source_id!=="string" || !String(candidate.source_url||"").startsWith("https://"))throw new Error("需要有效的候选作品 JSON。");
      const {data,error}=await getIslandOwnerClient().functions.invoke("daily-learning-generate",{body:{candidate}});
      if(error)throw error;
      if(data?.error)throw new Error(String(data.error));
      setCandidateJson(""); await reload();setMessage("文章草稿已生成。请核实作品、历史资料及图片许可。");
    }catch(error){setMessage(error instanceof Error?error.message:"草稿生成失败");}
    finally{setCreating(false);}
  }
  const c=current?.content??{};
  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div className="learning-brand"><h1>每日一看 · 内容审核</h1><p>仅岛主账户可以访问草稿与提交审核</p></div><Link href="/learning" className="learning-pill">返回每日一看</Link></header>
    {auth==="loading"?<p>正在验证岛主身份…</p>:auth==="denied"?<section className="learning-reading"><h2>岛主登录</h2><form className="learning-login" onSubmit={signIn}>
      <input className="learning-input" type="email" placeholder="邮箱" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="learning-input" type="password" placeholder="密码" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="learning-primary" disabled={busy}>登录</button></form></section>:
    <div className="learning-review-layout"><aside className="learning-reading"><h2>内容草稿（{rows.length}）</h2>
      <form onSubmit={createArticleDraft} className="learning-login">
        <label>导入一条候选作品 JSON<textarea className="learning-input" rows={5} value={candidateJson} onChange={e=>setCandidateJson(e.target.value)} placeholder='{"source_id":"met:123","title":"...","source_url":"https://...","image_url":"https://...","review_status":"needs_editorial_review"}' /></label>
        <button className="learning-primary" disabled={creating||!candidateJson.trim()} type="submit">{creating?"生成中…":"Agent 生成草稿"}</button>
      </form>
      <button className="learning-primary" type="button" onClick={()=>void reload()}>刷新</button>
      <h3>最新候选作品{researchDate?" · "+researchDate:""}</h3>
      {initialCandidates.length?initialCandidates.map(item=><div key={text(item.source_id)} className="learning-review-item">
        <strong>{text(item.title)}</strong>
        <small>{text(item.source_id)} · {text(item.creator)}</small>
        <a href={text(item.source_url)} target="_blank" rel="noreferrer">查看馆藏</a>
        <button className="learning-primary" type="button" disabled={creating} onClick={()=>void generateCandidate(item)}>生成草稿</button>
      </div>):<p>暂无候选资料。可粘贴候选作品 JSON。</p>}
      <h3>待审核草稿</h3>
      {rows.map(x=><button type="button" className="learning-review-item" aria-pressed={x.id===selected} key={x.id} onClick={()=>setSelected(x.id)}><strong>{text(x.content.title)||x.source_id}</strong><small>{statuses[x.status]??x.status} · v{x.version}</small></button>)}
      {!rows.length?<p>暂无草稿。采集与文章生成完成后将在此显示。</p>:null}
    </aside><section className="learning-reading">
    {!current?<p>选择一篇草稿</p>:<article><p className="learning-kicker">{statuses[current.status]??current.status} · 版本 {current.version}</p>
      <h2>{text(c.title)||current.source_id}</h2><p className="learning-muted">{text(c.subject)} · {text(c.creator)} · {text(c.era)}</p>
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
      </div></article>}</section></div>}
    {message?<p role="status">{message}</p>:null}
  </div></main>;
}
