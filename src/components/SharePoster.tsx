"use client";

import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import avatarImage from "@/assets/avatar-v1.png";
import QRCode from "react-qr-code";
import { Mail, MessageCircle, Drama, Lightbulb, PartyPopper } from "lucide-react";

export function SharePoster() {
  const { t } = useLanguage();
  
  // Get current date for the footer
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      id="share-poster"
      className="w-[375px] h-[667px] bg-[#e5e5e7] relative flex flex-col items-center justify-between overflow-hidden text-black font-sans"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      {/* Decorative background elements from IdentityCard */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white/40 to-blue-50/20" />
        {/* Clouds */}
        <div className="absolute bottom-[-10%] left-[-10%] w-full h-1/2 opacity-60">
           <div className="absolute flex items-end left-[10%] bottom-0 scale-120 opacity-60">
             <div className="w-20 h-20 rounded-full translate-y-8 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] from-orange-200/40 via-orange-100/20 to-transparent border-orange-200/30" />
             <div className="w-32 h-32 rounded-full -ml-10 backdrop-blur-xl bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] z-10 from-orange-200/40 via-orange-100/20 to-transparent border-orange-200/30" />
             <div className="w-24 h-24 rounded-full -ml-12 translate-y-4 backdrop-blur-md bg-gradient-to-b border-t shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] from-orange-200/40 via-orange-100/20 to-transparent border-orange-200/30" />
           </div>
        </div>
        {/* Sparkles */}
        <div className="absolute top-[15%] left-[10%] w-5 h-5 text-orange-300 opacity-80">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
        </div>
        <div className="absolute top-[25%] right-[15%] w-4 h-4 text-blue-300 opacity-60">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full mt-16 px-8">
        {/* Avatar */}
        <div className="relative w-28 h-28 mb-6 group">
          <div className="w-full h-full rounded-full bg-white p-1 shadow-xl relative z-10">
            <Image 
              src={avatarImage} 
              alt="Avatar" 
              className="rounded-full w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name & Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wider">Zaizai Isle</h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide mb-6">
          {t('identity.role')}
        </p>

        {/* Description */}
        <p className="text-lg font-medium leading-relaxed text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-orange-500 to-gray-900 mb-8 px-4">
          {t('identity.description')}
        </p>

        {/* Tags */}
        <div className="flex justify-center gap-3 mb-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-[#0f1c36] text-emerald-50 border border-white/10 shadow-md">
            <Drama className="w-3.5 h-3.5 text-emerald-500" />
            <span>INFP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-[#281730] text-yellow-50 border border-white/10 shadow-md">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
            <span>Product</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-[#2d0e36] text-rose-50 border border-white/10 shadow-md">
            <PartyPopper className="w-3.5 h-3.5 text-rose-500" />
            <span>Design</span>
          </div>
        </div>

        {/* Contact Info Box */}
        <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-sm">
           {/* Email */}
           <div className="flex items-center gap-3 mb-4 text-gray-700">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
               <Mail className="w-4 h-4 text-gray-600" />
             </div>
             <span className="text-sm font-medium">zaizaiely@gmail.com</span>
           </div>
           
           {/* WeChat QR */}
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
               <MessageCircle className="w-4 h-4 text-green-600" />
             </div>
             <span className="text-sm font-medium">WeChat: Zaizai_Isle</span>
           </div>
        </div>
      </div>

      {/* Footer / Website QR Code */}
      <div className="flex items-center justify-between w-full px-8 py-6 bg-white/30 backdrop-blur-md border-t border-white/20 z-10 mt-auto">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 mb-1">Visit My Portfolio</span>
          <span className="text-[10px] text-gray-500">{today}</span>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <QRCode 
            value="https://zaizai-isle.github.io/zaizai-isle/" 
            size={60}
            fgColor="#1a1a1a"
          />
        </div>
      </div>
    </div>
  );
}
