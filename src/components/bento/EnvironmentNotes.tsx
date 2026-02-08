"use client";

import { BentoCard } from "./BentoCard";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { BentoHeader } from "./BentoCommon";

export const EnvironmentNotes = () => {
    const { t } = useLanguage();

    return (
        <BentoCard
            colSpan={2}
            rowSpan={1}
            theme="dark"
        >
            <BentoHeader
                icon={Quote}
                title={t('env.title')}
                iconColor="text-emerald-500/40"
            />

            <div className="relative z-10 px-0 lg:px-2 flex-1 flex flex-col justify-center">
                <p className="text-sm text-emerald-50/80 leading-relaxed font-medium">
                    {t('env.content')}
                </p>
            </div>

            <div className="mt-auto pt-3">
                <div className="flex items-center justify-between gap-3 py-2 px-4 rounded-full bg-white/5 border border-white/6 w-full backdrop-blur-sm h-9">
                    <span className="text-xs font-mono text-white/30 tracking-wider uppercase">{t('env.mood')}</span>
                    <div className="flex-1 h-[1px] bg-white/5 mx-2" />
                    <span className="text-xs font-mono text-white/30 tracking-wider uppercase">{t('env.sync')}</span>
                </div>
            </div>
        </BentoCard>
    );
};
