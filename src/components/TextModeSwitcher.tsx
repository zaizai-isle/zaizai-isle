"use client";

import { useBackground } from "@/lib/background-context";
import { Sun, Moon } from "lucide-react";
import { GlassButton } from "./GlassButton";

interface TextModeSwitcherProps {
    className?: string;
}

export const TextModeSwitcher = ({ className }: TextModeSwitcherProps) => {
    const { settings, toggleTextMode } = useBackground();
    const textMode = settings.textMode || 'dark';

    return (
        <GlassButton
            onClick={toggleTextMode}
            className={className}
            title={textMode === 'light' ? '切换到深色文字' : '切换到浅色文字'}
        >
            {textMode === 'light' ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </GlassButton>
    );
};
