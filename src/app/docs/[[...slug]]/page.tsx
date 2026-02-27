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

  const content = fs.readFileSync(filePath, 'utf8');

  // Robust slugify function to match headings and TOC exactly
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u4e00-\u9fa5-]+/g, '') // Remove non-alphanumeric/non-cjk except space/hyphen
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

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

  // Extract headings for TOC
  const headings = content.split('\n').filter(line => line.match(/^#{1,3}\s/)).map(line => {
    const level = line.match(/^#+/)?.[0].length || 0;
    const text = line.replace(/^#+\s/, '');
    const id = slugify(text);
    return { level, text, id };
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
          <aside className="hidden lg:block w-72 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/50 py-8 pl-6 pr-4 custom-scrollbar">
            <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
              目录
            </div>
            <TOCNav headings={headings} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
            <div className="max-w-4xl mx-auto py-12 px-8 md:px-16">
              <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24" suppressHydrationWarning>
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
