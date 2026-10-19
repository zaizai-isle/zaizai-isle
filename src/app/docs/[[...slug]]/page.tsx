import fs from 'fs';
import path from 'path';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TOCNav } from '@/components/docs/TOCNav';

interface Props {
  params: Promise<{ slug?: string[] }>;
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface MilestoneDefinition {
  key: string;
  label: string;
  date: string;
  summary: string;
  href?: string;
  file?: string;
}

const milestoneDefinitions: MilestoneDefinition[] = [
  {
    key: 'prd/PRD-ACTIVE.md',
    label: 'V1.5 · 形成中',
    date: '2026-10-14',
    summary: '统一真实状态来源，重新编辑首页层级，并继续厘清个人数字空间的内容与表达方式。',
    href: '/docs/prd/PRD-ACTIVE',
    file: 'prd/PRD-ACTIVE.md',
  },
  {
    key: 'history/PRODUCT_V1.4.5_Reconstructed.md',
    label: 'V1.4.5',
    date: '2026-10-13',
    summary: '优化首页加载路径：拆分首屏与视口加载，延后非关键交互和分析脚本，并缩小首页初始资源负担。',
    href: '/docs/history/PRODUCT_V1.4.5_Reconstructed',
    file: 'history/PRODUCT_V1.4.5_Reconstructed.md',
  },
  {
    key: 'history/PRODUCT_V1.4.2_Reconstructed.md',
    label: 'V1.4.2',
    date: '2026-08-12',
    summary: '扩展人生护照主题与成就库，重做手绘表单、字体和章印体系，并统一界面与 9:16 导出海报的视觉语言。',
    href: '/docs/history/PRODUCT_V1.4.2_Reconstructed',
    file: 'history/PRODUCT_V1.4.2_Reconstructed.md',
  },
  {
    key: 'history/PRODUCT_V1.4.1_Reconstructed.md',
    label: 'V1.4.1',
    date: '2026-08-10',
    summary: '人生护照收敛为三步流程并新增自适应纸张；Banana 增加 Supabase Edge Function 与 Replicate 代理代码。',
    href: '/docs/history/PRODUCT_V1.4.1_Reconstructed',
    file: 'history/PRODUCT_V1.4.1_Reconstructed.md',
  },
  {
    key: 'history/PRODUCT_V1.4.0_Reconstructed.md',
    label: 'V1.4.0',
    date: '2026-08-07',
    summary: 'Built Structures 注册表成型，新增人生护照与小岛日签，并校准移动导航、文档索引和发布链路。',
    href: '/docs/history/PRODUCT_V1.4.0_Reconstructed',
    file: 'history/PRODUCT_V1.4.0_Reconstructed.md',
  },
  {
    key: 'history/PRODUCT_V1.3.0_Reconstructed.md',
    label: 'V1.3.0',
    date: '2026-07-16',
    summary: '维护记忆成型，新增发布检查、资产生成说明与版本升级规划。',
    href: '/docs/history/PRODUCT_V1.3.0_Reconstructed',
    file: 'history/PRODUCT_V1.3.0_Reconstructed.md',
  },
  {
    key: 'V1.2.9',
    label: 'V1.2.9',
    date: '2026-06-04',
    summary: '资产静默减重，推进 WebP 迁移与天气图标静态加载，归档旧版内联天气图标 Map。',
  },
  {
    key: 'V1.2.8',
    label: 'V1.2.8',
    date: '2026-02-27',
    summary: '完成性能精密校准与 12 列栅格重构。',
  },
  {
    key: 'history/PRODUCT_V1.2.0_Original.md',
    label: 'V1.2.0',
    date: '2026-01-23',
    summary: '个人数字小岛的 Experience 气质与基础产品方向成型。',
    href: '/docs/history/PRODUCT_V1.2.0_Original',
    file: 'history/PRODUCT_V1.2.0_Original.md',
  },
  {
    key: 'V1.0.0',
    label: 'V1.0.0',
    date: '日期待考证',
    summary: '岛屿浮出水面的那一刻。',
  },
];

const slugify = (text: string) => text
  .toLowerCase()
  .trim()
  .replace(/[^\w\s\u4e00-\u9fa5-]+/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '');

const removeNestedMilestones = (content: string) => content.replace(
  /\n## 6\. 生长足迹 \(Growth Milestones\)[\s\S]*?(?=\n---\n\n\*\*Document Status\*\*)/,
  '',
);

const prepareDisplayContent = (content: string, isHistorical = false) => {
  const withoutNestedMilestones = isHistorical ? removeNestedMilestones(content) : content;

  return withoutNestedMilestones
    .split('\n')
    .filter((line) => line.trim() !== '---')
    .map((line) => line.match(/^#{1,3}\s/)
      ? line.replace(/\s*[（(][^）)]*[A-Za-z]{2,}[^）)]*[）)]\s*$/, '')
      : line)
    .join('\n');
};

