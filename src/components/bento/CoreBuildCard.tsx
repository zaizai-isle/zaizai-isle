"use client";

import { BentoCard } from "./BentoCard";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { BentoHeader } from "./BentoCommon";
import { useEffect, useState } from "react";

// 抽象岛屿轮廓（极简SVG）
const IslandOutline = () => (
    <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        className="drop-shadow-[0_0_15px_rgba(52,211,153,0.15)]"
        animate={{
            scale: [1, 1.05, 1],
        }}
        transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        {/* 岛屿主体轮廓 - 有机形状 */}
        <motion.path
            d="M 60 30 
               Q 45 32, 35 40 
               Q 25 48, 22 60 
               Q 20 72, 28 82 
               Q 36 92, 50 95 
               Q 64 98, 75 93 
               Q 86 88, 92 78 
               Q 98 68, 96 58 
               Q 94 48, 85 40 
               Q 76 32, 60 30 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-emerald-400/40"
            animate={{
                pathLength: [0, 1],
                opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
                pathLength: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                opacity: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
        />

        {/* 内部细节线条 - 山脉/地形 */}
        <motion.path
            d="M 40 50 Q 50 45, 60 50 Q 70 55, 80 50"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-emerald-400/25"
            animate={{
                opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
            }}
        />

        {/* 中心核心点 */}
        <motion.circle
            cx="60"
            cy="60"
            r="2"
            fill="currentColor"
            className="text-emerald-400/60"
            animate={{
                r: [2, 3, 2],
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    </motion.svg>
);

export const CoreBuildCard = () => {
    const { t, language } = useLanguage();
    const [pulseCount, setPulseCount] = useState(127);

    // 模拟生命律动计数增长
    useEffect(() => {
        const timer = setInterval(() => {
            setPulseCount(prev => prev + Math.floor(Math.random() * 3));
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <BentoCard
            colSpan={2}
            rowSpan={2}
            theme="glass"
            className="flex flex-col p-5 overflow-hidden"
        >
            <BentoHeader
                title={t('core.title')}
                subtitle={t('core.subtitle')}
                className="mb-0"
                theme="light"
            />

            {/* 中心区域：岛屿轮廓 */}
            <div className="flex-1 relative flex flex-col items-center justify-center gap-8">
                {/* 岛屿呼吸动效 */}
                <div className="relative flex items-center justify-center">
                    {/* 外层光晕 */}
                    <motion.div
                        className="absolute w-40 h-40 rounded-full bg-emerald-400/5 blur-2xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <IslandOutline />
                </div>

                {/* 诗意文案区 */}
                <div className="flex flex-col items-center gap-3 z-10">
                    {/* 主状态 */}
                    <motion.div
                        className="text-base font-medium text-white/80 tracking-wide"
                        animate={{
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {language === 'zh' ? '岛屿正在呼吸' : 'The island breathes'}
                    </motion.div>

                    {/* 生命律动计数 */}
                    <div className="text-sm text-white/60 font-light tracking-wide">
                        {language === 'zh'
                            ? `感知到 ${pulseCount} 次生命律动`
                            : `${pulseCount} vital pulses sensed`}
                    </div>

                    {/* 生态状态 */}
                    <div className="flex items-center gap-2 mt-1">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400/70"
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                boxShadow: [
                                    "0 0 4px rgba(52,211,153,0.4)",
                                    "0 0 10px rgba(52,211,153,0.7)",
                                    "0 0 4px rgba(52,211,153,0.4)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <span className="text-sm text-emerald-400/60 font-medium">
                            {language === 'zh' ? '生态系统：繁荣' : 'Ecosystem: Thriving'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 底部状态栏 - 极简 */}
            <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase text-white/30 tracking-wider">
                    {language === 'zh' ? '律动频率：稳定' : 'Rhythm: Stable'}
                </div>
                <div className="text-[10px] font-mono uppercase text-white/30">
                    {t('core.status.syncing')}
                </div>
            </div>
        </BentoCard>
    );
};
