"use client";

import { useLanguage } from "@/lib/language-context";
import { Languages } from "lucide-react";
import { GlassButton } from "./GlassButton";
import { trackEvent } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    trackEvent('switch_language', { language: newLang });
  };

  return (
    <GlassButton
      onClick={toggleLanguage}
      className={className}
      title={language === 'zh' ? 'Switch to English' : '切换至中文'}
    >
      <Languages className="w-4 h-4" />
    </GlassButton>
  );
}
