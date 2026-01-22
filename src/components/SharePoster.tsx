"use client";

import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import avatarImage from "@/assets/avatar-v1.png";
import QRCode from "react-qr-code";

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
      className="w-[375px] h-[667px] bg-[#e5e5e7] relative flex flex-col items-center justify-between p-8 overflow-hidden text-black font-sans"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20px] left-[-20px] w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full mt-10">
        {/* Avatar */}
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-lg opacity-50 transform scale-105" />
          <Image 
            src={avatarImage} 
            alt="Avatar" 
            className="rounded-full border-4 border-white shadow-xl relative z-10 w-full h-full object-cover"
          />
        </div>

        {/* Name & Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Zaizai Isle</h1>
        <p className="text-gray-600 text-sm font-medium tracking-wide uppercase">
          {t('identity.role')}
        </p>

        {/* Bio/Description Box */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm w-full text-center">
          <p className="text-gray-700 text-sm leading-relaxed">
            {t('identity.description')}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">Next.js</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">React</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md">AI</span>
          </div>
        </div>
      </div>

      {/* Footer / QR Code */}
      <div className="flex flex-col items-center z-10 mb-8 w-full">
        <div className="bg-white p-3 rounded-xl shadow-lg mb-4">
          <QRCode 
            value="https://zaizai-isle.github.io/zaizai-isle/" 
            size={100}
            fgColor="#1a1a1a"
          />
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">{t('page.footer')}</p>
        <p className="text-[10px] text-gray-400">{today}</p>
      </div>
    </div>
  );
}
