"use client";

import { useBackground } from "@/lib/background-context";
import { cn } from "@/lib/utils";

export const SystemBoundary = () => {
    const { settings } = useBackground();
    const textMode = settings.textMode || 'light';

    // textMode === 'light' -> light text (dark bg)
    // textMode === 'dark'  -> dark text (light bg)
    const isDarkBackground = textMode === 'light';

    const colors = {
        title: isDarkBackground ? "text-white/10" : "text-black/10",
        label: isDarkBackground ? "text-white/30" : "text-black/40",
        quote: isDarkBackground ? "text-white/20" : "text-black/30",
        border: isDarkBackground ? "border-white/5" : "border-black/5",
        line: isDarkBackground ? "bg-white/20" : "bg-black/20",
        watermark: isDarkBackground ? "opacity-[0.02]" : "opacity-[0.03]"
    };

    return (
        <div className={cn(
            "w-full mt-32 pb-16 pt-16 border-t relative overflow-hidden transition-colors duration-500",
            colors.border
        )}>
            {/* Architectural Watermark - Static, clean */}
            {/* <div className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-500",
                colors.watermark
            )}>
                <span className={cn(
                    "text-[15vw] font-black leading-none uppercase tracking-[-0.05em] select-none",
                    isDarkBackground ? "text-white" : "text-black"
                )}>
                    System-Edge
                </span>
            </div> */}

            <div className="relative z-10 max-w-4xl mx-auto px-8">
                <div className="flex flex-col items-center text-center">
                    {/* Main Manifesto - Refined weight */}
                    <div className={cn(
                        "text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] mb-12 opacity-20 transition-colors duration-500",
                        isDarkBackground ? "text-white" : "text-black"
                    )}>
                        Not a feed / Not a profile
                    </div>

                    {/* Protocol Quote - The Soul */}
                    <p className={cn(
                        "text-xs md:text-sm font-medium max-w-md transition-colors duration-500",
                        colors.quote
                    )}>
                        &quot;Isle grows by building, not by explaining.&quot;
                    </p>

                    {/* Meta Info - Minimalist line */}
                    <div className={cn(
                        "mt-16 flex items-center gap-6 text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-500",
                        colors.label
                    )}>
                        <div className="flex items-center gap-2">
                            <span>EST. 2026.02.09</span>
                        </div>
                        <div className={cn("w-1 h-1 rounded-full", colors.line)}></div>
                        <div className="flex items-center gap-2">
                            <span>VER: 1.2.6-ISLE</span>
                        </div>
                        <div className={cn("w-1 h-1 rounded-full", colors.line)}></div>
                        <div className="flex items-center gap-2">
                            <span>{settings.type === 'default' ? 'STABLE' : 'CALIBRATING'}</span>
                        </div>
                    </div>

                    {/* Faint Coordinates */}
                    <div className={cn(
                        "mt-12 text-[8px] font-mono opacity-10 transition-colors",
                        isDarkBackground ? "text-white" : "text-black"
                    )}>
                        22.3964N · 114.1095E
                    </div>
                </div>
            </div>
        </div>
    );
};
