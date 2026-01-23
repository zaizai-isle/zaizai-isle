"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

const translations: Translations = {
  // Identity Card
  'identity.name': { zh: '再再', en: 'Zaizaiely' },
  'identity.role': { zh: 'AI 产品设计师 · 项目经理', en: 'AI Product Designer · PM' },
  'identity.slogan': { zh: '再做一点，再想一点，惊喜总在发生', en: 'Build more, think more, find the spark.' },
  'identity.tag.mbti': { zh: 'INFP', en: 'INFP' },
  'identity.tag.product': { zh: '产品', en: 'Product' },
  'identity.tag.design': { zh: '设计', en: 'Design' },

  // Weather Card
  'weather.locating': { zh: '定位中...', en: 'Locating...' },
  'weather.cloudy': { zh: '多云', en: 'Cloudy' },
  'weather.sunny': { zh: '晴朗', en: 'Sunny' },
  'weather.rainy': { zh: '下雨', en: 'Rainy' },
  'weather.snowy': { zh: '下雪', en: 'Snowy' },
  'weather.thunderstorm': { zh: '雷雨', en: 'Thunderstorm' },
  'weather.foggy': { zh: '有雾', en: 'Foggy' },
  'weather.drizzle': { zh: '毛毛雨', en: 'Drizzle' },
  'weather.feels_like': { zh: '体感', en: 'Feels like' },
  'weather.humidity': { zh: '湿度', en: 'Humidity' },
  'weather.wind': { zh: '风速', en: 'Wind' },
  'weather.shanghai': { zh: '上海', en: 'Shanghai' },
  'weather.high': { zh: '最高', en: 'H' },
  'weather.low': { zh: '最低', en: 'L' },

  // Stats Card
  'stats.downloads': { zh: '总下载量', en: 'Total Downloads' },
  'stats.click_to_download': { zh: '点击下载卡片', en: 'Click to download card' },

  // Social Card
  'social.connect': { zh: '与我联系', en: "Contact Me" },
  'social.profile': { zh: '个人主页', en: 'Profile' },
  'social.wechat': { zh: '微信', en: 'WeChat' },
  'social.email': { zh: '邮箱', en: 'Email' },
  'social.github': { zh: 'GitHub', en: 'GitHub' },
  'social.email.copied': { zh: '邮箱已复制', en: 'Email copied' },

  // Guestbook Card
  'guestbook.title': { zh: '留言板', en: 'Guestbook' },
  'guestbook.placeholder': { zh: '打个招呼...', en: 'Say hi...' },
  'guestbook.send': { zh: '发送', en: 'Send' },

  // Page
  'page.contact': { zh: '联系我 ↗', en: 'Contact Me ↗' },
  'page.works.title': { zh: '精选作品', en: 'Selected Works' },
  'page.works.desc': { zh: '探索我最新的 AI 产品设计', en: 'Explore my latest AI product designs' },
  'page.works.view': { zh: '查看作品集', en: 'View Portfolio' },
  'page.footer': { zh: '© 2026 再再🏝️. 保留所有权利。', en: '© 2026 Zaizaiely. Stay still, stay curious.🏝️ All rights reserved.' },

  // Background Settings
  'bg.settings': { zh: '背景设置', en: 'Background Settings' },
  'bg.default': { zh: '默认', en: 'Default' },
  'bg.color': { zh: '纯色', en: 'Color' },
  'bg.image': { zh: '图片', en: 'Image' },
  'bg.upload': { zh: '上传图片', en: 'Upload Image' },
  'bg.reset': { zh: '重置', en: 'Reset' },

  // Tools Card
  'tools.title': { zh: '常用工具栏', en: 'Tools Dashboard' },
  'tools.compressor.title': { zh: '图片压缩', en: 'Image Compressor' },
  'tools.compressor.drop': { zh: '点击上传图片', en: 'click to upload' },
  'tools.compressor.compressing': { zh: '压缩中...', en: 'Compressing...' },
  'tools.compressor.download': { zh: '下载', en: 'Download' },
  'tools.compressor.original': { zh: '原始大小', en: 'Original' },
  'tools.compressor.compressed': { zh: '压缩后', en: 'Compressed' },
  'tools.compressor.reset': { zh: '重新上传', en: 'Upload New' },
  'tools.ai.title': { zh: 'AI 工具箱', en: 'AI Hub' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
