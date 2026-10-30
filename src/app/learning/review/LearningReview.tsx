"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getIslandOwnerClient } from "@/lib/island-owner-client";
import { verifyIslandOwner } from "../learning-repository";
import { validateLearningPackageV2, type LearningPackageV2 } from "../learning-package";
import type { LearningArticleAsset, LearningEntry } from "../learning-content";
import { LearningArticleContent } from "../LearningArticleContent";
import { learningAssetUrl } from "../learning-asset-cache";
import { learningDetailCrop } from "../learning-detail-decisions";

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
type Publication = {
  id: string; draft_id: string; published_at: string; display_date: string;
  is_visible: boolean; content: Record<string,unknown>;
  package_snapshot: Record<string,unknown>|null;
};
type LearningReviewProps = {
  initialCandidates: Record<string, unknown>[];
  researchDate: string;
};

function draftValidation(draft: Draft) {
  return validateLearningPackageV2({schema_version:draft.package_schema_version,content_id:draft.content_id,content_type:draft.content_type,planning:draft.planning,work:draft.work_record,article:draft.content,claims:draft.claims,assets:draft.assets,quality:draft.quality});
}

function publicationTitle(publication:Publication) {
  const article=publication.package_snapshot?.article;
  const snapshotArticle=article&&typeof article==="object"?article as Record<string,unknown>:null;
  return text(snapshotArticle?.title)||text(publication.content.title)||"未命名内容";
}

