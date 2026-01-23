import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DocsPage() {
  const filePath = path.join(process.cwd(), 'PRODUCT_DOCUMENTATION.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white/80 transition-colors text-sm font-medium shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
      
      <article className="prose prose-lg prose-slate max-w-none bg-white/80 backdrop-blur-md p-6 md:p-12 rounded-3xl shadow-xl border border-white/20">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
