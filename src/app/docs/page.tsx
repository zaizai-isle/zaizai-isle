import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DocsPage() {
  const filePath = path.join(process.cwd(), 'docs', 'PRODUCT_DOCUMENTATION.md');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract headings for TOC
  const headings = content.split('\n').filter(line => line.match(/^#{1,3}\s/)).map(line => {
    const level = line.match(/^#+/)?.[0].length || 0;
    const text = line.replace(/^#+\s/, '');
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
    return { level, text, id };
  });

  return (
    <div className="w-full max-w-[1400px] h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden mx-auto border border-white/20 ring-1 ring-black/5">
      {/* Top Navigation Bar */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 mx-2" />
          <span className="text-sm font-semibold text-gray-900">Zaizai Isle 文档</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-72 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/50 py-8 pl-6 pr-4 custom-scrollbar">
          <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
            目录
          </div>
          <nav className="space-y-0.5">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                className={`block py-1.5 text-sm transition-all rounded-md ${
                  heading.level === 1 
                    ? 'font-semibold text-gray-900 hover:bg-gray-200/50 px-4 mt-4 first:mt-0' 
                    : heading.level === 2
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 px-4'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 pl-8 pr-4'
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto py-12 px-8 md:px-16">
            <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-h1:text-3xl prose-h1:font-bold prose-h1:tracking-tight prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl prose-img:shadow-lg">
              <ReactMarkdown rehypePlugins={[rehypeSlug]}>
                {content}
              </ReactMarkdown>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
