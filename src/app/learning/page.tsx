import { LearningArticle } from "./LearningArticle";
import { pickInitialEntry } from "./learning-content";

function pontianakDate() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export default function LearningPage() {
  return <LearningArticle entry={pickInitialEntry(pontianakDate())} />;
}
