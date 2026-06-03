import type { ReactNode } from 'react';
import { BananaHeader } from './_components/common/BananaHeader';
import { BananaFooter } from './_components/common/BananaFooter';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Everything is Banana',
  description: '您的世界，值得被「香蕉化」！',
};

export default function BananaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="banana-theme flex flex-col min-h-screen">
      <Toaster position="top-center" richColors />
      <BananaHeader />
      <main className="flex-grow">{children}</main>
      <BananaFooter />
    </div>
  );
}
