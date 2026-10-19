"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import type { LearningEntry } from "./learning-content";
import type { LearningVisual } from "./learning-visuals";

const Responses = dynamic(() => import("./LearningExperience").then((module) => module.LearningExperience), { loading: () => <p role="status">正在打开回应区…</p> });

class LoadingBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function DeferredDetails({ visual }: { visual: LearningVisual }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Details, setDetails] = useState<ComponentType<{ visual: LearningVisual }> | null>(null);
  useEffect(() => {
    let active = true;
    const load = () => { void import("./LearningDetails").then((module) => {
      if (active) setDetails(() => module.default);
    }).catch(() => { /* Keep the full-height text fallback and source link readable. */ }); };
    if (!("IntersectionObserver" in window)) {
      load();
      return () => { active = false; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { load(); observer.disconnect(); }
    }, { rootMargin: "500px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => { active = false; observer.disconnect(); };
  }, []);
  const placeholder = <div className="learning-details" data-loading-placeholder="learning-details">{visual.details.map((detail, index) => <section className="learning-detail" key={detail.title}>
    <figure><div className="learning-crop" style={{ aspectRatio: `${visual.width * detail.crop[2]} / ${visual.height * detail.crop[3]}` }}><span className="learning-detail-placeholder">原作局部</span></div><figcaption>原作局部 · {visual.credit}</figcaption></figure>
    <div className="learning-detail-copy"><p className="learning-kicker">观察 {String(index + 1).padStart(2, "0")}</p><h2>{detail.title}</h2><p>{detail.text}</p></div>
  </section>)}</div>;
  return <div ref={ref}><LoadingBoundary fallback={placeholder}>{Details ? <Details visual={visual} /> : placeholder}</LoadingBoundary></div>;
}

export function LearningResponseEntry({ entry }: { entry: LearningEntry }) {
  const [open, setOpen] = useState(false);
  return <div className="learning-response-entry">
    {open ? <LoadingBoundary fallback={<p role="alert">回应区暂时无法打开，请刷新后重试。作品仍可继续阅读。</p>}><Responses initialEntry={entry} /></LoadingBoundary> : <button type="button" className="learning-primary" onClick={() => setOpen(true)}>留下这次感受 / 查看我的记录</button>}
    <noscript><p>启用 JavaScript 后可以保存感受；作品与资料仍可直接阅读。</p></noscript>
  </div>;
}