function draftToEntry(draft: Draft): LearningEntry {
  const content=draft.content??{};
  const work=draft.package_schema_version===2&&draft.work_record?draft.work_record:draft.source_record;
  const contentId=draft.content_id??"";
  const mainAsset=draft.assets?.find(asset=>asset.role==="main");
  const observations=Array.isArray(content.observations)?content.observations.flatMap((item,observationIndex)=>{
    if(!item||typeof item!=="object")return [];
    const value=item as Record<string,unknown>;
    const heading=text(value.heading);const body=text(value.body);
    const assetIds=Array.isArray(value.asset_ids)?value.asset_ids.filter((assetId):assetId is string=>typeof assetId==="string"):[];
    const rawCrop=value.crop&&typeof value.crop==="object"?value.crop as Record<string,unknown>:null;
    const crop=rawCrop?{x:Number(rawCrop.x),y:Number(rawCrop.y),width:Number(rawCrop.width),height:Number(rawCrop.height)}:learningDetailCrop(contentId,observationIndex);
    return heading&&body?[{heading,body,assetIds,crop}]:[];
  }):[];
  const articleAssets:LearningArticleAsset[]=(draft.assets??[]).flatMap(asset=>{
    const id=text(asset.asset_id);const imageUrl=text(asset.image_url);const sourceUrl=text(asset.source_page);const role=asset.role;
    if(!id||!imageUrl||!sourceUrl||!["main","detail","comparison"].includes(String(role)))return [];
    const rawCrop=asset.crop&&typeof asset.crop==="object"?asset.crop as Record<string,unknown>:null;
    const crop=rawCrop?{x:Number(rawCrop.x),y:Number(rawCrop.y),width:Number(rawCrop.width),height:Number(rawCrop.height)}:undefined;
    return [{id,role:role as LearningArticleAsset["role"],imageUrl:learningAssetUrl(id,imageUrl),sourceUrl,width:Number(asset.width)||1024,height:Number(asset.height)||1024,alt:text(asset.alt)||text(work.title),attribution:text(asset.attribution),rightsStatement:text(asset.rights_statement),licenseUrl:text(asset.license_url),crop}];
  });
  return {
    id:`draft-${draft.id}`,
    contentId,
    publishDate:draft.updated_at.slice(0,10),
    title:text(content.title)||text(work.title)||draft.source_id,
    subject:text(work.title)||text(content.subject)||draft.source_id,
    creator:text(work.creator)||text(content.creator)||"作者未详",
    era:text(work.date)||text(content.era)||"年代未详",
    medium:text(work.medium),
    summary:text(content.introduction),
    context:text(content.history),
    influence:text(content.connection),
    question:text(content.question),
    sourceLabel:text(work.institution)||text(work.source)||"作品来源",
    sourceUrl:text(work.source_url)||text(draft.source_record.source_url),
    imageUrl:mainAsset?learningAssetUrl(text(mainAsset.asset_id),text(mainAsset.image_url)):text(draft.source_record.image_url)||undefined,
    imageWidth:Number(mainAsset?.width)||Number(draft.source_record.image_width)||1024,
    imageHeight:Number(mainAsset?.height)||Number(draft.source_record.image_height)||1024,
    imageAlt:text(mainAsset?.alt)||text(draft.source_record.image_alt)||text(work.title)||"候选作品",
    imageCredit:text(mainAsset?.attribution)||text(draft.source_record.image_credit)||text(work.institution),
    imageLicense:text(mainAsset?.rights_statement),
    imageLicenseUrl:text(mainAsset?.license_url),
    category:"艺术与设计",
    observations,
    assets:articleAssets
  };
}
export function LearningReview({initialCandidates,researchDate}:LearningReviewProps) {
  const [auth,setAuth]=useState<"loading"|"denied"|"ready">("loading");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [rows,setRows]=useState<Draft[]>([]); const [selected,setSelected]=useState("");
  const [note,setNote]=useState(""); const [imageRights,setImageRights]=useState(false);
  const [sourcesOk,setSourcesOk]=useState(false); const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [publishedDrafts,setPublishedDrafts]=useState<Record<string,string>>({});
  const [publications,setPublications]=useState<Publication[]>([]);
  const [publicationReady,setPublicationReady]=useState(true);
  const [draftJson,setDraftJson]=useState("");
  const [importing,setImporting]=useState(false);
  const current=rows.find(x=>x.id===selected);
  const currentValidation=current?.package_schema_version===2?draftValidation(current):null;
  const pendingDrafts=rows.filter(draft=>!publishedDrafts[draft.id]&&(
    (draft.status==="pending_review"&&draft.production_status==="awaiting_owner_review")
    || (draft.status==="approved"&&draft.production_status==="owner_approved")
  ));
  const draftHistory=rows.filter(draft=>!pendingDrafts.some(pending=>pending.id===draft.id));
  async function reload(){
    const client=getIslandOwnerClient();
    const [draftResult,publicationResult]=await Promise.all([
      client.from("daily_learning_article_drafts")
        .select("id,source_id,version,status,source_record,content,review_note,image_permission_verified,historical_sources_verified,updated_at,package_schema_version,content_id,content_type,production_status,planning,work_record,claims,assets,quality")
        .order("updated_at",{ascending:false}).limit(100),
      client.from("daily_learning_publications")
        .select("id,draft_id,published_at,display_date,is_visible,content,package_snapshot")
        .order("display_date",{ascending:false}).order("published_at",{ascending:false})
    ]);
    if(draftResult.error)throw draftResult.error;
    const list=(draftResult.data??[]) as Draft[]; setRows(list);
    if(publicationResult.error){
      setPublicationReady(false);setPublishedDrafts({});setPublications([]);
    }else{
      const publicationList=(publicationResult.data??[]) as Publication[];
      setPublicationReady(true);
      setPublications(publicationList);
      setPublishedDrafts(Object.fromEntries(publicationList.map(row=>[row.draft_id,row.published_at])));
    }
    const publishedIds=new Set((publicationResult.data??[]).map(row=>row.draft_id));
    const firstPending=list.find(draft=>!publishedIds.has(draft.id)&&(
      (draft.status==="pending_review"&&draft.production_status==="awaiting_owner_review")
      || (draft.status==="approved"&&draft.production_status==="owner_approved")
    ));
    setSelected(prev=>list.some(x=>x.id===prev)?prev:(firstPending?.id??list[0]?.id??""));
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
    if(decision==="approved"&&!draftValidation(current).readyForOwnerReview){setMessage("请先补齐图片与证据，再发布新版本。");return;}
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
    if(!current||current.package_schema_version!==2||publishedDrafts[current.id])return;
    if(!["awaiting_owner_review","owner_approved"].includes(current.production_status)||!["pending_review","approved"].includes(current.status))return;
    const validation=draftValidation(current);
    if(!validation.readyForOwnerReview){setMessage(`发布前仍需处理：${[...validation.errors,...validation.blockers].join("；")}`);return;}
    if(!window.confirm(`正式发布 ${text(current.content.title)||current.source_id} v${current.version}？发布记录不可修改或删除。`))return;
    setBusy(true);setMessage("");
    try{
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("岛主登录已过期，请重新登录。");
      const client=getIslandOwnerClient();
      if(current.production_status==="awaiting_owner_review"){
        const {error:reviewError}=await client.rpc("review_daily_learning_v2",{p_draft_id:current.id,p_decision:"approved",p_note:note.trim()||"岛主确认发布当前版本"});
        if(reviewError)throw reviewError;
      }
      const {error}=await client.from("daily_learning_publications").insert(publicationRecord(current,owner.id));
      if(error)throw error;
      await reload();setMessage("已创建不可变发布记录，并进入公开阅读列表。");
    }catch(error){setMessage(error instanceof Error?error.message:"发布失败");}
    finally{setBusy(false);}
  }

  function publicationRecord(draft:Draft,ownerId:string){
    return {
      owner_id:ownerId,
      draft_id:draft.id,
      source_id:draft.source_id,
      draft_version:draft.version,
      source_record:draft.source_record,
      content:draft.content,
      package_schema_version:2,
      content_id:draft.content_id,
      package_snapshot:{schema_version:2,content_id:draft.content_id,content_type:draft.content_type,planning:draft.planning,work:draft.work_record,article:draft.content,claims:draft.claims,assets:draft.assets,quality:draft.quality}
    };
  }

  async function changeDisplayDate(event:React.FormEvent<HTMLFormElement>,publicationId:string){
    event.preventDefault();
    const displayDate=String(new FormData(event.currentTarget).get("display_date")??"");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(displayDate)){setMessage("请选择有效的展示日期。");return;}
    setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().from("daily_learning_publications")
        .update({display_date:displayDate}).eq("id",publicationId);
      if(error)throw error;
      await reload();setMessage(`展示日期已改为 ${displayDate}；真实发布时间和发布快照没有改变。`);
    }catch(error){setMessage(error instanceof Error?error.message:"展示日期修改失败");}
    finally{setBusy(false);}
  }

  async function setPublicationVisibility(publication:Publication){
    const action=publication.is_visible?"下架":"恢复展示";
    if(!window.confirm(`${action}《${publicationTitle(publication)}》？${publication.is_visible?"公开页面将不再显示，发布记录仍会保留。":"它会重新出现在公开页面，并按展示日期排序。"}`))return;
    setBusy(true);setMessage("");
    try{
      const {error}=await getIslandOwnerClient().from("daily_learning_publications")
        .update({is_visible:!publication.is_visible}).eq("id",publication.id);
      if(error)throw error;
      await reload();setMessage(publication.is_visible?"内容已下架，可随时恢复。":"内容已恢复展示。");
    }catch(error){setMessage(error instanceof Error?error.message:`${action}失败`);}
    finally{setBusy(false);}
  }

  async function importCodexDraft(event:React.FormEvent){
    event.preventDefault();setImporting(true);setMessage("");
    try{
      const parsed=JSON.parse(draftJson);
      const validation=validateLearningPackageV2(parsed);
      if(!validation.valid)throw new Error(validation.errors.join(" "));
      const record=validation.value as LearningPackageV2;
      const mainAsset=record.assets.find(asset=>asset.role==="main")!;
      const sourceId=`${record.work.institution}:${record.work.object_id}`;
      const sourceRecord={source_id:sourceId,source:record.work.institution, ...record.work,image_url:mainAsset.image_url,rights:{rights_statement:mainAsset.rights_statement,rights_url:mainAsset.license_url,attribution:mainAsset.attribution},image_width:mainAsset.width,image_height:mainAsset.height,image_alt:mainAsset.alt};
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("岛主登录已过期，请重新登录。");
      const client=getIslandOwnerClient();
      const {data:versions,error:versionError}=await client.from("daily_learning_article_drafts").select("id,source_id,version,status,production_status,updated_at").eq("content_id",record.content_id).order("version",{ascending:false}).limit(1);
      if(versionError)throw versionError;
      const latest=versions?.[0];
      const editable=latest?.status==="pending_review"&&latest.production_status==="awaiting_owner_review"&&!publishedDrafts[latest.id];
      const payload={
        owner_id:owner.id,source_id:editable?latest.source_id:sourceId,source_record:{...sourceRecord,source_id:editable?latest.source_id:sourceId},content:record.article,
        version:editable?latest.version:(latest?.version??0)+1,status:"pending_review",
        image_permission_verified:false,historical_sources_verified:false,
        package_schema_version:2,content_id:record.content_id,content_type:record.content_type,
        production_status:"awaiting_owner_review",planning:record.planning,work_record:record.work,
        claims:record.claims,assets:record.assets,quality:record.quality
      };
      const write=editable
        ? client.from("daily_learning_article_drafts").update(payload).eq("id",latest.id).eq("status","pending_review").eq("production_status","awaiting_owner_review").eq("updated_at",latest.updated_at)
        : client.from("daily_learning_article_drafts").insert(payload);
      const {data,error}=await write.select("id").single();
      if(error)throw error;
      setDraftJson("");await reload();setSelected(data.id);
      setMessage(editable?"已更新原草稿，未增加版本。":"草稿已入库。");
    }catch(error){setMessage(error instanceof Error?error.message:"Codex 草稿导入失败。");}
    finally{setImporting(false);}
  }
  const c=current?.content??{};
  const planning=current?.planning??{};
  const quality=current?.quality??{};
  const isV2=current?.package_schema_version===2;
  const previewEntry=current?draftToEntry(current):null;
  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div className="learning-brand"><h1>每日一看 · 内容审核</h1><p>仅岛主账户可以访问草稿与提交审核</p></div><Link href="/learning" className="learning-pill">返回每日一看</Link></header>
    {auth==="loading"?<div className="learning-review-state"><p>正在验证岛主身份…</p></div>:auth==="denied"?<section className="learning-review-login" aria-labelledby="owner-login-title"><p className="learning-kicker">私人工作区</p><h2 id="owner-login-title">岛主登录</h2><p className="learning-muted">登录后可以生成、审核和发布文章版本。</p><form className="learning-login" onSubmit={signIn}>
      <label htmlFor="owner-email">邮箱</label><input id="owner-email" name="email" className="learning-input" type="email" placeholder="请输入岛主邮箱…" required autoComplete="username" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)}/>
      <label htmlFor="owner-password">密码</label><input id="owner-password" name="password" className="learning-input" type="password" placeholder="请输入密码…" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="learning-primary" disabled={busy}>{busy?"正在登录…":"登录"}</button></form>{message?<p className="learning-review-message" role="alert">{message} 请检查账户或稍后重试。</p>:null}</section>:
    <div className="learning-review-layout"><aside className="learning-review-sidebar"><div className="learning-review-sidebar-heading"><h2>内容管理</h2><span>{pendingDrafts.length} 篇待发布</span></div>
      {message?<p className="learning-review-message" role="status" aria-live="polite">{message}</p>:null}
      {!publicationReady?<p className="learning-review-notice">发布功能等待数据库迁移，不影响草稿生成与审核。</p>:null}
      <button className="learning-primary" type="button" disabled={busy||importing} onClick={()=>void reload()}>刷新列表</button>
      <details className="learning-review-plan" open><summary>待发布草稿（{pendingDrafts.length}）</summary><div className="learning-review-plan-list">
        {pendingDrafts.map(draft=><button type="button" key={draft.id} className="learning-review-plan-item" aria-pressed={draft.id===selected} onClick={()=>setSelected(draft.id)}><span>v{draft.version}</span><strong>{text(draft.content.title)||text(draft.work_record?.title)||draft.source_id}</strong><small>{productionStatuses[draft.production_status]??statuses[draft.status]??draft.status}{draft.package_schema_version===2&&!draftValidation(draft).readyForOwnerReview?" · 待补图或补证":""}</small></button>)}
        {!pendingDrafts.length?<p className="learning-muted">目前没有待发布草稿。</p>:null}
      </div></details>
      <h3>最新候选{researchDate?" · "+researchDate:""}</h3>
      {initialCandidates.length?initialCandidates.map(item=><div key={text(item.source_id)} className="learning-review-item">
        <strong>{text(item.title)}</strong>
        <small>{text(item.source_id)} · {text(item.creator)}</small>
        <a href={text(item.source_url)} target="_blank" rel="noreferrer">查看馆藏</a>
        <span className="learning-review-awaiting">等待 Codex 研究与起草</span>
      </div>):<p>暂无候选资料。可粘贴候选作品 JSON。</p>}
      <details className="learning-review-publications" open><summary>往期内容（{publications.length}）</summary><div className="learning-review-publication-list">
        {publications.map(publication=><article key={publication.id} className={`learning-review-publication${publication.is_visible?"":" is-hidden"}`}><strong>{publicationTitle(publication)}</strong><small>{publication.is_visible?"展示中":"已下架"} · 实际发布 {publication.published_at.slice(0,10)}</small><form onSubmit={event=>void changeDisplayDate(event,publication.id)}><label>展示日期<input className="learning-input" type="date" name="display_date" defaultValue={publication.display_date} required /></label><button className="learning-secondary" type="submit" disabled={busy}>保存日期</button></form><button className="learning-secondary" type="button" disabled={busy} onClick={()=>void setPublicationVisibility(publication)}>{publication.is_visible?"下架":"恢复展示"}</button></article>)}
      </div></details>
      <details className="learning-review-plan"><summary>草稿历史（{draftHistory.length} 个版本）</summary><div className="learning-review-plan-list">
        {draftHistory.map(draft=><button type="button" key={draft.id} className="learning-review-plan-item" aria-pressed={draft.id===selected} onClick={()=>setSelected(draft.id)}><span>v{draft.version}</span><strong>{text(draft.content.title)||text(draft.work_record?.title)||draft.source_id}</strong><small>{publishedDrafts[draft.id]?"已发布":statuses[draft.status]??draft.status}</small></button>)}
        {!draftHistory.length?<p className="learning-muted">尚无草稿历史。</p>:null}
      </div></details>
      <details className="learning-review-import"><summary>导入 Codex 草稿</summary><form onSubmit={importCodexDraft} className="learning-login">
        <label htmlFor="codex-draft-json">Codex v2 审核包 JSON</label><textarea id="codex-draft-json" name="codex-draft-json" className="learning-input" rows={8} value={draftJson} onChange={e=>setDraftJson(e.target.value)} autoComplete="off" spellCheck={false} placeholder='粘贴 daily_learning_package_v2 JSON…' />
        <button className="learning-primary" disabled={importing||!draftJson.trim()} type="submit">{importing?"正在导入…":"导入私有草稿"}</button>
      </form></details>
    </aside><section className="learning-review-content">
    {!current||!previewEntry?<p>选择一篇草稿</p>:<><div className="learning-review-preview-status"><span>{isV2&&current.status==="pending_review"?(productionStatuses[current.production_status]??current.production_status):(statuses[current.status]??current.status)} · 版本 {current.version}</span><strong>以下正文使用正式发布布局预览</strong>{publishedDrafts[current.id]?<span>已发布 · {publishedDrafts[current.id].slice(0,10)}</span>:null}</div>
      {!isV2?<p className="learning-review-message">旧格式仅供追溯，不能继续通过当前规范批准或发布。请生成 v2 新版本。</p>:null}
      <div className="learning-review-published-preview"><LearningArticleContent entry={previewEntry} responseMode="preview" /></div>
      <article className="learning-review-inspection"><header><p className="learning-kicker">仅审核页显示</p><h2>策划、证据与审核</h2></header>
      {isV2&&currentValidation&&!currentValidation.readyForOwnerReview?<section className="learning-review-gap-blockers"><h3>待补图或补证</h3><p>草稿已自动入库。补齐下列事项后直接更新此草稿，再决定是否发布。</p><ul>{[...currentValidation.errors,...currentValidation.blockers].map((item,index)=><li key={index}>{item}</li>)}</ul></section>:null}
      {isV2?<section><h3>策划与规范映射</h3><p>{text(planning.primary_observation_theme)} · {text(planning.primary_observation_method)} · {text(planning.primary_history_node)} · {text(planning.connection_type)}</p><p><strong>核心发现：</strong>{text(planning.core_discovery)}</p><p><strong>选题理由：</strong>{text(planning.selection_reason)}</p></section>:null}
      {isV2?<section><h3>关键论断</h3><ul>{current.claims?.map(claim=><li key={text(claim.claim_id)}><strong>{text(claim.kind)} · {text(claim.verification_status)}</strong>：{text(claim.text)}</li>)}</ul><h3>自动质检</h3><ul>{Array.isArray(quality.checks)?quality.checks.map((check,index)=><li key={index}>{text((check as Record<string,unknown>).check_id)} · {text((check as Record<string,unknown>).status)}：{text((check as Record<string,unknown>).note)}</li>):null}</ul></section>:null}
      {Array.isArray(c.editorial_caveats)?<section><h3>Agent 不确定事项</h3><ul>{c.editorial_caveats.map((v,i)=><li key={i}>{text(v)}</li>)}</ul></section>:null}
      <div className="learning-review-actions">{!isV2?<><label><input type="checkbox" checked={imageRights} disabled onChange={e=>setImageRights(e.target.checked)}/> 旧格式图片核查记录</label>
      <label><input type="checkbox" checked={sourcesOk} disabled onChange={e=>setSourcesOk(e.target.checked)}/> 旧格式史实核查记录</label></>:null}
      <label>审核意见<textarea className="learning-input" maxLength={2000} value={note} disabled={current.status==="approved"} onChange={e=>setNote(e.target.value)} /></label>
      {isV2&&current.production_status==="awaiting_owner_review"&&current.status==="pending_review"?<div className="learning-reactions"><button className="learning-primary" disabled={busy||!publicationReady||!currentValidation?.readyForOwnerReview} onClick={()=>void publish()}>发布当前版本</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("changes_requested")}>退回并要求新版本</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("rejected")}>放弃选题</button></div>:null}
      {isV2&&current.production_status==="owner_approved"&&!publishedDrafts[current.id]?<button className="learning-primary" disabled={busy||!publicationReady} onClick={()=>void publish()}>发布这个已批准版本</button>:null}
      </div></article></>}</section></div>}
  </div></main>;
}
