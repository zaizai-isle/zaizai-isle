"use client";

import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import avatarImage from "@/assets/avatar-v1.png";
import qrcodeImage from "@/assets/qrcode.png";
import { Drama, Lightbulb, PartyPopper, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Static Cloud Component for consistent screenshots
const Cloud = ({ 
  className, 
  opacity = 1,
  variant = 'default'
}: { 
  className?: string; 
  opacity?: number;
  variant?: 'default' | 'warm' | 'cool' | 'purple';
}) => {
  const getGradient = (v: string) => {
    switch(v) {
      case 'warm': return "from-orange-200/40 via-orange-100/20 to-transparent border-orange-200/30";
      case 'cool': return "from-blue-200/40 via-blue-100/20 to-transparent border-blue-200/30";
      case 'purple': return "from-purple-200/40 via-purple-100/20 to-transparent border-purple-200/30";
      default: return "from-white/80 via-white/40 to-transparent border-white/40";
    }
  };

  const gradientClass = getGradient(variant);

  return (
    <div 
      className={cn("absolute flex items-end", className)}
      style={{ opacity }}
    >
      <div className={cn("w-20 h-20 rounded-full translate-y-8 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]", gradientClass)} />
      <div className={cn("w-32 h-32 rounded-full -ml-10 backdrop-blur-xl bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] z-10", gradientClass)} />
      <div className={cn("w-24 h-24 rounded-full -ml-12 translate-y-4 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]", gradientClass)} />
    </div>
  );
};

// Static Sparkle
const Sparkle = ({ className }: { className?: string }) => (
  <div className={cn("absolute", className)}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  </div>
);

const Tag = ({ children, variant = 'emerald', icon: Icon }: { children: React.ReactNode; variant?: 'emerald' | 'yellow' | 'rose'; icon?: any }) => {
  const variants = {
    emerald: "bg-[#0f1c36] text-emerald-50",
    yellow: "bg-[#281730] text-yellow-50",
    rose: "bg-[#2d0e36] text-rose-50",
  };
  
  const iconColors = {
    emerald: "text-emerald-500",
    yellow: "text-yellow-500",
    rose: "text-rose-500",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 w-fit px-3 py-1.5 min-w-max text-xs font-bold text-center rounded-full border border-white/10 shadow-md backdrop-blur-md",
        variants[variant]
      )}
    >
      {Icon && <Icon className={cn("w-3.5 h-3.5", iconColors[variant])} />}
      {children}
    </div>
  );
};

export function SharePoster() {
  const { t, language } = useLanguage();
  
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      id="share-poster"
      className="w-[375px] h-[667px] bg-[#e5e5e7] relative flex flex-col items-center justify-between overflow-hidden text-black font-sans"
    >
      {/* Background Layer - Mimicking IdentityCard */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50" />
      
      {/* Cloud Decoration (Static Positioning) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-80 scale-110 origin-bottom">
        <div className="absolute top-[10%] left-[-10%] w-full h-1/2 opacity-60">
            <Cloud variant="warm" className="left-[10%] bottom-0 scale-120" opacity={0.6} />
            <Cloud variant="cool" className="right-[20%] bottom-[-20px] scale-125" opacity={0.6} />
        </div>
        <div className="absolute top-[20%] w-full h-1/2">
             <Cloud variant="warm" className="-left-[5%] bottom-[20%] scale-100" opacity={0.8} />
             <Cloud variant="cool" className="-right-[5%] bottom-[15%] scale-125" opacity={0.8} />
        </div>
        <Sparkle className="top-[15%] left-[20%] w-5 h-5 text-orange-300" />
        <Sparkle className="top-[25%] right-[20%] w-6 h-6 text-blue-300" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center pt-16 px-6">
        
        {/* Avatar Section */}
        <div className="relative mb-6">
          <div className="w-[100px] h-[100px] rounded-full bg-white p-1 shadow-xl relative z-10">
            <Image 
              src={avatarImage} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {/* Decorative halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl scale-125" />
        </div>

        {/* Identity Info */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-[2px]">{t('identity.name')}</h1>
        <p className="text-[15px] text-[#666666] font-normal tracking-wide mb-4">
          {t('identity.role')}
        </p>

        {/* Slogan */}
        <p className={cn(
          "text-lg font-medium leading-[1.5] text-center max-w-[280px] bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-orange-500 to-gray-900",
          language === 'en' && "italic"
        )}>
          {t('identity.slogan')}
        </p>

        {/* Tags */}
        <div className="mt-6 flex gap-3 justify-center">
          <Tag variant="emerald" icon={Drama}>{t('identity.tag.mbti')}</Tag>
          <Tag variant="yellow" icon={Lightbulb}>{t('identity.tag.product')}</Tag>
          <Tag variant="rose" icon={PartyPopper}>{t('identity.tag.design')}</Tag>
        </div>

        {/* Contact Info Box */}
        <div className="mt-10 w-full bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-lg flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Email</p>
              <p className="text-sm font-semibold text-gray-800">zaizaiely@gmail.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">WeChat</p>
              <p className="text-xs text-gray-400">Scan QR code to add</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-sm">
              <Image src={qrcodeImage} alt="WeChat QR" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 w-full p-6 pb-8">
        <div className="border-t border-gray-300/30 pt-4 flex justify-between items-end">
          <div>
            <p className="text-sm font-bold text-gray-800">Zaizai Isle</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t('page.footer')}</p>
          </div>
          <p className="text-[10px] text-gray-400 font-mono">{today}</p>
        </div>
      </div>
    </div>
  );
}
