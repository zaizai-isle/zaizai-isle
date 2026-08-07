'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Banana } from 'lucide-react';

const navItems = [
  { path: '/banana', label: '首页' },
  { path: '/banana/gallery', label: '画廊' },
  { path: '/banana/about', label: '关于我们' },
  { path: '/banana/faq', label: 'FAQ' },
];

export function BananaHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-7 items-center justify-between border-b border-border/60 text-[11px] text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />
            <span>Zaizai Isle</span>
          </Link>
          <span className="uppercase tracking-[0.16em]">实验中结构</span>
        </div>
        <div className="flex flex-col gap-2 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <Link href="/banana" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Banana className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Everything is Banana</span>
          </Link>

          <nav className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-start">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-2 py-2 rounded-md text-sm font-medium transition-colors sm:px-3 ${
                  pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
