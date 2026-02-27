"use client";

import { BentoCard } from "./BentoCard";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as fmMotion } from "framer-motion";
import { Drama, Lightbulb, PartyPopper } from "lucide-react";
import NextImage from "next/image";
import avatarImage from "@/assets/avatar-v1.jpg";


import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { Tag, Sparkle, Cloud } from "./IdentityDecorations";

const stateRowMap: Record<string, number> = {
  idle: 0,
  happy: 1,
  excited: 2,
  sleepy: 3,
  working: 4,
  alert: 5,
  dragging: 6,
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
  const frameWidth = 276;
  const frameHeight = 274;
  const row = stateRowMap[petState] ?? 0;
  const targetSize = 118;
  const framesPerRow = 8;
  const rows = 7;
  const scale = Math.max(targetSize / frameWidth, targetSize / frameHeight);
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
      colSpan={4}
      rowSpan={2}
      theme="light"
      className="h-full justify-center items-center text-center relative overflow-hidden group p-8"
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
            className={`w-full h-full object-cover scale-[1.05] ${hovering && loaded ? "opacity-0" : "opacity-100"} transition-opacity`}
            placeholder="blur"
            priority
          />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${hovering && loaded ? "opacity-100" : "opacity-0"} transition-opacity`}
            style={{
              width: scaledW,
              height: scaledH,
              backgroundImage: loaded ? `url(${activeUrl})` : "none",
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${bgX}px ${bgY}px`,
              backgroundSize: bgSize,
            }}
            aria-label="Shoebill Avatar"
          />
        </div>
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
      <p className="relative z-10 text-base text-gray-600 font-normal tracking-wide">
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
