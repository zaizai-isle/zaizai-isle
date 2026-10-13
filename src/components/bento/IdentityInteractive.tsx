"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import avatarImage from "@/assets/avatar-v1.webp";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const stateRowMap = { idle: 0, happy: 1, excited: 2, sleepy: 3, working: 4, alert: 5, dragging: 6 } as const;
type StateName = keyof typeof stateRowMap;
const states = Object.keys(stateRowMap) as StateName[];

export function IdentityInteractive({ spriteUrl }: { spriteUrl: string }) {
  const { t, language } = useLanguage();
  const [frame, setFrame] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [activeUrl, setActiveUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [spriteRequested, setSpriteRequested] = useState(false);
  const [petState, setPetState] = useState<StateName>("idle");
  const frameWidth = 276;
  const frameHeight = 274;
  const scale = Math.max(118 / frameWidth, 118 / frameHeight);
  const scaledW = frameWidth * scale;
  const scaledH = frameHeight * scale;

  useEffect(() => {
    if (!hovering || !loaded) return;
    const id = window.setInterval(() => setFrame((previous) => (previous + 1) % 8), 240);
    timerRef.current = id;
    return () => {
      window.clearInterval(id);
      timerRef.current = null;
    };
  }, [hovering, loaded]);

  useEffect(() => {
    if (!spriteRequested) return;
    const prefix = window.location.pathname.includes("/zaizai-isle") ? "/zaizai-isle" : "";
    const files = [spriteUrl, "/shoebill-sprite-transparent.webp", "/shoebill-sprite-transparent.png", "/shoebill-sprite.png", "/shoebill_sprite_clean.png"];
    const candidates = files.flatMap((path) => path.startsWith("http") || path.startsWith("data:") ? [path] : prefix ? [`${prefix}${path}`, path] : [path]);
    let cancelled = false;
    void (async () => {
      for (const url of candidates) {
        const image = new Image();
        const ok = await new Promise<boolean>((resolve) => {
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = url;
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
    return () => { cancelled = true; };
  }, [spriteRequested, spriteUrl]);

  const beginInteraction = () => {
    setSpriteRequested(true);
    setHovering(true);
    if (loaded) setPetState(states[Math.floor(Math.random() * states.length)]);
  };

  return (
    <>
      <div className="relative mb-8 mt-0 group">
        <div className="w-[108px] h-[108px] rounded-full bg-white/50 relative z-10 border border-black/5 shadow-sm overflow-hidden transition-transform duration-300 ease-out hover:scale-105 flex items-center justify-center" onMouseEnter={beginInteraction} onFocus={beginInteraction} onBlur={() => setHovering(false)} onMouseLeave={() => setHovering(false)} tabIndex={0}>
          <NextImage src={avatarImage} alt={t("identity.name")} width={108} height={108} className={`w-full h-full object-cover scale-[1.05] ${hovering && loaded ? "opacity-0" : "opacity-100"} transition-opacity`} placeholder="blur" priority />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${hovering && loaded ? "opacity-100" : "opacity-0"} transition-opacity`} style={{ width: scaledW, height: scaledH, backgroundImage: loaded ? `url(${activeUrl})` : "none", backgroundRepeat: "no-repeat", backgroundPosition: `${-(frame * scaledW)}px ${-(stateRowMap[petState] * scaledH)}px`, backgroundSize: `${8 * scaledW}px ${7 * scaledH}px` }} aria-label="Shoebill Avatar" />
        </div>
      </div>
      <h1 className={cn("relative z-10 text-3xl font-bold text-gray-900 mb-2", language === "en" ? "tracking-normal" : "tracking-[2px]")} onClick={() => setSelectorOpen((open) => !open)}>{t("identity.name")}</h1>
      {selectorOpen ? (
        <div className="isle-fade-in absolute inset-0 z-30 flex items-start justify-center">
          <button aria-label="close-selector" className="absolute inset-0 bg-transparent" onClick={() => setSelectorOpen(false)} />
          <div className="mt-4 pointer-events-auto"><div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-black/10 rounded-full px-2 py-1 shadow">
            {states.map((state) => <button key={state} onClick={() => { setPetState(state); setSelectorOpen(false); }} className={`px-2.5 py-1 text-[11px] rounded-full transition-all ${petState === state ? "bg-black text-white" : "bg-white text-gray-700 border border-black/10"}`}>{state[0].toUpperCase() + state.slice(1)}</button>)}
          </div></div>
        </div>
      ) : null}
      <p className="relative z-10 text-base text-gray-600 font-normal tracking-wide">{t("identity.role")}</p>
      <p className={cn("relative z-10 text-lg font-medium mt-4 leading-[1.5] min-h-[3.5rem] bg-clip-text text-transparent bg-[linear-gradient(to_right,#111827_0%,#111827_35%,#fb923c_50%,#111827_65%,#111827_100%)] bg-[length:300%_auto] bg-[position:100%_0] hover:bg-[position:0%_0] transition-[background-position] duration-[1000ms] cursor-default", language === "en" && "italic")}>{t("identity.slogan")}</p>
    </>
  );
}
