"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { BentoHeader, BentoFooter } from "./BentoCommon";

const createLogEntry = (text: string, id: number) => ({
    id,
    text,
    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
});

export function ActivityCard() {
    const { t } = useLanguage();
    const rawLogs = useMemo(() => [
        t('activity.log.visitor'),
        t('activity.log.logic'),
        t('activity.log.env_sync'),
        t('activity.log.drift'),
        t('activity.log.kernel'),
    ], [t]);
    const [logs, setLogs] = useState<{ id: number; text: string; time: string }[]>(() =>
        rawLogs.slice(0, 3).map((text, i) => createLogEntry(text, Date.now() + i))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const newLog = createLogEntry(rawLogs[Math.floor(Math.random() * rawLogs.length)], Date.now());
            setLogs(prev => [newLog, ...prev.slice(0, 4)]);
        }, 12000);

        return () => clearInterval(interval);
    }, [rawLogs]);

    return (
        <BentoCard
            colSpan={4}
            rowSpan={1}
            theme="dark"
            className="overflow-hidden flex flex-col p-5"
            borderGradient={VERTICAL_BORDER_GRADIENT}
        >
            <div className="flex items-center justify-between mb-4">
                <BentoHeader
                    title={t('activity.title')}
                    className="mb-0"
                />
                <div className="flex items-center gap-2 group">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Live Feed</span>
                </div>
            </div>

            <div className="flex-1 font-mono text-xs overflow-hidden leading-relaxed relative min-h-[80px]">
                <div className="flex flex-col justify-end h-full gap-0.5 pt-2">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-start gap-3 group"
                            >
                                <span className="text-white/30 shrink-0 font-light select-none tabular-nums">
                                    {log.time}
                                </span>
                                <span className="flex-1 text-white/40 group-hover:text-white/70 transition-colors pointer-events-none truncate">
                                    {log.text}
                                </span>
                                <span className="text-white/[0.05] group-hover:text-emerald-500/20 transition-colors shrink-0">
                                    {'>_'}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <BentoFooter className="pt-2 border-t border-white/5 mt-2">
                <div className="flex items-center justify-between w-full opacity-30">
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-sm bg-white/20" />
                            <span>Resonance: 24Hz</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-sm bg-white/20" />
                            <span>Latency: Minimal</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter">
                        {t('activity.stable')}
                    </span>
                </div>
            </BentoFooter>
        </BentoCard>
    );
}
