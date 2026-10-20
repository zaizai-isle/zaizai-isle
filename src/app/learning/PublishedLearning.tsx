"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LearningArticle } from "./LearningArticle";
import { learningEntries, type LearningEntry } from "./learning-content";

type PublicationRow = {
  id: string;
  source_id: string;
  source_record: Record<string, unknown>;
  content: Record<string, unknown>;
  published_at: string;
};

const text = (value: unknown) => typeof value === "string" ? value : "";

function sourceLabel(source: string) {
  return ({ smk: "SMK 丹麦国家美术馆", artic: "Art Institute of Chicago", cleveland: "Cleveland Museum of Art", met: "The Metropolitan Museum of Art", loc: "Library of Congress" } as Record<string, string>)[source] || source || "馆藏机构";
}

function toEntry(row: PublicationRow): LearningEntry {
  const record = row.source_record;
  const content = row.content;
  const rights = record.rights && typeof record.rights === "object" ? record.rights as Record<string, unknown> : {};
  const observations = Array.isArray(content.observations) ? content.observations.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const heading = text(value.heading);
    const body = text(value.body);
    return heading && body ? [{ heading, body }] : [];
  }) : [];
  return {
    id: `publication-${row.id}`,
    publishDate: row.published_at.slice(0, 10),
    title: text(content.title) || text(record.title),
    subject: text(content.subject) || text(record.title),
    creator: text(content.creator) || text(record.creator) || "作者未详",
    era: text(content.era) || text(record.date),
    summary: text(content.introduction),
    context: text(content.history),
    influence: text(content.connection),
    question: text(content.question),
    sourceLabel: sourceLabel(text(record.source)),
    sourceUrl: text(record.source_url),
    imageUrl: text(record.image_url) || undefined,
    imageAlt: text(record.title) || text(content.subject) || "馆藏作品",
    imageCredit: `${sourceLabel(text(record.source))} · ${text(record.title)}`,
    imageLicense: text(record.rights_label) || (rights.catalog_public_domain ? "Public Domain" : text(rights.source_rights_note)),
    imageLicenseUrl: text(rights.rights_url),
    medium: text(record.medium),
    category: "艺术与设计",
    observations,
    isPublishedRecord: true,
  };
}

export function PublishedLearning({ initialEntry }: { initialEntry: LearningEntry }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("entry");
  const [entry, setEntry] = useState(initialEntry);
  const [entries, setEntries] = useState<LearningEntry[]>(learningEntries);

  useEffect(() => {
    let active = true;
    void import("@/lib/supabaseClient").then(async ({ getOptionalSupabase }) => {
      const client = getOptionalSupabase();
      if (!client) return;
      const { data, error } = await client.from("daily_learning_publications")
        .select("id,source_id,source_record,content,published_at")
        .order("published_at", { ascending: false })
        .limit(100);
      if (!active || error || !data?.length) return;
      const published = (data as PublicationRow[]).map(toEntry);
      const combined = [...published, ...learningEntries];
      setEntries(combined);
    }).catch(() => { /* The pre-rendered article remains available offline. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!requested) {
      const latest = entries.find((item) => item.isPublishedRecord);
      if (latest) setEntry(latest);
      return;
    }
    const selected = entries.find((item) => item.id === requested);
    if (selected) setEntry(selected);
  }, [entries, requested]);

  return <LearningArticle entry={entry} entries={entries} />;
}
