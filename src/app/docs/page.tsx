import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DocsPage() {
  const filePath = path.join(process.cwd(), 'PRODUCT_DOCUMENTATION.md');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract headings for TOC
  const headings = content.split('\n').filter(line => line.match(/^#{1,3}\s/)).map(line => {
    const level = line.match(/^#+/)?.[0].length || 0;
    const text = line.replace(/^#+\s/, '');
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
    return { level, text, id };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="w-full flex items-center gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 mx-2" />
          <span className="text-sm font-semibold text-gray-900">Zaizai Isle 文档</span>
        </div>
      </div>

      <div className="flex items-start max-w-screen-2xl mx-auto">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto border-r border-gray-200 bg-white py-8 pl-6 pr-4">
          <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            目录
          </div>
          <nav className="space-y-0.5">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                className={`block py-1.5 text-sm transition-colors border-l-2 -ml-px ${
                  heading.level === 1 
                    ? 'font-semibold text-gray-900 border-transparent hover:border-gray-300 pl-4 mt-4 first:mt-0' 
                    : heading.level === 2
                    ? 'text-gray-600 border-transparent hover:border-gray-300 hover:text-gray-900 pl-4'
                    : 'text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-900 pl-8'
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-10 px-6 md:px-12 max-w-5xl">
          <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-h1:text-3xl prose-h1:font-bold prose-h1:tracking-tight prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-a:text-blue-600 hover:prose-a:text-blue-500">
            <ReactMarkdown rehypePlugins={[rehypeSlug]}>
              {content}
            </ReactMarkdown>
          </article>
        </main>
      </div>
    </div>
  );
}
