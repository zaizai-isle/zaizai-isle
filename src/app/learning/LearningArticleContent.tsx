import type { LearningEntry } from "./learning-content";
import { learningImagePath, learningVisuals } from "./learning-visuals";
import { DeferredDetails, LearningResponseEntry } from "./LearningDeferred";
import { LearningImage } from "./LearningImage";
import { LearningHeroGallery } from "./LearningHeroGallery";
import { LearningObservationMedia } from "./LearningObservationMedia";

type LearningArticleContentProps = {
  entry: LearningEntry;
  responseMode?: "interactive" | "preview";
};

export function LearningArticleContent({ entry, responseMode = "interactive" }: LearningArticleContentProps) {
  const visual = learningVisuals[entry.id];
  const imageUrl = visual ? learningImagePath(visual.asset) : entry.imageUrl;
  const imageCredit = visual?.credit ?? entry.imageCredit;
  const sourceHref = visual?.original ?? entry.sourceUrl;
  const galleryAssets = visual ? [] : entry.assets?.filter((asset) => asset.role !== "detail") ?? [];

  return <article>
    <div className="learning-opening">
      {galleryAssets.length ? <LearningHeroGallery assets={galleryAssets} subject={entry.subject} /> : imageUrl ? <figure className="learning-hero">
        <a href={sourceHref} target="_blank" rel="noreferrer" aria-label={`打开${entry.subject}原图（新窗口）`}>
          <LearningImage key={imageUrl} sourceSet={visual ? `${learningImagePath(visual.asset, "medium")} ${visual.asset === "wave" ? 900 : 960}w, ${learningImagePath(visual.asset)} ${visual.width}w` : undefined} sourceSizes="(max-width: 900px) calc(100vw - 40px), 58vw" src={imageUrl} width={visual?.width ?? entry.imageWidth ?? 1024} height={visual?.height ?? entry.imageHeight ?? 1024} alt={visual?.alt ?? entry.imageAlt ?? entry.subject} loading="eager" fetchPriority="high" className="learning-hero-image" />
        </a>
        <figcaption><span>{imageCredit}</span><a href={sourceHref} target="_blank" rel="noreferrer">查看原图 ↗</a></figcaption>
      </figure> : <div className="learning-unavailable"><p className="learning-kicker">选题准备中</p><h2>{entry.subject}</h2><p>图片还在整理，先保留这则选题与已有记录。</p><a href={entry.sourceUrl} target="_blank" rel="noreferrer">前往馆藏查看作品 ↗</a></div>}
      <div className="learning-introduction">
        <p className="learning-kicker">{visual?.category ?? entry.category ?? "设计"} · <time dateTime={entry.publishDate}>{entry.publishDate.replaceAll("-", ".")}</time></p>
        {imageUrl ? <h2 className="learning-artwork-title">{entry.subject}</h2> : null}
        <dl className="learning-artwork-meta">
          <div><dt>作者</dt><dd>{entry.creator}</dd></div>
          <div><dt>年代</dt><dd>{entry.era}</dd></div>
          {visual?.medium || entry.medium ? <div><dt>媒介</dt><dd>{visual?.medium ?? entry.medium}</dd></div> : null}
        </dl>
        <h2 className="learning-opening-question">{entry.title}</h2>
        <p className="learning-lead">{entry.summary}</p>
        <a className="learning-source" href={entry.sourceUrl} target="_blank" rel="noreferrer">查看作品资料 ↗</a>
      </div>
    </div>
    {visual ? <DeferredDetails visual={visual} /> : null}
    {!visual && entry.observations?.length ? <div className="learning-observations">{entry.observations.map((observation, index) => {
      const referencedAssets = observation.assetIds?.flatMap((assetId) => {
        const asset = entry.assets?.find((candidate) => candidate.id === assetId);
        return asset ? [asset] : [];
      }) ?? [];
      const observationAssets = observation.crop && referencedAssets[0]
        ? [{ ...referencedAssets[0], id: `${referencedAssets[0].id}-observation-${index}`, role: "detail" as const, crop: observation.crop }]
        : referencedAssets.filter((asset) => asset.role === "detail" || Boolean(asset.crop));
      return <section className="learning-observation" key={`${observation.heading}-${index}`}>
        <LearningObservationMedia assets={observationAssets} />
        <div className="learning-observation-copy"><p className="learning-kicker">观察 {String(index + 1).padStart(2, "0")}</p><h2>{observation.heading}</h2><p>{observation.body}</p></div>
      </section>;
    })}</div> : null}
    <section className="learning-reading learning-context" aria-labelledby={`learning-context-title-${entry.id}`}>
      <p className="learning-kicker">多了解一点</p><h2 id={`learning-context-title-${entry.id}`}>它为什么会出现</h2>
      <p>{entry.context}</p>
      <h3>带着这个观察，看看今天</h3><p>{entry.influence}</p>
      <a className="learning-source" href={entry.sourceUrl} target="_blank" rel="noreferrer">资料来源：{entry.sourceLabel} ↗</a>
    </section>
    {visual ? <details className="learning-reading learning-credits"><summary>图片来源与使用说明</summary><p>{visual.credit}</p><p><a href={visual.source} target="_blank" rel="noreferrer">图片来源</a> · <a href={visual.licenseUrl} target="_blank" rel="noreferrer">{visual.license}</a></p><p>{visual.note}</p></details> : entry.imageUrl ? <details className="learning-reading learning-credits"><summary>图片来源与使用说明</summary><p>{entry.imageCredit}</p><p><a href={entry.sourceUrl} target="_blank" rel="noreferrer">图片来源</a>{entry.imageLicense ? <> · {entry.imageLicenseUrl ? <a href={entry.imageLicenseUrl} target="_blank" rel="noreferrer">{entry.imageLicense}</a> : entry.imageLicense}</> : null}</p></details> : null}
    <section className="learning-reading learning-response" aria-labelledby={`learning-question-${entry.id}`}>
      <p className="learning-kicker">回到你的感受</p><h2 id={`learning-question-${entry.id}`}>{entry.question}</h2>
      <p className="learning-muted">没有标准答案，也不必每次都写下什么。</p>
      {responseMode === "interactive" ? <LearningResponseEntry key={entry.id} entry={{ ...entry, visualSnapshot: visual }} /> : <div className="learning-response-entry" aria-label="发布后回应区域预览">
        <div className="learning-reactions"><button type="button" className="learning-reaction" disabled>有意思</button><button type="button" className="learning-reaction" disabled>没感觉</button><button type="button" className="learning-reaction" disabled>没看懂</button></div>
        <label className="learning-note-label">私人笔记（可选）<textarea className="learning-input" disabled placeholder="发布后可以在这里记录感受…" /></label>
      </div>}
    </section>
  </article>;
}
