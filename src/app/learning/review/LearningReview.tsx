"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getIslandOwnerClient } from "@/lib/island-owner-client";
import { verifyIslandOwner } from "../learning-repository";
import { validateLearningPackageV2, type LearningPackageV2 } from "../learning-package";

type Draft = {
  id: string; source_id: string; version: number; status: string;
  source_record: Record<string, unknown>; content: Record<string, unknown>;
  review_note: string; image_permission_verified: boolean;
  historical_sources_verified: boolean; updated_at: string;
  package_schema_version: number; content_id: string|null; content_type: string|null;
  production_status: string; planning: Record<string,unknown>|null;
  work_record: Record<string,unknown>|null; claims: Record<string,unknown>[]|null;
  assets: Record<string,unknown>[]|null; quality: Record<string,unknown>|null;
};
const statuses: Record<string,string> = {
  pending_review:"待审核", changes_requested:"退回修改",
  approved:"已批准（未发布）", rejected:"放弃"
};
const productionStatuses:Record<string,string>={legacy_v1:"旧格式",awaiting_owner_review:"待岛主审核",owner_approved:"岛主已批准",published:"已发布"};
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
  const [publishedDrafts,setPublishedDrafts]=useState<Record<string,string>>({});
  const [publicationReady,setPublicationReady]=useState(true);
  const [draftJson,setDraftJson]=useState("");
  const [importing,setImporting]=useState(false);
  const current=rows.find(x=>x.id===selected);
  async function reload(){
    const client=getIslandOwnerClient();
    const [draftResult,publicationResult]=await Promise.all([
      client.from("daily_learning_article_drafts")
        .select("id,source_id,version,status,source_record,content,review_note,image_permission_verified,historical_sources_verified,updated_at,package_schema_version,content_id,content_type,production_status,planning,work_record,claims,assets,quality")
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
  async function decide(decision:"approved"|"changes_requested"|"rejected"){
    if(!current)return;
    if(current.package_schema_version!==2){setMessage("旧格式草稿不符合当前规范。请由 Codex 生成 v2 新版本。");return;}
    if(current.production_status!=="awaiting_owner_review"){setMessage("当前版本不在待岛主审核状态。");return;}
    if(decision==="changes_requested"&&!note.trim()){setMessage("请填写修改意见。");return;}
    if(!window.confirm(decision==="approved"?"批准当前 v2 版本？批准后不可修改。此操作不会发布。":"确认提交审核决定？"))return;
    setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().rpc("review_daily_learning_v2",{p_draft_id:current.id,p_decision:decision,p_note:note.trim()});
      if(error)throw error;await reload();setMessage(decision==="approved"?"已批准并锁定 v2 版本。未发布。":"审核决定已保存；修改必须生成新版本。");
    }catch(e){setMessage(e instanceof Error?e.message:"保存失败");}
    finally{setBusy(false);}
  }
  async function publish(){
    if(!publicationReady){setMessage("发布表尚未部署。草稿生成和审核可以继续，正式发布暂不可用。");return;}
    if(!current||current.package_schema_version!==2||current.production_status!=="owner_approved"||publishedDrafts[current.id])return;
    if(!window.confirm(`正式发布 ${text(current.content.title)||current.source_id} v${current.version}？发布记录不可修改或删除。`))return;
    setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().from("daily_learning_publications").insert({
        owner_id:(await verifyIslandOwner())?.id,
        draft_id:current.id,
        source_id:current.source_id,
        draft_version:current.version,
        source_record:current.source_record,
        content:current.content,
        package_schema_version:2,content_id:current.content_id,
        package_snapshot:{schema_version:2,content_id:current.content_id,content_type:current.content_type,planning:current.planning,work:current.work_record,article:current.content,claims:current.claims,assets:current.assets,quality:current.quality}
      });
      if(error)throw error;
      await reload();setMessage("已创建不可变发布记录。公开阅读页接入将在下一步完成。");
    }catch(error){setMessage(error instanceof Error?error.message:"发布失败");}
    finally{setBusy(false);}
  }

  async function importCodexDraft(event:React.FormEvent){
    event.preventDefault();setImporting(true);setMessage("");
    try{
      const parsed=JSON.parse(draftJson);
      const validation=validateLearningPackageV2(parsed);
      if(!validation.valid)throw new Error(validation.errors.join(" "));
      if(!validation.readyForOwnerReview)throw new Error(`草稿仍有阻断项：${validation.blockers.join("；")}`);
      const record=validation.value as LearningPackageV2;
      const mainAsset=record.assets.find(asset=>asset.role==="main")!;
      const sourceId=`${record.work.institution}:${record.work.object_id}`;
      const sourceRecord={source_id:sourceId,source:record.work.institution, ...record.work,image_url:mainAsset.image_url,rights:{rights_statement:mainAsset.rights_statement,rights_url:mainAsset.license_url,attribution:mainAsset.attribution},image_width:mainAsset.width,image_height:mainAsset.height,image_alt:mainAsset.alt};
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("岛主登录已过期，请重新登录。");
      const client=getIslandOwnerClient();
      const {data:versions,error:versionError}=await client.from("daily_learning_article_drafts").select("version").eq("content_id",record.content_id).order("version",{ascending:false}).limit(1);
      if(versionError)throw versionError;
      const {data,error}=await client.from("daily_learning_article_drafts").insert({
        owner_id:owner.id,source_id:sourceId,source_record:sourceRecord,content:record.article,
        version:(versions?.[0]?.version??0)+1,status:"pending_review",
        image_permission_verified:false,historical_sources_verified:false,
        package_schema_version:2,content_id:record.content_id,content_type:record.content_type,
        production_status:"awaiting_owner_review",planning:record.planning,work_record:record.work,
        claims:record.claims,assets:record.assets,quality:record.quality
      }).select("id").single();
      if(error)throw error;
      setDraftJson("");await reload();setSelected(data.id);
      setMessage("v2 审核包已导入。请审阅策划、论断、图片与正文。");
    }catch(error){setMessage(error instanceof Error?error.message:"Codex 草稿导入失败。");}
    finally{setImporting(false);}
  }
  const c=current?.content??{};
  const planning=current?.planning??{};
  const quality=current?.quality??{};
  const mainAsset=current?.assets?.find(asset=>asset.role==="main");
  const isV2=current?.package_schema_version===2;
  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div className="learning-brand"><h1>每日一看 · 内容审核</h1><p>仅岛主账户可以访问草稿与提交审核</p></div><Link href="/learning" className="learning-pill">返回每日一看</Link></header>
    {auth==="loading"?<div className="learning-review-state"><p>正在验证岛主身份…</p></div>:auth==="denied"?<section className="learning-review-login" aria-labelledby="owner-login-title"><p className="learning-kicker">私人工作区</p><h2 id="owner-login-title">岛主登录</h2><p className="learning-muted">登录后可以生成、审核和发布文章版本。</p><form className="learning-login" onSubmit={signIn}>
      <label htmlFor="owner-email">邮箱</label><input id="owner-email" name="email" className="learning-input" type="email" placeholder="请输入岛主邮箱…" required autoComplete="username" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)}/>
      <label htmlFor="owner-password">密码</label><input id="owner-password" name="password" className="learning-input" type="password" placeholder="请输入密码…" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="learning-primary" disabled={busy}>{busy?"正在登录…":"登录"}</button></form>{message?<p className="learning-review-message" role="alert">{message} 请检查账户或稍后重试。</p>:null}</section>:
    <div className="learning-review-layout"><aside className="learning-review-sidebar"><div className="learning-review-sidebar-heading"><h2>内容草稿</h2><span>{rows.length} 篇</span></div>
      {message?<p className="learning-review-message" role="status" aria-live="polite">{message}</p>:null}
      {!publicationReady?<p className="learning-review-notice">发布功能等待数据库迁移，不影响草稿生成与审核。</p>:null}
      <button className="learning-primary" type="button" disabled={busy||importing} onClick={()=>void reload()}>刷新列表</button>
      <details className="learning-review-import"><summary>导入 Codex 草稿</summary><form onSubmit={importCodexDraft} className="learning-login">
        <label htmlFor="codex-draft-json">Codex v2 审核包 JSON</label><textarea id="codex-draft-json" name="codex-draft-json" className="learning-input" rows={8} value={draftJson} onChange={e=>setDraftJson(e.target.value)} autoComplete="off" spellCheck={false} placeholder='粘贴 daily_learning_package_v2 JSON…' />
        <button className="learning-primary" disabled={importing||!draftJson.trim()} type="submit">{importing?"正在导入…":"导入私有草稿"}</button>
      </form></details>
      <h3>最新候选{researchDate?" · "+researchDate:""}</h3>
      {initialCandidates.length?initialCandidates.map(item=><div key={text(item.source_id)} className="learning-review-item">
        <strong>{text(item.title)}</strong>
        <small>{text(item.source_id)} · {text(item.creator)}</small>
        <a href={text(item.source_url)} target="_blank" rel="noreferrer">查看馆藏</a>
        <span className="learning-review-awaiting">等待 Codex 研究与起草</span>
      </div>):<p>暂无候选资料。可粘贴候选作品 JSON。</p>}
      <h3>待审核草稿</h3>
      {rows.map(x=><button type="button" className="learning-review-item" aria-pressed={x.id===selected} key={x.id} onClick={()=>setSelected(x.id)}><strong>{text(x.content.title)||x.source_id}</strong><small>{x.package_schema_version===2&&x.status==="pending_review"?(productionStatuses[x.production_status]??x.production_status):(statuses[x.status]??x.status)} · v{x.version}</small></button>)}
      {!rows.length?<p>暂无草稿。采集与文章生成完成后将在此显示。</p>:null}
    </aside><section className="learning-review-content">
    {!current?<p>选择一篇草稿</p>:<article><p className="learning-kicker">{isV2&&current.status==="pending_review"?(productionStatuses[current.production_status]??current.production_status):(statuses[current.status]??current.status)} · 版本 {current.version}</p>
      <h2>{text(c.title)||current.source_id}</h2><p className="learning-muted">{text(c.subject)} · {text(c.creator)} · {text(c.era)}</p>
      {!isV2?<p className="learning-review-message">旧格式仅供追溯，不能继续通过当前规范批准或发布。请生成 v2 新版本。</p>:null}
      {publishedDrafts[current.id]?<p className="learning-kicker">已发布 · {publishedDrafts[current.id].slice(0,10)}</p>:null}
      {text(mainAsset?.image_url??current.source_record.image_url)?<figure><a href={text(mainAsset?.source_page??current.source_record.source_url)} target="_blank" rel="noreferrer"><Image className="learning-review-image" src={text(mainAsset?.image_url??current.source_record.image_url)} alt={text(mainAsset?.alt??current.source_record.title)||"候选作品"} width={Number(mainAsset?.width)||1024} height={Number(mainAsset?.height)||1024} sizes="(max-width: 900px) 100vw, 50vw" unoptimized/></a><figcaption>{isV2?`${text(mainAsset?.attribution)} · ${text(mainAsset?.rights_statement)}`:"旧格式候选图片"}</figcaption></figure>:null}
      {isV2?<section><h3>策划与规范映射</h3><p>{text(planning.primary_observation_theme)} · {text(planning.primary_observation_method)} · {text(planning.primary_history_node)} · {text(planning.connection_type)}</p><p><strong>核心发现：</strong>{text(planning.core_discovery)}</p><p><strong>选题理由：</strong>{text(planning.selection_reason)}</p></section>:null}
      <p><strong>核心问题：</strong>{text(c.title)}</p>
      <p>{text(c.introduction)}</p>
      {Array.isArray(c.observations)?c.observations.map((o,i)=><section key={i}><h3>{text((o as Record<string,unknown>).heading)}</h3><p>{text((o as Record<string,unknown>).body)}</p></section>):null}
      <h3>历史理解</h3><p>{text(c.history)}</p>
      <h3>当代连接</h3><p>{text(c.connection)}</p>
      <h3>阅读回应</h3><p>{text(c.question)}</p>
      <h3>来源</h3><a href={text(current.source_record.source_url)} rel="noreferrer" target="_blank">{text(current.source_record.source_url)}</a>
      {isV2?<section><h3>关键论断</h3><ul>{current.claims?.map(claim=><li key={text(claim.claim_id)}><strong>{text(claim.kind)} · {text(claim.verification_status)}</strong>：{text(claim.text)}</li>)}</ul><h3>自动质检</h3><ul>{Array.isArray(quality.checks)?quality.checks.map((check,index)=><li key={index}>{text((check as Record<string,unknown>).check_id)} · {text((check as Record<string,unknown>).status)}：{text((check as Record<string,unknown>).note)}</li>):null}</ul></section>:null}
      {Array.isArray(c.editorial_caveats)?<section><h3>Agent 不确定事项</h3><ul>{c.editorial_caveats.map((v,i)=><li key={i}>{text(v)}</li>)}</ul></section>:null}
      <div className="learning-review-actions">{!isV2?<><label><input type="checkbox" checked={imageRights} disabled onChange={e=>setImageRights(e.target.checked)}/> 旧格式图片核查记录</label>
      <label><input type="checkbox" checked={sourcesOk} disabled onChange={e=>setSourcesOk(e.target.checked)}/> 旧格式史实核查记录</label></>:null}
      <label>审核意见<textarea className="learning-input" maxLength={2000} value={note} disabled={current.status==="approved"} onChange={e=>setNote(e.target.value)} /></label>
      {isV2&&current.production_status==="awaiting_owner_review"&&current.status==="pending_review"?<div className="learning-reactions"><button className="learning-primary" disabled={busy} onClick={()=>void decide("approved")}>批准当前 v2 版本（不发布）</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("changes_requested")}>退回并要求新版本</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("rejected")}>放弃选题</button></div>:null}
      {isV2&&current.production_status==="owner_approved"&&!publishedDrafts[current.id]?<button className="learning-primary" disabled={busy||!publicationReady} onClick={()=>void publish()}>发布这个已批准版本</button>:null}
      </div></article>}</section></div>}
  </div></main>;
}
