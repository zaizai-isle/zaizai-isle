"use client";

import { BentoCard } from "./BentoCard";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as fmMotion } from "framer-motion";
import { Drama, Lightbulb, LucideIcon, PartyPopper } from "lucide-react";
import NextImage from "next/image";
import avatarImage from "@/assets/avatar-v1.png";


import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const Tag = ({ children, variant = 'emerald', icon: Icon }: { children: React.ReactNode; variant?: 'emerald' | 'yellow' | 'rose'; icon?: LucideIcon }) => {
  const variants = {
    emerald: "bg-[#0f1c36] text-emerald-50 hover:bg-emerald-900",
    yellow: "bg-[#281730] text-yellow-50 hover:bg-yellow-900",
    rose: "bg-[#2d0e36] text-rose-50 hover:bg-rose-900",
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
};

const Sparkle = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
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
);

const Cloud = ({
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
};

interface IdentityCardProps {
  spriteUrl?: string;
}

export const IdentityCard = ({ spriteUrl = "/shoebill-sprite-transparent.png" }: IdentityCardProps) => {
  const { t, language } = useLanguage();
  const [frame, setFrame] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  type StateName = "idle" | "happy" | "excited" | "sleepy" | "working" | "alert" | "dragging";
  const [petState, setPetState] = useState<StateName>("idle");
  const frameWidth = 265;
  const frameHeight = 275;
  const stateRowMap: Record<StateName, number> = {
    idle: 0,
    happy: 1,
    excited: 2,
    sleepy: 3,
    working: 4,
    alert: 5,
    dragging: 6,
  };
  const row = stateRowMap[petState] ?? 0;
  const targetSize = 108;
  const framesPerRow = 8;
  const rows = 7;
  const scale = Math.min(targetSize / frameWidth, targetSize / frameHeight);
  const scaledW = frameWidth * scale;
  const scaledH = frameHeight * scale;
  const bgX = -(frame * scaledW);
  const bgY = -(row * scaledH);
  const bgSize = `${framesPerRow * scaledW}px ${rows * scaledH}px`;

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const id = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % 8);
    }, 240);
    timerRef.current = id;
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const prefix =
      typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/zaizai-isle") ||
          window.location.pathname.includes("/zaizai-isle"))
        ? "/zaizai-isle"
        : "";

    const baseFiles = [
      spriteUrl,
      "/shoebill-sprite-transparent.png",
      "/shoebill-sprite.png",
      "/shoebill_sprite_clean.png",
    ].filter((s): s is string => !!s);

    const candidates = baseFiles.flatMap((p) => {
      if (p.startsWith("http") || p.startsWith("data:")) return [p];
      return prefix ? [`${prefix}${p}`, p] : [p];
    });

    let cancelled = false;
    (async () => {
      for (const url of candidates) {
        const img = new Image();
        const ok = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (cancelled) return;
        if (ok) {
          setActiveUrl(url);
          setLoaded(true);
          return;
        }
      }
      setLoaded(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [spriteUrl]);

  return (
    <BentoCard
      colSpan={2}
      rowSpan={2}
      className="bg-white/20 hover:bg-white/25 h-full justify-center items-center text-center relative overflow-hidden group p-8"
      borderGradient="linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)"
      borderWidth={1}
    >
      {/* Structured Cloudscape Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Background - Very subtle warm/cool split */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white/40 to-blue-50/20" />

        {/* Back Layer Clouds (Softer, lower opacity) */}
        <div className="absolute bottom-[-10%] left-[-10%] w-full h-1/2 opacity-60">
          <Cloud variant="warm" className="left-[10%] bottom-0 scale-120" delay={0} opacity={0.6} />
          <Cloud variant="cool" className="right-[20%] bottom-[-20px] scale-125" delay={1} opacity={0.6} />
          <Cloud variant="purple" className="left-[40%] bottom-[-40px] scale-110" delay={2} opacity={0.5} />
        </div>

        {/* Middle Layer Clouds (More defined) */}
        <div className="absolute bottom-[-15%] w-full h-1/2">
          <Cloud variant="warm" className="-left-[5%] bottom-[20%] scale-100" delay={0.5} opacity={0.8} />
          <Cloud variant="cool" className="-right-[5%] bottom-[15%] scale-125" delay={1.5} opacity={0.8} />
          <Cloud variant="default" className="left-[30%] bottom-[5%] scale-100" delay={2.5} opacity={0.9} />
        </div>

        {/* Front Layer Clouds (White, crisp edges) */}
        <div className="absolute bottom-[-20%] w-full h-1/2 z-10">
          <Cloud variant="default" className="-left-[10%] bottom-[5%] scale-80" delay={1} />
          <Cloud variant="default" className="right-[10%] bottom-[25%] scale-95" delay={2} />
          <Cloud variant="default" className="left-[20%] bottom-[10%] scale-105" delay={3} />
          <Cloud variant="default" className="-right-[15%] bottom-[8%] scale-75" delay={2.5} />
        </div>

        {/* Floating Sparkles to accent */}
        <Sparkle className="bottom-[35%] left-[20%] w-5 h-5 text-orange-300" delay={0} />
        <Sparkle className="bottom-[45%] right-[20%] w-6 h-6 text-blue-300" delay={1.5} />
        <Sparkle className="top-[20%] right-[30%] w-4 h-4 text-yellow-300/60" delay={3} />
      </div>

      <div className="relative mb-8 mt-0 group">
        <div
          className="w-[108px] h-[108px] rounded-full bg-white/50 relative z-10 border border-black/5 shadow-sm overflow-hidden transition-transform duration-300 ease-out hover:scale-105 flex items-center justify-center"
          onMouseEnter={() => {
            if (loaded) {
              const pool: StateName[] = ["idle", "happy", "excited", "sleepy", "working", "alert", "dragging"];
              const pick = pool[Math.floor(Math.random() * pool.length)];
              setPetState(pick);
              setHovering(true);
            }
          }}
          onMouseLeave={() => setHovering(false)}
        >
          <NextImage
            src={avatarImage}
            alt={t('identity.name')}
            width={108}
            height={108}
            className={`w-full h-full object-cover ${hovering && loaded ? "opacity-0" : "opacity-100"} transition-opacity`}
            placeholder="blur"
            priority
          />
          <div
            className={`absolute inset-0 ${hovering && loaded ? "opacity-100" : "opacity-0"} transition-opacity`}
            style={{
              backgroundImage: loaded ? `url(${activeUrl})` : "none",
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${bgX}px ${bgY}px`,
              backgroundSize: bgSize,
            }}
            aria-label="Shoebill Avatar"
          />
        </div>
        {!loaded && (
          <div className="text-xs text-black/60 mt-2">
            雪碧图未找到
          </div>
        )}
      </div>

      <h1 className={cn(
        "relative z-10 text-3xl font-bold text-gray-900 mb-2",
        language === 'en' ? "tracking-normal" : "tracking-[2px]"
      )} onClick={() => setSelectorOpen((v) => !v)}>{t('identity.name')}</h1>
      <AnimatePresence>
        {selectorOpen && (
          <fmMotion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-start justify-center"
          >
            <button
              aria-label="close-selector"
              className="absolute inset-0 bg-transparent"
              onClick={() => setSelectorOpen(false)}
            />
            <div className="mt-4 pointer-events-auto">
              <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-black/10 rounded-full px-2 py-1 shadow">
                {(["idle", "happy", "excited", "sleepy", "working", "alert", "dragging"] as StateName[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setPetState(s); setSelectorOpen(false); }}
                    className={`px-2.5 py-1 text-[11px] rounded-full transition-all ${petState === s ? "bg-black text-white" : "bg-white text-gray-700 border border-black/10"}`}
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </fmMotion.div>
        )}
      </AnimatePresence>
      <p className="relative z-10 text-[15px] text-[#666666] font-normal tracking-wide">
        {t('identity.role')}
      </p>

      <p className={cn(
        "relative z-10 text-lg font-medium mt-4 leading-[1.5] min-h-[3.5rem] bg-clip-text text-transparent bg-[linear-gradient(to_right,#111827_0%,#111827_35%,#fb923c_50%,#111827_65%,#111827_100%)] bg-[length:300%_auto] bg-[position:100%_0] hover:bg-[position:0%_0] transition-[background-position] duration-[1000ms] cursor-default",
        language === 'en' && "italic"
      )}>
        {t('identity.slogan')}
      </p>

      <div className="relative z-10 mt-1 flex gap-3 justify-center">
        <Tag variant="emerald" icon={Drama}>{t('identity.tag.mbti')}</Tag>
        <Tag variant="yellow" icon={Lightbulb}>{t('identity.tag.product')}</Tag>
        <Tag variant="rose" icon={PartyPopper}>{t('identity.tag.design')}</Tag>
      </div>
    </BentoCard>
  );
}
