"use client";

import { useLanguage } from "@/lib/language-context";

export function TranslatedText({ translationKey }: { translationKey: string }) {
  const { t } = useLanguage();
  return <>{t(translationKey)}</>;
}
