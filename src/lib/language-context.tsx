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
  'weather.overcast': { zh: '阴天', en: 'Overcast' },
  'weather.few_clouds': { zh: '晴间少云', en: 'Few Clouds' },
  'weather.windy': { zh: '大风', en: 'Windy' },
  'weather.feels_like': { zh: '体感', en: 'Feels like' },
  'weather.humidity': { zh: '湿度', en: 'Humidity' },
  'weather.wind': { zh: '风速', en: 'Wind' },
  'weather.shanghai': { zh: '上海', en: 'Shanghai' },
  'weather.high': { zh: '最高', en: 'H' },
  'weather.low': { zh: '最低', en: 'L' },
  'weather.partly_cloudy': { zh: '晴间多云', en: 'Partly Cloudy' },
  'weather.mist': { zh: '薄雾', en: 'Mist' },
  'weather.haze': { zh: '霾', en: 'Haze' },
  'weather.sand': { zh: '扬沙', en: 'Sand' },
  'weather.sandstorm': { zh: '沙尘暴', en: 'Sandstorm' },
  'weather.heavy_sandstorm': { zh: '强沙尘暴', en: 'Heavy Sandstorm' },
  'weather.freezing_fog': { zh: '冻雾', en: 'Freezing Fog' },
  'weather.light_drizzle': { zh: '毛毛雨（轻）', en: 'Light Drizzle' },
  'weather.moderate_drizzle': { zh: '毛毛雨（中）', en: 'Moderate Drizzle' },
  'weather.heavy_drizzle': { zh: '毛毛雨（浓）', en: 'Heavy Drizzle' },
  'weather.light_freezing_drizzle': { zh: '冻毛毛雨（轻）', en: 'Light Freezing Drizzle' },
  'weather.heavy_freezing_drizzle': { zh: '冻毛毛雨（浓）', en: 'Heavy Freezing Drizzle' },
  'weather.light_rain': { zh: '小雨', en: 'Light Rain' },
  'weather.moderate_rain': { zh: '中雨', en: 'Moderate Rain' },
  'weather.heavy_rain': { zh: '大雨', en: 'Heavy Rain' },
  'weather.light_freezing_rain': { zh: '冻雨（轻）', en: 'Light Freezing Rain' },
  'weather.heavy_freezing_rain': { zh: '冻雨（浓）', en: 'Heavy Freezing Rain' },
  'weather.light_shower_rain': { zh: '阵雨（轻）', en: 'Light Shower Rain' },
  'weather.moderate_shower_rain': { zh: '阵雨（中）', en: 'Moderate Shower Rain' },
  'weather.heavy_shower_rain': { zh: '阵雨（浓）', en: 'Heavy Shower Rain' },
  'weather.light_snow': { zh: '小雪', en: 'Light Snow' },
  'weather.moderate_snow': { zh: '中雪', en: 'Moderate Snow' },
  'weather.heavy_snow': { zh: '大雪', en: 'Heavy Snow' },
  'weather.snow_grains': { zh: '雪粒', en: 'Snow Grains' },
  'weather.light_shower_snow': { zh: '阵雪（轻）', en: 'Light Shower Snow' },
  'weather.heavy_shower_snow': { zh: '阵雪（浓）', en: 'Heavy Shower Snow' },
  'weather.thunderstorm_with_light_hail': { zh: '雷暴伴冰雹（轻）', en: 'Thunderstorm with Light Hail' },
  'weather.thunderstorm_with_heavy_hail': { zh: '雷暴伴冰雹（浓）', en: 'Thunderstorm with Heavy Hail' },

  // Stats Card
  'stats.downloads': { zh: '岛屿信物', en: 'Isle Tokens' },
  'stats.visitors': { zh: '登岛访客', en: 'Isle Arrivals' },
  'stats.click_to_download': { zh: '点击下载卡片', en: 'Click to download card' },

  // Social Card
  'social.connect': { zh: '与我联系', en: "Contact Me" },
  'social.profile': { zh: '个人主页', en: 'Profile' },
  'social.wechat': { zh: '微信', en: 'WeChat' },
  'social.email': { zh: '邮箱', en: 'Email' },
  'social.github': { zh: 'GitHub', en: 'GitHub' },
  'social.email.copied': { zh: '邮箱已复制', en: 'Email copied' },
  'social.like.thanks': { zh: '感谢喜欢', en: 'Thanks for liking' },

  // Guestbook Card
  'guestbook.title': { zh: '漂流瓶', en: 'Drift Bottles' },
  'guestbook.placeholder': { zh: '打个招呼...', en: 'Say hi...' },
  'guestbook.send': { zh: '发送', en: 'Send' },

  // Page
  'page.contact': { zh: '联系我 ↗', en: 'Contact Me ↗' },
  'page.works.title': { zh: '岛屿记录', en: 'Isle Records' },
  'page.works.desc': { zh: '岛屿生长过程中的一些交互实验与视觉切片', en: 'Interactive experiments and visual slices from the island' },
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
  'tools.compressor.title': { zh: '视觉筛滤', en: 'Visual Sifter' },
  'tools.compressor.drop': { zh: '点击上传图片', en: 'click to upload' },
  'tools.compressor.compressing': { zh: '压缩中...', en: 'Compressing...' },
  'tools.compressor.download': { zh: '下载', en: 'Download' },
  'tools.compressor.original': { zh: '原始大小', en: 'Original' },
  'tools.compressor.compressed': { zh: '压缩后', en: 'Compressed' },
  'tools.compressor.reset': { zh: '重新上传', en: 'Upload New' },
  'tools.ai.title': { zh: '灵感罗盘', en: 'Inspiration Compass' },
  'activity.title': { zh: '岛屿回响', en: 'Isle Echoes' },
  'tech.title': { zh: '生态岩层', en: 'Tech Strata' },
  'tech.subtitle': { zh: '潜藏于静默海底，构筑岛屿底层的技术逻辑', en: 'Underlying logic hidden deep beneath the silent sea' },
  'env.title': { zh: '岛屿气候', en: 'Climate Logic' },
  'env.content': { zh: '正在这片数字海域中搜寻清晰的叙事频率。气候微调已启动，以确保每一个交互瞬间都足够通透、足够深邃。', en: 'Scanning for narrative clarity in the digital sea. Climate adjustments active: prioritize transparency and depth.' },
  'core.title': { zh: '岛屿脉动', en: 'Island Pulse' },
  'core.subtitle': { zh: '实时捕捉整座岛屿的生命律动与环境回响', en: 'Capturing the life rhythm and environmental echoes of the island' },
  'env.mood': { zh: '◌  岛屿观测中', en: '◌  Observing Isle' },
  'env.sync': { zh: '同步率 100%', en: 'Sync 100%' },

  // Bedrock Logic - Grounded terms
  'core.component.cognitive': { zh: '系统逻辑', en: 'System Logic' },
  'core.component.interface': { zh: '交互界面', en: 'User Interface' },
  'core.component.storage': { zh: '数据底座', en: 'Data Base' },
  'core.status.online': { zh: '良好', en: 'Stable' },
  'core.status.syncing': { zh: '活跃', en: 'Active' },
  'core.status.static': { zh: '就绪', en: 'Ready' },

  // Echoes Narrative
  'activity.stable': { zh: '稳定', en: 'Stable' },
  'activity.log.visitor': { zh: '观测到一名访客登岛。', en: 'A new visitor has arrived on the isle.' },
  'activity.log.logic': { zh: '深层逻辑模块完成了一次自愈。', en: 'Deep logic module performed a self-healing.' },
  'activity.log.env_sync': { zh: '环境气候已根据现实维度自动同步。', en: 'Climate synchronized with reality dimensions.' },
  'activity.log.drift': { zh: '一封漂流瓶被推向叙事公海。', en: 'A drift bottle pushed to the narrative sea.' },
  'activity.log.kernel': { zh: '内核同步完成', en: 'Kernel synchronization complete' },

  'status.system': { zh: '系统状态', en: 'System' },
  'status.online': { zh: '在线', en: 'Online' },
  'status.modules': { zh: '活跃模块', en: 'Modules' },
  'status.active': { zh: '已激活', en: 'Active' },
  'status.kernel': { zh: '系统内核', en: 'Kernel' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    let alive = true;
    try {
      const savedLang = localStorage.getItem('language') as Language | null;
      if ((savedLang === 'zh' || savedLang === 'en') && alive) {
        setTimeout(() => setLanguage(savedLang as Language), 0);
      }
    } catch { }
    return () => {
      alive = false;
    };
  }, []);

  // Save language preference
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch { }
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
