"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useLanguage } from "@/lib/language-context";

interface BentoHeaderProps {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
    iconColor?: string;
    className?: string;
    theme?: 'light' | 'dark';
}

export function BentoHeader({
    title,
    subtitle,
    className,
    theme = 'dark'
}: BentoHeaderProps) {
    const { language } = useLanguage();
    return (
        <div className={cn("flex flex-col gap-0.5 mb-4", className)}>
            <h3 className={cn(
                "text-lg font-bold leading-tight",
                theme === 'light' ? "text-black/90" : "text-white/90"
            )}>
                {title}
            </h3>
            {subtitle && (
                <p className={cn(
                    "text-xs font-mono tracking-widest leading-relaxed",
                    language === 'en' && "tracking-tight",
                    theme === 'light' ? "text-black/50" : "text-white/40"
                )}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

interface StatusIndicatorProps {
    status?: 'active' | 'building' | 'warning' | 'error';
    label?: string;
    className?: string;
    theme?: 'light' | 'dark';
    ping?: boolean;
}

export function StatusIndicator({ status = 'active', label, className, theme = 'dark', ping = false }: StatusIndicatorProps) {
    const statusColors = {
        active: 'bg-emerald-500',
        building: 'bg-amber-500 animate-pulse',
        warning: 'bg-orange-500',
        error: 'bg-red-500',
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative flex h-2 w-2">
                {ping && status === 'active' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", statusColors[status])}></span>
            </div>
            {label && (
                <span className={cn(
                    "text-[10px] font-mono uppercase tracking-widest",
                    theme === 'light' ? "text-gray-400" : "text-white/40"
                )}>
                    {label}
                </span>
            )}
        </div>
    );
}

interface BentoFooterProps {
    children: ReactNode;
    className?: string;
    theme?: 'light' | 'dark';
}

export function BentoFooter({ children, className, theme = 'dark' }: BentoFooterProps) {
    return (
        <div className={cn(
            "flex items-center justify-between mt-auto pt-3 border-t",
            theme === 'light' ? "border-black/5" : "border-white/5",
            className
        )}>
            {children}
        </div>
    );
}

interface BentoBadgeProps {
    children: ReactNode;
    className?: string;
    theme?: 'light' | 'dark';
}

export function BentoBadge({ children, className, theme = 'dark' }: BentoBadgeProps) {
    return (
        <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-tighter",
            theme === 'light'
                ? "bg-black/5 border-black/10 text-gray-500"
                : "bg-white/5 border-white/10 text-white/40",
            className
        )}>
            {children}
        </span>
    );
}
