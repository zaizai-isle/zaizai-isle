"use client";

import type { LearningEntry } from "@/app/learning/learning-content";
import { learningThumbnailUrl } from "@/app/learning/learning-asset-cache";
import { TranslatedText } from "@/components/TranslatedText";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicationRow = {
  id: string;
  content_id: string | null;
  display_date: string;
  published_at: string;
  package_schema_version: number | null;
  package_snapshot: Record<string, unknown> | null;
};

type CardEntry = Pick<LearningEntry, "title" | "subject" | "creator" | "era"> & {
  href: string;
  imageUrl?: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
};

const text = (value: unknown) => typeof value === "string" ? value : "";

function publicationToCard(row: PublicationRow): CardEntry | null {
  if (row.package_schema_version !== 2 || !row.package_snapshot) return null;
  const snapshot = row.package_snapshot;
  const article = snapshot.article && typeof snapshot.article === "object" ? snapshot.article as Record<string, unknown> : {};
  const work = snapshot.work && typeof snapshot.work === "object" ? snapshot.work as Record<string, unknown> : {};
  const assets = Array.isArray(snapshot.assets) ? snapshot.assets as Record<string, unknown>[] : [];
  const mainAsset = assets.find((asset) => asset.role === "main");
  const title = text(article.title);
  if (!title) return null;
  return {
    title,
    subject: text(work.title),
    creator: text(work.creator) || "作者未详",
    era: text(work.date),
    imageUrl: mainAsset ? learningThumbnailUrl(text(mainAsset.asset_id), text(mainAsset.image_url)) : undefined,
    imageAlt: text(mainAsset?.alt) || text(work.title) || title,
    imageWidth: typeof mainAsset?.width === "number" ? mainAsset.width : undefined,
    imageHeight: typeof mainAsset?.height === "number" ? mainAsset.height : undefined,
    href: row.content_id ? `/learning/${encodeURIComponent(row.content_id)}` : `/learning?entry=publication-${row.id}`,
  };
}

export function DailyLearningCardContent({ fallbackEntry, fallbackImage }: { fallbackEntry: LearningEntry; fallbackImage: string }) {
  const fallback: CardEntry = {
    title: fallbackEntry.title,
    subject: fallbackEntry.subject,
    creator: fallbackEntry.creator,
    era: fallbackEntry.era,
    imageUrl: fallbackImage,
    imageAlt: fallbackEntry.subject,
    href: "/learning",
  };
  // 与其他卡片一致：先渲染构建期兜底内容，拉到最新发布后无缝替换，不用骨架占位。
  const [entry, setEntry] = useState<CardEntry>(fallback);

  useEffect(() => {
    let active = true;
    void import("@/lib/supabaseClient").then(async ({ getOptionalSupabase }) => {
      const client = getOptionalSupabase();
      if (!client) {
        if (active) setEntry(fallback);
        return;
      }
      const { data, error } = await client.from("daily_learning_publications")
        .select("id,content_id,display_date,published_at,package_schema_version,package_snapshot")
        .eq("is_visible", true)
        .eq("package_schema_version", 2)
        .order("display_date", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setEntry(fallback);
        return;
      }
      const published = publicationToCard(data as PublicationRow);
      setEntry(published ?? fallback);
    }).catch(() => {
      if (active) setEntry(fallback);
    });
    return () => { active = false; };
    // The fallback is derived from static build data and intentionally remains
    // stable for the lifetime of this mounted card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPortrait = Boolean(entry.imageWidth && entry.imageHeight && entry.imageHeight > entry.imageWidth);

  return <>
    <div className="flex items-center justify-between gap-4">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
        <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
        <TranslatedText translationKey="learning.card.eyebrow" />
      </p>
      <Link href={entry.href} target="_blank" rel="noopener noreferrer" aria-label={`打开每日一看：${entry.title}`} className="group grid h-5 w-5 shrink-0 place-items-center rounded-full text-white/55 transition-[border-color,color,background-color] hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
        <ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
      </Link>
    </div>
    <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        <h2 className="line-clamp-2 text-balance text-lg font-medium leading-snug tracking-[-0.025em] text-white sm:text-xl">{entry.title}</h2>
        <p className="mt-2 line-clamp-1 text-xs leading-5 text-white/60">{entry.subject} · {entry.creator}</p>
        <p className="mt-1 line-clamp-1 font-mono text-[9px] tracking-[0.12em] text-white/35">{entry.era}</p>
      </div>
      <div data-image-orientation={isPortrait ? "portrait" : "landscape"} className={`relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${isPortrait ? "h-32 w-24" : "h-24 w-36"}`}>
        <Image src={entry.imageUrl || fallbackImage} alt={entry.imageAlt} fill sizes={isPortrait ? "96px" : "144px"} className={isPortrait ? "object-contain object-center" : "object-cover object-center"} loading="lazy" unoptimized={entry.imageUrl?.startsWith("https://")} />
      </div>
    </div>
  </>;
}
