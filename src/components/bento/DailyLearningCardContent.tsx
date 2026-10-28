"use client";

import type { LearningEntry } from "@/app/learning/learning-content";
import { learningAssetUrl } from "@/app/learning/learning-asset-cache";
import { TranslatedText } from "@/components/TranslatedText";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicationRow = {
  id: string;
  published_at: string;
  package_schema_version: number | null;
  package_snapshot: Record<string, unknown> | null;
};

type CardEntry = Pick<LearningEntry, "title" | "subject" | "creator" | "era"> & {
  href: string;
  imageUrl?: string;
  imageAlt: string;
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
    imageUrl: mainAsset ? learningAssetUrl(text(mainAsset.asset_id), text(mainAsset.image_url)) : undefined,
    imageAlt: text(mainAsset?.alt) || text(work.title) || title,
    href: `/learning?entry=publication-${row.id}`,
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
  const [entry, setEntry] = useState<CardEntry | null>(null);

  useEffect(() => {
    let active = true;
    void import("@/lib/supabaseClient").then(async ({ getOptionalSupabase }) => {
      const client = getOptionalSupabase();
      if (!client) {
        if (active) setEntry(fallback);
        return;
      }
      const { data, error } = await client.from("daily_learning_publications")
        .select("id,published_at,package_schema_version,package_snapshot")
        .eq("package_schema_version", 2)
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

  if (!entry) {
    return <div className="flex h-full flex-col" role="status" aria-label="正在加载今天的每日一看">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
          <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
          <TranslatedText translationKey="learning.card.eyebrow" />
        </p>
        <span aria-hidden="true" className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.04]" />
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_48%] items-center gap-4" aria-hidden="true">
        <div className="min-w-0 space-y-3">
          <div className="h-5 w-full rounded-full bg-white/10" />
          <div className="h-5 w-4/5 rounded-full bg-white/10" />
          <div className="h-3 w-3/5 rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.05] sm:h-32" />
      </div>
    </div>;
  }

  return <>
    <div className="flex items-center justify-between gap-4">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
        <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
        <TranslatedText translationKey="learning.card.eyebrow" />
      </p>
      <Link href={entry.href} aria-label={`打开每日一看：${entry.title}`} className="group grid h-5 w-5 shrink-0 place-items-center rounded-full text-white/55 transition-[border-color,color,background-color] hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
        <ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
      </Link>
    </div>
    <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_48%] items-center gap-4">
      <div className="min-w-0">
        <h2 className="line-clamp-2 text-balance text-lg font-medium leading-snug tracking-[-0.025em] text-white sm:text-xl">{entry.title}</h2>
        <p className="mt-2 line-clamp-1 text-xs leading-5 text-white/60">{entry.subject} · {entry.creator}</p>
        <p className="mt-1 line-clamp-1 font-mono text-[9px] tracking-[0.12em] text-white/35">{entry.era}</p>
      </div>
      <div className="relative h-28 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:h-32">
        <Image src={entry.imageUrl || fallbackImage} alt={entry.imageAlt} fill sizes="(max-width: 640px) 46vw, 240px" className="object-cover object-center" loading="lazy" unoptimized={entry.imageUrl?.startsWith("https://")} />
      </div>
    </div>
  </>;
}
