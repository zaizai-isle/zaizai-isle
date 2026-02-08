"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    active?: boolean;
}

export const GlassButton = ({ children, className, active, ...props }: GlassButtonProps) => {
    const isActive = !!active;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "rounded-full backdrop-blur-md transition-all duration-300",
                "flex items-center justify-center text-white/90 relative group",
                // 优化内阴影：顶部微光 + 极弱投影，增加悬浮感
                "shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15)]",
                "border border-transparent",
                className
            )}
            style={{
                backgroundImage: `
          /* 内部填充：极弱渐变，保持通透 */
          linear-gradient(to bottom, rgba(255, 255, 255, ${isActive ? 0.08 : 0.02}), rgba(255, 255, 255, ${isActive ? 0.12 : 0.01})),
          /* 描边渐变：对称光感实现 */
          linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(255, 255, 255, 0.01) 60%, rgba(255, 255, 255, 0.4) 100%)
        `,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                ...props.style
            }}
            {...props}
        >
            {/* 物理高光层 */}
            <div className="absolute inset-x-0 top-0 h-[40%] rounded-t-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>
        </motion.button>
    );
};
