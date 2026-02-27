"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { Layers, Code2, Database, Globe } from "lucide-react";
import { BentoHeader } from "./BentoCommon";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TechStackCard() {
    const { t } = useLanguage();

    const tech = [
        {
            name: "React / Next.js",
            width: "w-[55%]",
            icon: Code2,
            tags: "Framer, Radix, Lucide"
        },
        {
            name: "TypeScript",
            width: "w-[70%]",
            icon: Layers,
            tags: "Zod, Pattern, Utility"
        },
        {
            name: "Tailwind / CSS",
            width: "w-[85%]",
            icon: Globe,
            tags: "Shadcn, PostCSS, Motion"
        },
        {
            name: "Node / Supabase",
            width: "w-full",
            icon: Database,
            tags: "Postgres, Prisma, Edge"
        },
    ];

    return (
        <BentoCard
            colSpan={4}
            rowSpan={2}
            theme="dark"
            borderGradient={VERTICAL_BORDER_GRADIENT}
            className="flex flex-col p-5 overflow-hidden"
        >
            <BentoHeader
                title={t('tech.title')}
                subtitle={t('tech.subtitle')}
                className="mb-4"
            />

            <div className="flex-1 flex flex-col gap-0.5 mb-0">
                {tech.map((item, i) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, scaleX: 0.9, y: 10 }}
                        whileInView={{ opacity: 1, scaleX: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: (tech.length - i) * 0.08,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className={cn(
                            "relative group flex flex-col justify-center items-center flex-1 transition-all duration-300 mx-auto",
                            item.width
                        )}
                    >
                        {/* Layer Background */}
                        <div className="absolute inset-0 rounded-2xl border border-white/5 bg-white/[0.03] group-hover:bg-white/[0.08] group-hover:border-white/10 transition-all duration-300 backdrop-blur-xs" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center p-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                            <item.icon className="w-3.5 h-3.5 text-white/30 mb-1 group-hover:text-emerald-400/50 transition-colors" />
                            <span className="text-xs font-bold text-white/90 tracking-widest uppercase">
                                {item.name}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase mt-0.5 truncate max-w-[85%]">
                                {item.tags}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </BentoCard>
    );
}