const extractHeadings = (content: string): Heading[] => content
  .split('\n')
  .filter((line) => line.match(/^#{1,3}\s/))
  .map((line) => {
    const level = line.match(/^#+/)?.[0].length || 0;
    const text = line.replace(/^#+\s/, '');
    return { level, text, id: slugify(text) };
  });

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'docs');
  const files: string[] = [];

  function getFiles(dir: string, base = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(base, item);
      if (fs.statSync(fullPath).isDirectory()) {
        getFiles(fullPath, relativePath);
      } else if (item.endsWith('.md')) {
        files.push(relativePath);
      }
    });
  }

  if (fs.existsSync(docsDir)) {
    getFiles(docsDir);
  }

  // Generate paths for all MD files, plus the base /docs path
  const params = files.map(file => ({
    slug: file.replace('.md', '').split(path.sep)
  }));

  return [...params, { slug: [] }];
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;

  // Resolve the file path based on the slug
  let targetFile = 'PRODUCT_DOCUMENTATION.md';
  if (slug && slug.length > 0) {
    targetFile = slug.join('/') + '.md';
  }

  const filePath = path.join(process.cwd(), 'docs', targetFile);

  if (!fs.existsSync(filePath)) {
    return (
      <div className="flex flex-col items-center justify-center h-[93vh] bg-white rounded-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">文档未找到</h1>
        <p className="text-gray-500 mb-8">请求的文档不存在或已被移除。</p>
        <Link href="/docs" className="text-blue-600 hover:underline">返回主文档</Link>
      </div>
    );
  }

  const sourceContent = fs.readFileSync(filePath, 'utf8');
  const content = prepareDisplayContent(sourceContent, targetFile.startsWith('history/'));

  // Helper to extract text from React components (ReactMarkdown children)
  const extractText = (node: ReactNode): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (typeof node === 'object' && 'props' in node) {
      const withProps = node as { props?: { children?: ReactNode } };
      if (withProps.props?.children) return extractText(withProps.props.children);
    }
    return '';
  };

  const currentProductContent = targetFile === 'PRODUCT_DOCUMENTATION.md'
    ? content
    : prepareDisplayContent(
        fs.readFileSync(path.join(process.cwd(), 'docs', 'PRODUCT_DOCUMENTATION.md'), 'utf8'),
      );
  const currentProductHeadings = extractHeadings(currentProductContent);
  const milestoneVersions = milestoneDefinitions.map((version) => {
    if (!version.file) return { ...version, headings: [] };

    const milestonePath = path.join(process.cwd(), 'docs', version.file);
    const milestoneContent = fs.readFileSync(milestonePath, 'utf8');
    const displayContent = prepareDisplayContent(
      milestoneContent,
      version.file.startsWith('history/'),
    );

    return { ...version, headings: extractHeadings(displayContent) };
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-black/5">
      <div className="w-full max-w-[1536px] h-[93vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 ring-1 ring-black/5">
        {/* Top Navigation Bar */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回首页</span>
            </Link>
            <div className="h-4 w-px bg-gray-200 mx-2" />
            <span className="text-sm font-semibold text-gray-900">Zaizai Isle 文档库</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-[320px] min-w-[320px] max-w-[320px] overflow-y-auto bg-gray-50/50 py-6 pl-6 pr-0 custom-scrollbar">
            <TOCNav
              currentProductHeadings={currentProductHeadings}
              activeDocument={targetFile}
              milestoneVersions={milestoneVersions}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
            <div className="mx-auto max-w-[820px] px-7 py-10 md:px-12 md:py-12">
              <article className="docs-prose prose prose-slate max-w-none prose-headings:scroll-mt-24" suppressHydrationWarning>
                <ReactMarkdown
                  components={{
                    // Manual ID assignment to ensure perfect match with TOC
                    h1: ({ children }) => <h1 id={slugify(extractText(children))}>{children}</h1>,
                    h2: ({ children }) => <h2 id={slugify(extractText(children))}>{children}</h2>,
                    h3: ({ children }) => <h3 id={slugify(extractText(children))}>{children}</h3>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
