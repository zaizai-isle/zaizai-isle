import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

export const VERTICAL_BORDER_GRADIENT = "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: number; // 1-6
  rowSpan?: number; // 1-6
  onClick?: () => void;
  borderGradient?: string;
  borderWidth?: number;
  style?: CSSProperties;
  theme?: 'light' | 'dark' | 'glass';
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  onClick,
  borderGradient,
  borderWidth = 1,
  style,
  theme = 'dark'
}: BentoCardProps) {
  const colSpanClasses: Record<number, string> = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
  };

  const rowSpanClasses: Record<number, string> = {
    1: "md:row-span-1",
    2: "md:row-span-2",
    3: "md:row-span-3",
    4: "md:row-span-4",
    5: "md:row-span-5",
    6: "md:row-span-6",
  };

  const themeClasses = theme === 'light'
    ? "bg-white/60 text-gray-900 hover:bg-white/70 shadow-sm shadow-black/5"
    : theme === 'glass'
      ? "bg-white/10 text-white hover:bg-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      : "bg-black/70 text-white hover:bg-black/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)]";

  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        boxShadow: theme === 'light'
          ? "0 10px 30px -10px rgba(0,0,0,0.05)"
          : theme === 'glass'
            ? "0 15px 35px -5px rgba(0,0,0,0.08)"
            : "0 25px 50px -12px rgba(0,0,0,0.3)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "backdrop-blur-xl rounded-3xl p-5 flex flex-col relative overflow-visible transition-all duration-300 min-h-[192px] md:min-h-0",
        themeClasses,
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl z-50"
        style={{
          padding: `${borderWidth}px`,
          background: borderGradient || 'linear-gradient(125deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {children}
    </motion.div>
  );
}
