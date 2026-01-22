import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: number; // 1-4
  rowSpan?: number; // 1-4
  onClick?: () => void;
  borderGradient?: string;
  borderWidth?: number;
}

export function BentoCard({ children, className, colSpan = 1, rowSpan = 1, onClick, borderGradient, borderWidth = 1 }: BentoCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "bg-white/60 backdrop-blur-2xl rounded-[24px] p-5 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:bg-white/70",
        className
      )}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <div 
        className="pointer-events-none absolute inset-0 rounded-[24px] z-50"
        style={{
          padding: `${borderWidth}px`,
          background: borderGradient || 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
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
