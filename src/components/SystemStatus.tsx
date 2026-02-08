"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, Terminal, Zap } from "lucide-react";
import { useBackground } from "@/lib/background-context";
import { cn } from "@/lib/utils";

export const SystemStatus = () => {
    const [time, setTime] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const { settings } = useBackground();
    const textMode = settings.textMode || 'light';

    useEffect(() => {
        const updateTime = () => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // 根据 textMode 切换样式
    const textColorClass = textMode === 'light' ? 'text-white' : 'text-gray-900';
    const dividerClass = textMode === 'light' ? 'bg-white/30' : 'bg-gray-900/30';

    // 磨砂背景样式
    const headerBgClass = isScrolled
        ? textMode === 'light'
            ? "bg-black/10 backdrop-blur-md"
            : "bg-white/30 backdrop-blur-md"
        : "bg-transparent";

    return (
        <header className={cn(
            "sticky top-0 left-0 right-0 z-40 transition-all duration-500 h-14 flex items-center justify-center w-full",
            isScrolled ? "mt-0" : "mt-16",
            headerBgClass
        )}>
            <div className="w-full max-w-[1336px] px-4 md:px-8 flex items-center justify-between">
                <div className={`flex items-center justify-between w-full ${textColorClass} transition-colors duration-300`}>

                    {/* Left Section */}
                    <div className="flex items-center pl-4 gap-6">
                        <div className="flex items-center gap-2.5 group cursor-default">
                            <Terminal className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold tracking-[0.25em] font-mono">
                                ZAIZAI-ISLE
                            </span>
                        </div>

                        <div className={`h-3 w-[1px] ${dividerClass} hidden sm:block`} />

                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-widest">
                                Power: <span className="text-emerald-400 font-bold">On</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center pr-4 gap-8">
                        <div className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-[0.15em] uppercase">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                <span>
                                    Resonance: <span className="font-bold">Active</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3" />
                                <span>
                                    Kernel: <span className="font-bold">Stable</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-[1px] ${dividerClass} mx-3 hidden sm:block`} />
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-sm font-mono font-bold tracking-[0.15em] tabular-nums">
                                {time}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
