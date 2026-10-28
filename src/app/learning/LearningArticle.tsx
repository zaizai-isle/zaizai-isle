import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { LearningEntry } from "./learning-content";
import { learningEntries, illustratedEntryIds } from "./learning-content";
import { learningImagePath, learningVisuals } from "./learning-visuals";
import { LearningArticleContent } from "./LearningArticleContent";

function LearningHeader() {
  return <header className="learning-header">
    <div className="learning-header-heading">
      <Link href="/" className="learning-back" aria-label="返回小岛首页"><ArrowLeft size={16} aria-hidden="true" /></Link>
      <div className="learning-brand"><h1>每日一看</h1><p>看一件作品，留一点感受。</p></div>
    </div>
    <nav className="learning-header-actions" aria-label="每日一看页面入口">
      <Link prefetch={false} href="/learning/review" className="learning-admin-link" aria-label="内容管理与岛主登录">内容管理</Link>
      <a href="#learning-history" className="learning-pill">往期内容</a>
    </nav>
  </header>;
}

export function LearningArticleLoading() {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <section className="learning-loading" role="status" aria-label="正在加载每日一看">
        <div className="learning-loading-copy" aria-hidden="true">
          <span />
          <h2><span /><span /></h2>
          <p><span /><span /></p>
          <div><span /><span /><span /></div>
        </div>
        <div className="learning-loading-artwork" aria-hidden="true" />
      </section>
    </div>
  </main>;
}

export function LearningPublicationUnavailable() {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <section className="learning-unavailable">
        <p className="learning-kicker">内容暂时不可用</p>
        <h2>这一篇没有成功载入</h2>
        <p>可以稍后再试，或先看看其他内容。</p>
        <Link href="/learning">返回每日一看</Link>
      </section>
    </div>
  </main>;
}

export function LearningArticle({ entry, entries = learningEntries }: { entry: LearningEntry; entries?: LearningEntry[] }) {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <LearningArticleContent entry={entry} />
      <section id="learning-history" className="learning-history" aria-labelledby="learning-history-title">
        <div className="learning-section-heading"><h2 id="learning-history-title">再看一件</h2><p>错过不算欠下，随时回来看看。</p></div>
        <div className="learning-history-grid">{entries.filter((item) => item.isPublishedRecord || illustratedEntryIds.includes(item.id)).map((item) => {
          const image = learningVisuals[item.id];
          const historyImage = image ? learningImagePath(image.asset, "small") : item.imageUrl;
          const href = item.isPublishedRecord ? `/learning?entry=${encodeURIComponent(item.id)}` : `/learning/${item.id}`;
          return <Link prefetch={false} href={href} key={item.id} aria-current={entry.id === item.id ? "page" : undefined} className="learning-history-link">
            {historyImage ? <Image src={historyImage} width={480} height={image ? Math.round(480 * image.height / image.width) : 480} alt={item.subject} loading="lazy" /> : null}
            <span className="learning-kicker">{image?.category ?? item.category ?? "艺术与设计"} · {item.publishDate}</span><h3>{item.subject}</h3><p>{item.title}</p>
          </Link>;
        })}</div>
        <details className="learning-upcoming"><summary>正在准备的选题</summary>{learningEntries.filter((item) => !illustratedEntryIds.includes(item.id)).map((item) => <Link key={item.id} prefetch={false} href={`/learning/${item.id}`}>{item.subject}<span>图片整理中 ↗</span></Link>)}</details>
      </section>
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}
