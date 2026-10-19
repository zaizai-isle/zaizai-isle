import { notFound } from "next/navigation";
import { learningEntries } from "../learning-content";
import { LearningArticle } from "../LearningArticle";

export function generateStaticParams() { return learningEntries.map(({ id }) => ({ id })); }
export const dynamicParams = false;

export default async function LearningEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = learningEntries.find((item) => item.id === id);
  if (!entry) notFound();
  return <LearningArticle entry={entry} />;
}
