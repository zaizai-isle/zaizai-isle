"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { memo } from 'react';

export const Tag = memo(({ children, variant = 'emerald', icon: Icon }: { children: React.ReactNode; variant?: 'emerald' | 'yellow' | 'rose'; icon?: LucideIcon }) => {
    const variants = {
        emerald: "bg-[#0f1c36] text-emerald-50 hover:bg-emerald-900",
        yellow: "bg-[#281730] text-yellow-50 hover:bg-yellow-900",
        rose: "bg-[#1a2b3c] text-rose-50 hover:bg-rose-900",
    };

    const iconColors = {
        emerald: "text-emerald-500",
        yellow: "text-yellow-500",
        rose: "text-rose-500",
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className={cn(
                "flex items-center justify-center gap-1.5 w-fit px-3 py-1.5 min-w-max text-xs font-bold text-center rounded-full transition-all md:text-sm border border-white/10 hover:border-white/20 shadow-md hover:shadow-lg backdrop-blur-md cursor-default",
                variants[variant]
            )}
        >
            {Icon && <Icon className={cn("w-3.5 h-3.5", iconColors[variant])} />}
            {children}
        </motion.div>
    );
});

Tag.displayName = 'Tag';

export const Sparkle = memo(({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.div
        animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
        className={cn("absolute", className)}
    >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
    </motion.div>
));

Sparkle.displayName = 'Sparkle';

export const Cloud = memo(({
    className,
    delay = 0,
    opacity = 1,
    variant = 'default'
}: {
    className?: string;
    delay?: number;
    opacity?: number;
    variant?: 'default' | 'warm' | 'cool' | 'purple';
}) => {
    const getGradient = (v: string) => {
        switch (v) {
            case 'warm': return "from-orange-200/40 via-orange-100/20 to-transparent border-orange-200/30";
            case 'cool': return "from-blue-200/40 via-blue-100/20 to-transparent border-blue-200/30";
            case 'purple': return "from-purple-200/40 via-purple-100/20 to-transparent border-purple-200/30";
            default: return "from-white/80 via-white/40 to-transparent border-white/40";
        }
    };

    const gradientClass = getGradient(variant);

    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
            className={cn("absolute flex items-end", className)}
            style={{ opacity }}
        >
            <div className={cn("w-20 h-20 rounded-full translate-y-8 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]", gradientClass)} />
            <div className={cn("w-32 h-32 rounded-full -ml-10 backdrop-blur-xl bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] z-10", gradientClass)} />
            <div className={cn("w-24 h-24 rounded-full -ml-12 translate-y-4 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]", gradientClass)} />
        </motion.div>
    );
});

Cloud.displayName = 'Cloud';
