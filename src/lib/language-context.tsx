"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode, useEffect } from 'react';

type Language = 'zh' | 'en';

const translations: Record<string, string> = {
  'identity.name': '再再',
  'identity.role': '岛屿架构师 · 逻辑观察者',
  'identity.slogan': '再做一点，再想一点，惊喜总在发生',
  'identity.tag.mbti': 'INFP',
  'identity.tag.product': '产品',
  'identity.tag.design': '设计',
  'weather.locating': '定位中...',
  'weather.cloudy': '多云',
  'weather.sunny': '晴朗',
  'weather.rainy': '下雨',
  'weather.snowy': '下雪',
  'weather.thunderstorm': '雷雨',
  'weather.foggy': '有雾',
  'weather.drizzle': '毛毛雨',
  'weather.overcast': '阴天',
  'weather.few_clouds': '晴间少云',
  'weather.windy': '大风',
  'weather.feels_like': '体感',
  'weather.humidity': '湿度',
  'weather.wind': '风速',
  'weather.shanghai': '上海',
  'weather.unavailable': '天气暂不可用',
  'weather.high': '最高',
  'weather.low': '最低',
  'weather.partly_cloudy': '晴间多云',
  'weather.mist': '薄雾',
  'weather.haze': '霾',
  'weather.sand': '扬沙',
  'weather.sandstorm': '沙尘暴',
  'weather.heavy_sandstorm': '强沙尘暴',
  'weather.freezing_fog': '冻雾',
  'weather.light_drizzle': '毛毛雨（轻）',
  'weather.moderate_drizzle': '毛毛雨（中）',
  'weather.heavy_drizzle': '毛毛雨（浓）',
  'weather.light_freezing_drizzle': '冻毛毛雨（轻）',
  'weather.heavy_freezing_drizzle': '冻毛毛雨（浓）',
  'weather.light_rain': '小雨',
  'weather.moderate_rain': '中雨',
  'weather.heavy_rain': '大雨',
  'weather.light_freezing_rain': '冻雨（轻）',
  'weather.heavy_freezing_rain': '冻雨（浓）',
  'weather.light_shower_rain': '阵雨（轻）',
  'weather.moderate_shower_rain': '阵雨（中）',
  'weather.heavy_shower_rain': '阵雨（浓）',
  'weather.light_snow': '小雪',
  'weather.moderate_snow': '中雪',
  'weather.heavy_snow': '大雪',
  'weather.snow_grains': '雪粒',
  'weather.light_shower_snow': '阵雪（轻）',
  'weather.heavy_shower_snow': '阵雪（浓）',
  'weather.thunderstorm_with_light_hail': '雷暴伴冰雹（轻）',
  'weather.thunderstorm_with_heavy_hail': '雷暴伴冰雹（浓）',
  'stats.downloads': '节点导出',
  'stats.visitors': '登岛访客',
  'stats.click_to_download': '导出节点痕迹',
  'social.connect': '与我联系',
  'social.profile': '个人主页',
  'social.wechat': '微信',
  'social.email': '邮箱',
  'social.github': 'GitHub',
  'social.email.copied': '邮箱已复制',
  'social.like.thanks': '感谢喜欢',
  'guestbook.title': '岛屿沉积',
  'guestbook.placeholder': '打个招呼...',
  'guestbook.send': '发送',
  'page.contact': '联系我 ↗',
  'page.works.title': '已建成结构',
  'page.works.desc': '对岛屿节点的物理扩张与逻辑延伸。',
  'page.works.view': '进入节点',
  'page.works.docs': '打开岛屿文档',
  'page.works.preview': '预览',
  'page.works.close': '关闭预览',
  'page.works.status.stable': '稳定',
  'page.works.status.experimental': '实验中',
  'page.works.status.archived': '已归档',
  'page.works.kind.tool': '岛屿工具',
  'page.works.kind.experiment': '侧岛实验',
  'page.works.kind.external': '外部结构',
  'page.works.structure.achievement.desc': '为一次真实的人生抵达盖下印章。',
  'page.works.structure.banana.desc': '把任意图像转化为带有分析报告的香蕉化实验。',
  'page.footer': '© 2026 再再🏝️. 保留所有权利。',
  'bg.settings': '背景设置',
  'bg.default': '默认',
  'bg.color': '纯色',
  'bg.image': '图片',
  'bg.upload': '上传图片',
  'bg.reset': '重置',
  'tools.title': '常用工具栏',
  'tools.compressor.title': '图片压缩',
  'tools.compressor.drop': '点击上传图片',
  'tools.compressor.compressing': '压缩中...',
  'tools.compressor.download': '下载',
  'tools.compressor.original': '原始大小',
  'tools.compressor.compressed': '压缩后',
  'tools.compressor.reset': '重新上传',
  'tools.compressor.back': '返回小岛',
  'tools.compressor.privacy': '图片只在当前浏览器中处理，用于快速减小文件体积，不上传到岛屿服务器。',
  'tools.ai.eyebrow': '岛主常用工具',
  'tools.ai.title': '工具箱',
  'tools.ai.subtitle': '日常创作、思考与交付中反复使用的工具。',
  'tools.ai.new_tab': '在新标签页打开',
  'learning.card.eyebrow': '每日学习',
  'learning.card.question': '今天的问题',
  'learning.card.action': '打开今日内容',
  'tech.title': '生态岩层',
  'tech.subtitle': '潜藏于静默海底，构筑岛屿底层的技术逻辑',
  'env.title': '岛屿气候',
  'env.content': '正在这片数字海域中搜寻清晰的叙事频率。气候微调已启动，以确保每一个交互瞬间都足够通透、足够深邃。',
  'core.title': '岛屿脉动',
  'core.subtitle': '实时捕捉整座岛屿的生命律动与环境回响',
  'env.mood': '◌ 气候节律检测中',
  'env.sync': '共振率 100%',
  'core.component.cognitive': '系统逻辑',
  'core.component.interface': '交互界面',
  'core.component.storage': '数据底座',
  'core.status.online': '良好',
  'core.status.syncing': '活跃',
  'core.status.static': '就绪',
  'status.system': '系统状态',
  'status.online': '在线',
  'status.modules': '活跃模块',
  'status.active': '已激活',
  'status.kernel': '系统内核',
  'build.title': '岛屿建造进度',
  'build.subtitle': '记录岛屿的生长痕迹，观测每一个模块的构筑进程',
  'build.status.live': '已上线',
  'build.status.building': '构建中',
  'build.status.changed': '新成员',
  'build.core_build': '构建面板',
  'build.current.theme': 'LIVING STATE',
  'build.current.summary': '主岛正在重新校准内容层级，让真实状态取代模拟活跃。',
  'build.sequence.label': 'V1.5 建设序列',
  'build.current.forming_label': '正在形成',
  'build.current.forming': 'Living State 校准',
  'build.current.stabilizing_label': '稳定化中',
  'build.current.stabilizing': '人生护照 · 云端记忆',
  'build.last_pulse': '最近建设脉冲',
  'build.what_is_built': '正在构建',
  'build.footer_note': '这座岛屿随构筑而生长',
  'build.module.identity': '身份锚点',
  'build.module.weather': '气候节律',
  'build.module.stats': '节点追踪',
  'build.module.works': '已建成结构',
  'build.module.sifter': '图片压缩',
  'build.module.inspiration': '灵感罗盘',
  'build.module.deposits': '岛屿沉积',
  'build.module.daily': '小岛日签',
  'build.module.passport_cloud': '人生护照 · 云端记忆',
  'build.module.kernel': '内核协议',
  'build.status.active': '运行中',
  'build.status.stable': '稳定',
  'build.status.ready': '就绪',
  'build.status.sync': '同步',
  'build.status.forming': '构建中',
  'build.status.stabilizing': '稳定化中',
  'build.group.running': '运行中',
  'build.group.steady': '稳定/就绪',
  'build.group.building': '构建中',
  'build.group.steady_status': '稳定',
  'build.group.empty': '暂无模块',
  'build.timeline.stage_label': '当前阶段',
  'build.timeline.stage_value': '真实状态校准',
  'build.timeline.summary': '只呈现真实运行、稳定保留和正在形成的部分。',
  'build.timeline.progress_label': '里程碑完成率',
  'build.timeline.scroll_hint': '向下滚动查看全部里程碑',
  'build.timeline.next_label': '下一里程碑',
  'build.timeline.next_hint': '下一步：',
  'build.timeline.note.identity': '建立身份锚点，统一岛屿的叙事入口。',
  'build.timeline.note.weather': '接入气候逻辑，让环境状态具备实时反馈。',
  'build.timeline.note.stats': '补齐节点追踪，形成可观测的增长记录。',
  'build.timeline.note.works': '已建成结构整理为稳定展示层。',
  'build.timeline.note.sifter': '图片压缩模块上线，降低资产传输成本。',
  'build.timeline.note.inspiration': '灵感罗盘接入，增强探索与生成能力。',
  'build.timeline.note.deposits': '沉积区同步完成，支持内容留存与回看。',
  'build.timeline.note.kernel': '内核协议正在收敛，准备承载下一轮扩展。',
  'build.timeline.next.identity': '补充多角色身份切换能力。',
  'build.timeline.next.weather': '引入更多环境变量与异常态反馈。',
  'build.timeline.next.stats': '增加跨模块关联指标。',
  'build.timeline.next.works': '结构超过 6 个后再引入主题筛选。',
  'build.timeline.next.sifter': '支持批量任务与策略预设。',
  'build.timeline.next.inspiration': '加入提示词历史与复用机制。',
  'build.timeline.next.deposits': '完善沉积内容的索引与检索。',
  'build.timeline.next.kernel': '完成模块接口规范，开放下一批能力接入。',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

let englishDictionaryPromise: Promise<Record<string, string>> | undefined;

const loadEnglishDictionary = () => {
  englishDictionaryPromise ??= import('./translations/en').then((module) => module.default);
  return englishDictionaryPromise;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');
  const [englishTranslations, setEnglishTranslations] = useState<Record<string, string> | null>(null);
  const skipFirstSaveRef = useRef(true);

  useEffect(() => {
    let alive = true;
    try {
      const savedLang = localStorage.getItem('language') as Language | null;
      if (savedLang === 'en') {
        void loadEnglishDictionary().then((dictionary) => {
          if (!alive) return;
          setEnglishTranslations(dictionary);
          setLanguage('en');
        });
      }
    } catch { }
    return () => {
      alive = false;
    };
  }, []);

  // Save language preference
  useEffect(() => {
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem('language', language);
    } catch { }
  }, [language]);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    if (nextLanguage === 'zh') {
      setLanguage('zh');
      return;
    }

    void loadEnglishDictionary().then((dictionary) => {
      setEnglishTranslations(dictionary);
      setLanguage('en');
    });
  }, []);

  const t = useCallback((key: string) => {
    if (language === 'en') return englishTranslations?.[key] || translations[key] || key;
    return translations[key] || key;
  }, [englishTranslations, language]);

  const value = useMemo(
    () => ({ language, setLanguage: changeLanguage, t }),
    [changeLanguage, language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
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
