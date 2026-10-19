import { LearningDetailImage } from "./LearningDetailImage";
import type { LearningVisual } from "./learning-visuals";

export default function LearningDetails({ visual }: { visual: LearningVisual }) {
  return <div className="learning-details">{visual.details.map((detail, index) => {
    return <section className="learning-detail" key={detail.title}>
      <figure>
        <LearningDetailImage detail={detail} visual={visual} />
        <figcaption>原作局部 · {visual.credit}</figcaption>
      </figure>
      <div className="learning-detail-copy"><p className="learning-kicker">观察 {String(index + 1).padStart(2, "0")}</p><h2>{detail.title}</h2><p>{detail.text}</p></div>
    </section>;
  })}</div>;
}
