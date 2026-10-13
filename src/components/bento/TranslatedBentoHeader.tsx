"use client";

import { useLanguage } from "@/lib/language-context";
import { BentoHeader } from "./BentoCommon";

export function TranslatedBentoHeader({ titleKey, subtitleKey, subtitleKeys, className, theme = "dark" }: { titleKey: string; subtitleKey?: string; subtitleKeys?: string[]; className?: string; theme?: "light" | "dark" }) {
  const { t } = useLanguage();
  const subtitle = subtitleKeys ? subtitleKeys.map(t).join(" · ") : subtitleKey ? t(subtitleKey) : undefined;
  return <BentoHeader title={t(titleKey)} subtitle={subtitle} className={className} theme={theme} />;
}
