"use client";

import { useLanguage } from "@/lib/language-context";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";
import { cn, trackEvent } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    trackEvent('switch_language', { language: newLang });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className={cn(
        "bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all text-gray-700 relative overflow-hidden group flex items-center justify-center",
        className
      )}
    >
      <Languages className="w-5 h-5 relative z-10" />
    </motion.button>
  );
}
