 "use client";
 
 import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
 import { useEffect, useRef, useState } from "react";
 
 
 type StateName = "idle" | "happy" | "excited" | "sleepy" | "working" | "alert" | "dragging";
 
interface ShoebillCardProps {
  spriteUrl?: string;
}
 
export function ShoebillCard({ spriteUrl = "/shoebill-sprite-transparent.png" }: ShoebillCardProps) {
   const [state, setState] = useState<StateName>("idle");
   const [frame, setFrame] = useState(0);
   const timerRef = useRef<number | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>(spriteUrl);
  const [loaded, setLoaded] = useState<boolean>(true);
 
   const frameWidth = 265;
   const frameHeight = 275;
   const framesPerRow = 8;
 
   const stateRowMap: Record<StateName, number> = {
     idle: 0,
     happy: 1,
     excited: 2,
     sleepy: 3,
     working: 4,
     alert: 5,
     dragging: 6,
   };
 
   const speedMap: Record<StateName, number> = {
     idle: 280,
     happy: 280,
     excited: 260,
     sleepy: 220,
     working: 280,
     alert: 270,
     dragging: 280,
   };
 
   useEffect(() => {
     if (timerRef.current) {
       window.clearInterval(timerRef.current);
       timerRef.current = null;
     }
     setFrame(0);
     const speed = speedMap[state] || 240;
     const id = window.setInterval(() => {
       setFrame((prev) => (prev + 1) % framesPerRow);
     }, speed);
     timerRef.current = id;
     return () => {
       if (timerRef.current) {
         window.clearInterval(timerRef.current);
         timerRef.current = null;
       }
     };
   }, [state]);
 
  useEffect(() => {
    const prefix =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/zaizai-isle") ||
        window.location.pathname.includes("/zaizai-isle"))
        ? "/zaizai-isle"
        : "";
    const candidates = [
      spriteUrl,
      "/shoebill-sprite.png",
      "/shoebill_sprite_clean.png",
    ].map((p) => (p.startsWith("http") ? p : `${prefix}${p}`));
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

  const bgX = -(frame * frameWidth);
  const bgY = -(stateRowMap[state] * frameHeight);
  const backgroundImage = `url(${activeUrl})`;
 
   return (
     <BentoCard
       colSpan={1}
       rowSpan={1}
       className="h-full justify-center items-center text-white relative bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]"
       borderGradient={VERTICAL_BORDER_GRADIENT}
     >
       <div className="w-full h-full flex flex-col items-center justify-center gap-4">
         <div className="flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
           <div
             className="w-[276px] h-[275px]"
             style={{
               backgroundImage,
               backgroundRepeat: "no-repeat",
               backgroundPosition: `${bgX}px ${bgY}px`,
               imageRendering: "auto",
               transform: "scale(0.9)",
               transformOrigin: "center",
             }}
             aria-label="Shoebill Sprite"
           />
         </div>
        {!loaded && (
          <div className="text-xs text-white/70">
            雪碧图未找到，请检查 public 路径或文件名
          </div>
        )}
 
         <div className="flex flex-wrap justify-center gap-2 max-w-[360px]">
           {Object.keys(stateRowMap).map((key) => {
             const k = key as StateName;
             const active = state === k;
             return (
               <button
                 key={k}
                 onClick={() => setState(k)}
                 className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                   active
                     ? "bg-emerald-500 text-white border-emerald-400 shadow"
                     : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                 }`}
               >
                 {k[0].toUpperCase() + k.slice(1)}
               </button>
             );
           })}
         </div>
       </div>
     </BentoCard>
   );
 }
