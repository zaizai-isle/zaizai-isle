"use client";

import { motion } from "framer-motion";

export const SystemBoundary = () => {
    return (
        <div className="w-full mt-24 pb-12 pt-12 border-t border-white/5 relative overflow-hidden">
            {/* Decorative text bg */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <span className="text-[200px] font-bold leading-none uppercase tracking-tighter">BOUNDARY</span>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white/10 uppercase tracking-tighter mb-8 leading-none">
                    Not a feed.<br />Not a profile.<br />Only building.
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 text-[10px] font-mono tracking-widest uppercase text-white/30">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-white/20"></span>
                        <span>Est. 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-white/20"></span>
                        <span>System Uptime: 99.9%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-white/20"></span>
                        <span>Cognitive Node: Active</span>
                    </div>
                </div>

                <p className="mt-12 text-sm text-white/20 font-medium max-w-sm italic">
                    "This island grows not by accumulation, but by the architectural evolution of thought and code."
                </p>
            </div>
        </div>
    );
};
