"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getIslandOwnerClient } from "@/lib/island-owner-client";
import { verifyIslandOwner } from "../learning-repository";
import { validateLearningPackageV2, type LearningPackageV2 } from "../learning-package";
import type { LearningArticleAsset, LearningEntry } from "../learning-content";
import { LearningArticleContent } from "../LearningArticleContent";
import { learningAssetUrl } from "../learning-asset-cache";
import { learningDetailCrop } from "../learning-detail-decisions";
import { learningPlanGapByIssue } from "./learning-plan-gaps";

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
const reviewImageUrl = (path: string) => `/zaizai-isle${path}`;
const plannedIssues = [
  ["01","神奈川冲浪里",""],
  ["02","十竹斋书画谱",""],
  ["03","梵高《雨中的桥》",""],
  ["04","《移民母亲》",""],
  ["05","图像观看关联阅读",""],
  ["06","《Strawberry Thief》",""],
  ["07","瓦西里椅",""],
  ["08","Anni Albers 设计稿","已补匹配图片，发布许可待核"],
  ["09","Braun SK 4/10",""],
  ["10","日常设计关联阅读","等待第 08 期"],
  ["11","《Nord Express》","已补匹配图片，发布许可待核"],
  ["12","墨西哥骷髅骑车印刷品",""],
  ["13","Isotype 商船统计图","具体图版与许可尚未锁定"],
  ["14","1933 年伦敦地铁图","已补匹配图片，发布许可待核"],
  ["15","视觉传播关联阅读","等待第 11、13、14 期"],
  ["16","巴拉甘自宅屋顶露台",""],
  ["17","《Carlton》",""],
  ["18","1984 Macintosh GUI","已补匹配截图，Apple 版权待处理"],
  ["19","2007 年初代 iPhone",""],
  ["20","空间到界面关联阅读","等待第 18 期"],
] as const;
type LearningReviewProps = {
  initialCandidates: Record<string, unknown>[];
  researchDate: string;
};

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
  const [publicationReady,setPublicationReady]=useState(true);
  const [draftJson,setDraftJson]=useState("");
  const [importing,setImporting]=useState(false);
  const [selectedGap,setSelectedGap]=useState("");
  const current=rows.find(x=>x.id===selected);
  const currentGap=selectedGap?learningPlanGapByIssue.get(selectedGap):undefined;
  const plannedDrafts=useMemo(()=>{
    const byIssue=new Map<string,Draft>();
    for(const row of rows){
      const issue=text(row.planning?.plan_issue);
      const previous=byIssue.get(issue);
      if(issue&&/^\d{2}$/.test(issue)&&(!previous||row.version>previous.version))byIssue.set(issue,row);
    }
    return byIssue;
  },[rows]);
  const batchPublishTargets=useMemo(()=>Array.from(plannedDrafts.values()).filter(draft=>
    draft.package_schema_version===2
    && !publishedDrafts[draft.id]
    && (
      (draft.status==="pending_review"&&draft.production_status==="awaiting_owner_review")
      || (draft.status==="approved"&&draft.production_status==="owner_approved")
    )
  ),[plannedDrafts,publishedDrafts]);
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
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("岛主登录已过期，请重新登录。");
      const {error}=await getIslandOwnerClient().from("daily_learning_publications").insert(publicationRecord(current,owner.id));
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

  async function approveAndPublishBatch(){
    if(!publicationReady){setMessage("发布表尚未部署，暂时不能批量发布。");return;}
    if(!batchPublishTargets.length)return;
    const awaitingCount=batchPublishTargets.filter(draft=>draft.production_status==="awaiting_owner_review").length;
    const approvedCount=batchPublishTargets.length-awaitingCount;
    if(!window.confirm(`批量处理前 20 期中的 ${batchPublishTargets.length} 篇？其中 ${awaitingCount} 篇将被批准，${approvedCount} 篇已批准；随后全部正式发布。发布记录不可修改或删除。`))return;
    setBusy(true);setMessage(`正在批量批准并发布 0/${batchPublishTargets.length}…`);
    let publishedCount=0;
    const failures:string[]=[];
    try{
      const owner=await verifyIslandOwner();
      if(!owner)throw new Error("岛主登录已过期，请重新登录。");
      const client=getIslandOwnerClient();
      for(const [index,draft] of batchPublishTargets.entries()){
        const label=text(draft.content.title)||draft.source_id;
        try{
          if(draft.production_status==="awaiting_owner_review"){
            const {error:reviewError}=await client.rpc("review_daily_learning_v2",{p_draft_id:draft.id,p_decision:"approved",p_note:"批量批准并发布"});
            if(reviewError)throw reviewError;
          }
          const {error:publishError}=await client.from("daily_learning_publications").insert(publicationRecord(draft,owner.id));
          if(publishError)throw publishError;
          publishedCount+=1;
        }catch(error){
          failures.push(`${label}：${error instanceof Error?error.message:"处理失败"}`);
        }
        setMessage(`正在批量批准并发布 ${index+1}/${batchPublishTargets.length}…`);
      }
      await reload();
      setMessage(failures.length
        ? `已发布 ${publishedCount} 篇，${failures.length} 篇未完成：${failures.join("；")}`
        : `已批量批准并发布 ${publishedCount} 篇。`);
    }catch(error){
      await reload();setMessage(error instanceof Error?error.message:"批量批准并发布失败");
    }finally{setBusy(false);}
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
  const isV2=current?.package_schema_version===2;
  const previewEntry=current?draftToEntry(current):null;
  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div className="learning-brand"><h1>每日一看 · 内容审核</h1><p>仅岛主账户可以访问草稿与提交审核</p></div><Link href="/learning" className="learning-pill">返回每日一看</Link></header>
    {auth==="loading"?<div className="learning-review-state"><p>正在验证岛主身份…</p></div>:auth==="denied"?<section className="learning-review-login" aria-labelledby="owner-login-title"><p className="learning-kicker">私人工作区</p><h2 id="owner-login-title">岛主登录</h2><p className="learning-muted">登录后可以生成、审核和发布文章版本。</p><form className="learning-login" onSubmit={signIn}>
      <label htmlFor="owner-email">邮箱</label><input id="owner-email" name="email" className="learning-input" type="email" placeholder="请输入岛主邮箱…" required autoComplete="username" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)}/>
      <label htmlFor="owner-password">密码</label><input id="owner-password" name="password" className="learning-input" type="password" placeholder="请输入密码…" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="learning-primary" disabled={busy}>{busy?"正在登录…":"登录"}</button></form>{message?<p className="learning-review-message" role="alert">{message} 请检查账户或稍后重试。</p>:null}</section>:
    <div className="learning-review-layout"><aside className="learning-review-sidebar"><div className="learning-review-sidebar-heading"><h2>内容草稿</h2><span>{plannedDrafts.size}/20 期已入库</span></div>
      {message?<p className="learning-review-message" role="status" aria-live="polite">{message}</p>:null}
      {!publicationReady?<p className="learning-review-notice">发布功能等待数据库迁移，不影响草稿生成与审核。</p>:null}
      <button className="learning-primary" type="button" disabled={busy||importing} onClick={()=>void reload()}>刷新列表</button>
      <button className="learning-primary" type="button" disabled={busy||importing||!publicationReady||batchPublishTargets.length===0} onClick={()=>void approveAndPublishBatch()}>{busy?"正在处理…":`批量批准并发布（${batchPublishTargets.length} 篇）`}</button>
      <p className="learning-muted">仅处理前 20 期中每期最新、尚未发布的 v2 版本。</p>
      <details className="learning-review-plan" open><summary>前 20 期完成度</summary><div className="learning-review-plan-list">
        {plannedIssues.map(([issue,title,blocker])=>{const draft=plannedDrafts.get(issue);const published=draft?publishedDrafts[draft.id]:undefined;const label=published?"已发布":draft?(productionStatuses[draft.production_status]??statuses[draft.status]??draft.status):"查看未完成稿";return <button type="button" key={issue} className={`learning-review-plan-item${draft?"":" is-missing"}`} aria-pressed={draft?draft.id===selected:issue===selectedGap} onClick={()=>{if(draft){setSelectedGap("");setSelected(draft.id)}else{setSelected("");setSelectedGap(issue)}}}><span>{issue}</span><strong>{title}</strong><small>{draft?label:`${label} · ${blocker||"尚未生成合格草稿"}`}</small></button>})}
      </div></details>
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
    </aside><section className="learning-review-content">
    {currentGap?<article className="learning-review-gap"><header><p className="learning-kicker">策划 {currentGap.issue} · 未完成稿</p><h1>{currentGap.title}</h1><p>{currentGap.statusLabel}</p></header>{currentGap.images?.length?<section><h2>已补图片与核验结论</h2><div className="learning-review-gap-images">{currentGap.images.map(image=>{const imageUrl=reviewImageUrl(image.src);return <figure key={image.src}><a href={imageUrl} target="_blank" rel="noreferrer" aria-label={`查看原图：${image.alt}`}><Image src={imageUrl} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 720px) 100vw, 720px" /></a><figcaption><strong>{image.caption}</strong><span>{image.assessment}</span></figcaption></figure>})}</div></section>:null}<section><h2>目前已经做到哪里</h2><p><strong>观察问题：</strong>{currentGap.coreQuestion}</p><p><strong>作品范围：</strong>{currentGap.work}</p><ul>{currentGap.completed.map(item=><li key={item}>{item}</li>)}</ul></section>{currentGap.article?<section className="learning-review-gap-article"><h2>现有正文</h2><p className="learning-review-gap-intro">{currentGap.article.introduction}</p>{currentGap.article.observations.map(observation=><div key={observation.heading}><h3>{observation.heading}</h3><p>{observation.body}</p></div>)}<h3>理解</h3><p>{currentGap.article.history}</p><h3>连接</h3><p>{currentGap.article.connection}</p><h3>回应</h3><p>{currentGap.article.question}</p></section>:<section><h2>为什么还没有完整正文</h2><p>这一期目前停留在作品与史料研究阶段。缺少与文章问题匹配、权利明确的具体图片，无法可靠完成“先看—发现”部分。</p></section>}<section className="learning-review-gap-blockers"><h2>阻塞项</h2><ul>{currentGap.blockers.map(item=><li key={item}>{item}</li>)}</ul><h2>下一步</h2><p>{currentGap.nextAction}</p>{currentGap.sources.length?<div className="learning-review-gap-sources">{currentGap.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</div>:null}</section><p className="learning-review-notice">这份内容尚未通过图片、事实与结构门禁，因此不会出现批准或发布按钮。</p></article>:!current||!previewEntry?<p>选择一篇草稿或未完成稿</p>:<><div className="learning-review-preview-status"><span>{isV2&&current.status==="pending_review"?(productionStatuses[current.production_status]??current.production_status):(statuses[current.status]??current.status)} · 版本 {current.version}</span><strong>以下正文使用正式发布布局预览</strong>{publishedDrafts[current.id]?<span>已发布 · {publishedDrafts[current.id].slice(0,10)}</span>:null}</div>
      {!isV2?<p className="learning-review-message">旧格式仅供追溯，不能继续通过当前规范批准或发布。请生成 v2 新版本。</p>:null}
      <div className="learning-review-published-preview"><LearningArticleContent entry={previewEntry} responseMode="preview" /></div>
      <article className="learning-review-inspection"><header><p className="learning-kicker">仅审核页显示</p><h2>策划、证据与审核</h2></header>
      {isV2?<section><h3>策划与规范映射</h3><p>{text(planning.primary_observation_theme)} · {text(planning.primary_observation_method)} · {text(planning.primary_history_node)} · {text(planning.connection_type)}</p><p><strong>核心发现：</strong>{text(planning.core_discovery)}</p><p><strong>选题理由：</strong>{text(planning.selection_reason)}</p></section>:null}
      {isV2?<section><h3>关键论断</h3><ul>{current.claims?.map(claim=><li key={text(claim.claim_id)}><strong>{text(claim.kind)} · {text(claim.verification_status)}</strong>：{text(claim.text)}</li>)}</ul><h3>自动质检</h3><ul>{Array.isArray(quality.checks)?quality.checks.map((check,index)=><li key={index}>{text((check as Record<string,unknown>).check_id)} · {text((check as Record<string,unknown>).status)}：{text((check as Record<string,unknown>).note)}</li>):null}</ul></section>:null}
      {Array.isArray(c.editorial_caveats)?<section><h3>Agent 不确定事项</h3><ul>{c.editorial_caveats.map((v,i)=><li key={i}>{text(v)}</li>)}</ul></section>:null}
      <div className="learning-review-actions">{!isV2?<><label><input type="checkbox" checked={imageRights} disabled onChange={e=>setImageRights(e.target.checked)}/> 旧格式图片核查记录</label>
      <label><input type="checkbox" checked={sourcesOk} disabled onChange={e=>setSourcesOk(e.target.checked)}/> 旧格式史实核查记录</label></>:null}
      <label>审核意见<textarea className="learning-input" maxLength={2000} value={note} disabled={current.status==="approved"} onChange={e=>setNote(e.target.value)} /></label>
      {isV2&&current.production_status==="awaiting_owner_review"&&current.status==="pending_review"?<div className="learning-reactions"><button className="learning-primary" disabled={busy} onClick={()=>void decide("approved")}>批准当前 v2 版本（不发布）</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("changes_requested")}>退回并要求新版本</button><button className="learning-primary" disabled={busy} onClick={()=>void decide("rejected")}>放弃选题</button></div>:null}
      {isV2&&current.production_status==="owner_approved"&&!publishedDrafts[current.id]?<button className="learning-primary" disabled={busy||!publicationReady} onClick={()=>void publish()}>发布这个已批准版本</button>:null}
      </div></article></>}</section></div>}
  </div></main>;
}
