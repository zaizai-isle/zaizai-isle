import { Drama, Lightbulb, PartyPopper } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { BentoCard } from "./BentoCard";
import { IdentityInteractive } from "./IdentityInteractive";
import { Tag, Sparkle, Cloud } from "./IdentityDecorations";

export const IdentityCard = ({ spriteUrl = "/shoebill-sprite-transparent.webp" }: { spriteUrl?: string }) => (
  <BentoCard colSpan={4} rowSpan={2} theme="light" className="h-full justify-center items-center text-center relative overflow-hidden group p-8" borderGradient="linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)" borderWidth={1}>
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white/40 to-blue-50/20" />
      <div className="absolute bottom-[-10%] left-[-10%] w-full h-1/2 opacity-60">
        <Cloud variant="warm" className="left-[10%] bottom-0 scale-120" delay={0} opacity={0.6} />
        <Cloud variant="cool" className="right-[20%] bottom-[-20px] scale-125" delay={1} opacity={0.6} />
        <Cloud variant="purple" className="left-[40%] bottom-[-40px] scale-110" delay={2} opacity={0.5} />
      </div>
      <div className="absolute bottom-[-15%] w-full h-1/2">
        <Cloud variant="warm" className="-left-[5%] bottom-[20%] scale-100" delay={0.5} opacity={0.8} />
        <Cloud variant="cool" className="-right-[5%] bottom-[15%] scale-125" delay={1.5} opacity={0.8} />
        <Cloud variant="default" className="left-[30%] bottom-[5%] scale-100" delay={2.5} opacity={0.9} />
      </div>
      <div className="absolute bottom-[-20%] w-full h-1/2 z-10">
        <Cloud variant="default" className="-left-[10%] bottom-[5%] scale-80" delay={1} />
        <Cloud variant="default" className="right-[10%] bottom-[25%] scale-95" delay={2} />
        <Cloud variant="default" className="left-[20%] bottom-[10%] scale-105" delay={3} />
        <Cloud variant="default" className="-right-[15%] bottom-[8%] scale-75" delay={2.5} />
      </div>
      <Sparkle className="bottom-[35%] left-[20%] w-5 h-5 text-orange-300" delay={0} />
      <Sparkle className="bottom-[45%] right-[20%] w-6 h-6 text-blue-300" delay={1.5} />
      <Sparkle className="top-[20%] right-[30%] w-4 h-4 text-yellow-300/60" delay={3} />
    </div>

    <IdentityInteractive spriteUrl={spriteUrl} />

    <div className="relative z-10 mt-1 flex gap-3 justify-center">
      <Tag variant="emerald" icon={Drama}><TranslatedText translationKey="identity.tag.mbti" /></Tag>
      <Tag variant="yellow" icon={Lightbulb}><TranslatedText translationKey="identity.tag.product" /></Tag>
      <Tag variant="rose" icon={PartyPopper}><TranslatedText translationKey="identity.tag.design" /></Tag>
    </div>
  </BentoCard>
);
