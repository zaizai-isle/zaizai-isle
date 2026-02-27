"use client";

import { useState, useEffect } from "react";
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
            <div className="w-full max-w-[1536px] px-4 md:px-8 flex items-center justify-between">
                <div className={`flex items-center justify-between w-full ${textColorClass} transition-colors duration-300`}>

                    {/* Left Section */}
                    <div className="flex items-center pl-8">
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="text-xs font-bold tracking-[0.3em] font-mono opacity-80">
                                ISLE.SYS
                            </span>
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
                                <span className="text-[9px] font-mono uppercase tracking-[0.1em] opacity-40">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center pr-8 gap-6">
                        <div className="hidden sm:flex items-center gap-6 text-[9px] font-mono tracking-[0.1em] uppercase opacity-40">
                            <span>V.1.2.6-CALIB</span>
                            <span>S.RT:99.9%</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-[1px] ${dividerClass} mx-2 opacity-20`} />
                            <span className="text-sm font-mono font-bold tracking-[0.15em] tabular-nums opacity-90">
                                {time}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
