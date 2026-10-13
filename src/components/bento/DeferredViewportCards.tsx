"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BentoCardPlaceholder } from "./BentoCardPlaceholder";

function ViewportCard({ name, colSpan, children }: { name: string; colSpan: number; children: ReactNode }) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = placeholderRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      const timer = window.setTimeout(() => setShouldLoad(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return shouldLoad ? children : <BentoCardPlaceholder ref={placeholderRef} name={name} colSpan={colSpan} />;
}

const CompressorCard = dynamic(() => import("./CompressorCard").then((mod) => mod.CompressorCard), { ssr: false, loading: () => <BentoCardPlaceholder name="compressor" colSpan={2} /> });
const AIHubCard = dynamic(() => import("./AIHubCard").then((mod) => mod.AIHubCard), { ssr: false, loading: () => <BentoCardPlaceholder name="ai-hub" colSpan={8} /> });
const GuestbookCard = dynamic(() => import("./GuestbookCard").then((mod) => mod.GuestbookCard), { ssr: false, loading: () => <BentoCardPlaceholder name="guestbook" colSpan={4} /> });
const DailyNoteCard = dynamic(() => import("./DailyNoteCard").then((mod) => mod.DailyNoteCard), { ssr: false, loading: () => <BentoCardPlaceholder name="daily-note" colSpan={4} /> });
const WeatherCard = dynamic(() => import("./WeatherCard").then((mod) => mod.WeatherCard), { ssr: false, loading: () => <BentoCardPlaceholder name="weather" colSpan={4} /> });

export const DeferredCompressorCard = () => <ViewportCard name="compressor" colSpan={2}><CompressorCard /></ViewportCard>;
export const DeferredAIHubCard = () => <ViewportCard name="ai-hub" colSpan={8}><AIHubCard /></ViewportCard>;
export const DeferredGuestbookCard = () => <ViewportCard name="guestbook" colSpan={4}><GuestbookCard /></ViewportCard>;
export const DeferredDailyNoteCard = () => <ViewportCard name="daily-note" colSpan={4}><DailyNoteCard /></ViewportCard>;
export const DeferredWeatherCard = () => <ViewportCard name="weather" colSpan={4}><WeatherCard /></ViewportCard>;
