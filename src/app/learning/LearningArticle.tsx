import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { LearningEntry } from "./learning-content";
import { learningEntries, illustratedEntryIds } from "./learning-content";
import { learningImagePath, learningVisuals } from "./learning-visuals";
import { DeferredDetails, LearningResponseEntry } from "./LearningDeferred";
import { LearningImage } from "./LearningImage";

export function LearningArticle({ entry }: { entry: LearningEntry }) {
  const visual = learningVisuals[entry.id];
  return <main className="learning-page">
    <div className="learning-shell">
      <header className="learning-header">
        <div className="learning-header-heading">
          <Link href="/" className="learning-back" aria-label="返回小岛首页"><ArrowLeft size={16} aria-hidden="true" /></Link>
          <div className="learning-brand"><h1>每日一看</h1><p>看一件作品，留一点感受。</p></div>
        </div>
        <nav className="learning-header-actions" aria-label="每日一看页面入口">
          <Link prefetch={false} href="/learning/review" className="learning-admin-link" aria-label="内容管理与岛主登录">内容管理</Link>
          <a href="#learning-history" className="learning-pill">往期内容</a>
        </nav>
      </header>
      <article>
        <div className="learning-opening">
        {visual ? <figure className="learning-hero">
          <a href={visual.original} target="_blank" rel="noreferrer" aria-label={`打开${entry.subject}原图（新窗口）`}>
            <LearningImage key={visual.asset} sourceSet={`${learningImagePath(visual.asset, "medium")} ${visual.asset === "wave" ? 900 : 960}w, ${learningImagePath(visual.asset)} ${visual.width}w`} sourceSizes="(max-width: 900px) calc(100vw - 40px), 58vw" src={learningImagePath(visual.asset)} width={visual.width} height={visual.height} alt={visual.alt} loading="eager" fetchPriority="high" className="learning-hero-image" />
          </a>
          <figcaption><span>{visual.credit}</span><a href={visual.original} target="_blank" rel="noreferrer">查看原图 ↗</a></figcaption>
        </figure> : <div className="learning-unavailable"><p className="learning-kicker">选题准备中</p><h2>{entry.subject}</h2><p>图片还在整理，先保留这则选题与已有记录。</p><a href={entry.sourceUrl} target="_blank" rel="noreferrer">前往馆藏查看作品 ↗</a></div>}
        <div className="learning-introduction">
          <p className="learning-kicker">{visual?.category ?? "设计"} · <time dateTime={entry.publishDate}>{entry.publishDate.replaceAll("-", ".")}</time></p>
          {visual ? <h2 className="learning-artwork-title">{entry.subject}</h2> : null}
          <dl className="learning-artwork-meta">
            <div><dt>作者</dt><dd>{entry.creator}</dd></div>
            <div><dt>年代</dt><dd>{entry.era}</dd></div>
            {visual ? <div><dt>媒介</dt><dd>{visual.medium}</dd></div> : null}
          </dl>
          <h2 className="learning-opening-question">{entry.title}</h2>
          <p className="learning-lead">{entry.summary}</p>
          <a className="learning-source" href={entry.sourceUrl} target="_blank" rel="noreferrer">查看作品资料 ↗</a>
        </div>
        </div>
        {visual ? <DeferredDetails visual={visual} /> : null}
        <section className="learning-reading learning-context" aria-labelledby="learning-context-title">
          <p className="learning-kicker">多了解一点</p><h2 id="learning-context-title">它为什么会出现</h2>
          <p>{entry.context}</p>
          <h3>带着这个观察，看看今天</h3><p>{entry.influence}</p>
          <a className="learning-source" href={entry.sourceUrl} target="_blank" rel="noreferrer">资料来源：{entry.sourceLabel} ↗</a>
        </section>
        {visual ? <details className="learning-reading learning-credits"><summary>图片来源与使用说明</summary><p>{visual.credit}</p><p><a href={visual.source} target="_blank" rel="noreferrer">图片来源</a> · <a href={visual.licenseUrl} target="_blank" rel="noreferrer">{visual.license}</a></p><p>{visual.note}</p></details> : null}
        <section className="learning-reading learning-response" aria-labelledby="learning-question">
          <p className="learning-kicker">回到你的感受</p><h2 id="learning-question">{entry.question}</h2>
          <p className="learning-muted">没有标准答案，也不必每次都写下什么。</p>
          <LearningResponseEntry key={entry.id} entry={{ ...entry, visualSnapshot: visual }} />
        </section>
      </article>
      <section id="learning-history" className="learning-history" aria-labelledby="learning-history-title">
        <div className="learning-section-heading"><h2 id="learning-history-title">再看一件</h2><p>错过不算欠下，随时回来看看。</p></div>
        <div className="learning-history-grid">{learningEntries.filter((item) => illustratedEntryIds.includes(item.id)).map((item) => {
          const image = learningVisuals[item.id];
          return <Link prefetch={false} href={`/learning/${item.id}`} key={item.id} aria-current={entry.id === item.id ? "page" : undefined} className="learning-history-link">
            <Image src={learningImagePath(image.asset, "small")} width={480} height={Math.round(480 * image.height / image.width)} alt={item.subject} loading="lazy" />
            <span className="learning-kicker">{image.category} · {item.publishDate}</span><h3>{item.subject}</h3><p>{item.title}</p>
          </Link>;
        })}</div>
        <details className="learning-upcoming"><summary>正在准备的选题</summary>{learningEntries.filter((item) => !illustratedEntryIds.includes(item.id)).map((item) => <Link key={item.id} prefetch={false} href={`/learning/${item.id}`}>{item.subject}<span>图片整理中 ↗</span></Link>)}</details>
      </section>
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}
