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
  'identity.role': { zh: '岛屿架构师 · 逻辑观察者', en: 'Isle Architect · Logic Observer' },
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
  'weather.unavailable': { zh: '天气暂不可用', en: 'Weather unavailable' },
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
  'stats.downloads': { zh: '节点导出', en: 'Node Exports' },
  'stats.visitors': { zh: '登岛访客', en: 'Isle Arrivals' },
  'stats.click_to_download': { zh: '导出节点痕迹', en: 'Export Node Trace' },

  // Social Card
  'social.connect': { zh: '与我联系', en: "Contact Me" },
  'social.profile': { zh: '个人主页', en: 'Profile' },
  'social.wechat': { zh: '微信', en: 'WeChat' },
  'social.email': { zh: '邮箱', en: 'Email' },
  'social.github': { zh: 'GitHub', en: 'GitHub' },
  'social.email.copied': { zh: '邮箱已复制', en: 'Email copied' },
  'social.like.thanks': { zh: '感谢喜欢', en: 'Thanks for liking' },

  // Guestbook Card
  'guestbook.title': { zh: '岛屿沉积', en: 'Isle Deposits' },
  'guestbook.placeholder': { zh: '打个招呼...', en: 'Say hi...' },
  'guestbook.send': { zh: '发送', en: 'Send' },

  // Page
  'page.contact': { zh: '联系我 ↗', en: 'Contact Me ↗' },
  'page.works.title': { zh: '已建成结构', en: 'Built Structures' },
  'page.works.desc': { zh: '对岛屿节点的物理扩张与逻辑延伸。', en: 'Physical expansions and logical extensions of the node.' },
  'page.works.view': { zh: '进入节点', en: 'Enter Node' },
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
  'tools.ai.title': { zh: '灵感罗盘', en: 'Inspiration Compass' },
  'activity.title': { zh: '岛屿回响', en: 'Isle Echoes' },
  'tech.title': { zh: '生态岩层', en: 'Tech Strata' },
  'tech.subtitle': { zh: '潜藏于静默海底，构筑岛屿底层的技术逻辑', en: 'Underlying logic hidden deep beneath the silent sea' },
  'env.title': { zh: '岛屿气候', en: 'Climate Logic' },
  'env.content': { zh: '正在这片数字海域中搜寻清晰的叙事频率。气候微调已启动，以确保每一个交互瞬间都足够通透、足够深邃。', en: 'Scanning for narrative clarity in the digital sea. Climate adjustments active: prioritize transparency and depth.' },
  'core.title': { zh: '岛屿脉动', en: 'Island Pulse' },
  'core.subtitle': { zh: '实时捕捉整座岛屿的生命律动与环境回响', en: 'Capturing the life rhythm and environmental echoes of the island' },
  'env.mood': { zh: '◌ 气候节律检测中', en: '◌ Isle Mood Detected' },
  'env.sync': { zh: '共振率 100%', en: 'Resonating 100%' },

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

  // Build Card
  'build.title': { zh: '岛屿建造进度', en: 'Island Building Progress' },
  'build.subtitle': { zh: '记录岛屿的生长痕迹，观测每一个模块的构筑进程', en: 'Documenting island growth and observing module evolution' },
  'build.status.live': { zh: '已上线', en: 'Live' },
  'build.status.building': { zh: '构建中', en: 'In Dev' },
  'build.status.changed': { zh: '新成员', en: 'Newly' },
  'build.core_build': { zh: '构建面板', en: 'CORE BUILD' },
  'build.what_is_built': { zh: '正在构建', en: 'What is being built' },
  'build.footer_note': { zh: '这座岛屿随构筑而生长', en: 'This island grows by build' },
  'build.module.identity': { zh: '身份锚点', en: 'Identity Anchor' },
  'build.module.weather': { zh: '气候节律', en: 'Climate Logic' },
  'build.module.stats': { zh: '节点追踪', en: 'Node Traces' },
  'build.module.works': { zh: '已建成结构', en: 'Built Structures' },
  'build.module.sifter': { zh: '图片压缩', en: 'Image Compressor' },
  'build.module.inspiration': { zh: '灵感罗盘', en: 'AI Inspiration' },
  'build.module.deposits': { zh: '岛屿沉积', en: 'Isle Deposits' },
  'build.module.kernel': { zh: '内核协议', en: 'Core Kernel' },
  'build.status.active': { zh: '运行中', en: 'ACTIVE' },
  'build.status.stable': { zh: '稳定', en: 'STABLE' },
  'build.status.ready': { zh: '就绪', en: 'READY' },
  'build.status.sync': { zh: '同步', en: 'SYNC' },
  'build.status.forming': { zh: '构建中', en: 'FORMING' },
  'build.group.running': { zh: '运行中', en: 'Running' },
  'build.group.steady': { zh: '稳定/就绪', en: 'Stable/Ready' },
  'build.group.building': { zh: '构建中', en: 'Building' },
  'build.group.steady_status': { zh: '稳定', en: 'STABLE' },
  'build.group.empty': { zh: '暂无模块', en: 'No modules yet' },
  'build.timeline.stage_label': { zh: '当前阶段', en: 'Current Stage' },
  'build.timeline.stage_value': { zh: '系统稳定化', en: 'System Stabilization' },
  'build.timeline.summary': { zh: '沿着时间线推进核心能力，先保证稳定，再扩展叙事层。', en: 'Core capabilities are shipped in sequence: stabilize first, then expand the narrative layer.' },
  'build.timeline.progress_label': { zh: '里程碑完成率', en: 'Milestone Completion' },
  'build.timeline.scroll_hint': { zh: '向下滚动查看全部里程碑', en: 'Scroll to view all milestones' },
  'build.timeline.next_label': { zh: '下一里程碑', en: 'Next Milestone' },
  'build.timeline.next_hint': { zh: '下一步：', en: 'Next:' },
  'build.timeline.note.identity': { zh: '建立身份锚点，统一岛屿的叙事入口。', en: 'Established the identity anchor to unify the narrative entry point.' },
  'build.timeline.note.weather': { zh: '接入气候逻辑，让环境状态具备实时反馈。', en: 'Integrated climate logic so the environment can respond in real time.' },
  'build.timeline.note.stats': { zh: '补齐节点追踪，形成可观测的增长记录。', en: 'Completed node tracing to make growth observable.' },
  'build.timeline.note.works': { zh: '已建成结构整理为稳定展示层。', en: 'Built structures were stabilized into a reliable showcase layer.' },
  'build.timeline.note.sifter': { zh: '图片压缩模块上线，降低资产传输成本。', en: 'Image compressor is live to reduce asset delivery cost.' },
  'build.timeline.note.inspiration': { zh: '灵感罗盘接入，增强探索与生成能力。', en: 'Inspiration compass is integrated for better exploration and generation.' },
  'build.timeline.note.deposits': { zh: '沉积区同步完成，支持内容留存与回看。', en: 'Deposits flow is synced to support retention and replay.' },
  'build.timeline.note.kernel': { zh: '内核协议正在收敛，准备承载下一轮扩展。', en: 'Kernel protocol is converging to support the next expansion cycle.' },
  'build.timeline.next.identity': { zh: '补充多角色身份切换能力。', en: 'Add multi-role identity switching.' },
  'build.timeline.next.weather': { zh: '引入更多环境变量与异常态反馈。', en: 'Introduce richer signals and anomaly feedback.' },
  'build.timeline.next.stats': { zh: '增加跨模块关联指标。', en: 'Add cross-module correlation metrics.' },
  'build.timeline.next.works': { zh: '接入按主题的结构筛选。', en: 'Enable themed filtering for built structures.' },
  'build.timeline.next.sifter': { zh: '支持批量任务与策略预设。', en: 'Support batch jobs and strategy presets.' },
  'build.timeline.next.inspiration': { zh: '加入提示词历史与复用机制。', en: 'Add prompt history and reuse workflows.' },
  'build.timeline.next.deposits': { zh: '完善沉积内容的索引与检索。', en: 'Improve indexing and retrieval for deposits.' },
  'build.timeline.next.kernel': { zh: '完成模块接口规范，开放下一批能力接入。', en: 'Finalize module interfaces and unlock the next capability batch.' },
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
