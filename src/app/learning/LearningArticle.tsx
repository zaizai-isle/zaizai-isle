import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LearningEntry } from "./learning-content";
import { LearningArticleContent } from "./LearningArticleContent";

export function LearningHeader({ archive = false }: { archive?: boolean }) {
  return <header className="learning-header">
    <div className="learning-header-heading">
      <Link href="/" className="learning-back" aria-label="返回小岛首页"><ArrowLeft size={16} aria-hidden="true" /></Link>
      <div className="learning-brand"><h1>{archive ? "往期合集" : "每日一看"}</h1><p>{archive ? "错过的这里可以补看。" : "看一件作品，留一点感受。"}</p></div>
    </div>
    <nav className="learning-header-actions" aria-label="每日一看页面入口">
      <a href="/zaizai-isle/learning/review/" className="learning-admin-link" aria-label="内容管理与岛主登录">内容管理</a>
      {archive
        ? <Link href="/learning" className="learning-pill">今日内容</Link>
        : <Link href="/learning/archive" className="learning-pill">往期内容</Link>}
    </nav>
  </header>;
}

export function LearningArticleLoading() {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <section className="learning-loading" role="status" aria-label="正在加载每日一看">
        <div className="learning-loading-artwork" aria-hidden="true" />
        <div className="learning-loading-copy" aria-hidden="true">
          <span />
          <h2><span /><span /></h2>
          <p><span /><span /></p>
          <div><span /><span /><span /></div>
        </div>
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
        <h2>这篇内容没有成功载入</h2>
        <p>可以稍后再试，或先看看其他内容。</p>
        <Link href="/learning">返回每日一看</Link>
      </section>
      <ArchiveCta />
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}

// 往期是独立合集页（/learning/archive），文章页只留入口，不再内嵌往期列表。
function ArchiveCta() {
  return <section className="learning-archive-cta" aria-labelledby="learning-archive-cta-title">
    <div>
      <h2 id="learning-archive-cta-title">往期合集</h2>
      <p>错过的这里可以补看。</p>
    </div>
    <Link href="/learning/archive" className="learning-pill">浏览全部往期 →</Link>
  </section>;
}

// R7 诚实空状态：今天没有新内容时如实说明，不回退旧稿正文。
export function LearningTodayEmpty() {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <section className="learning-unavailable">
        <p className="learning-kicker">每日一看</p>
        <h2>今天没有新内容</h2>
        <p>下一篇还在打磨，明天再来看看吧。</p>
      </section>
      <ArchiveCta />
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}

export function LearningArticle({ entry }: { entry: LearningEntry }) {
  return <main className="learning-page">
    <div className="learning-shell">
      <LearningHeader />
      <LearningArticleContent entry={entry} />
      <ArchiveCta />
      <footer className="learning-footer">ZAIZAI ISLE<span>每天一点，慢慢看见。</span></footer>
    </div>
  </main>;
}
