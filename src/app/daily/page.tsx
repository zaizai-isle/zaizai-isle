import { Suspense } from "react";
import { DailyPage } from "@/components/daily/DailyPage";

function DailyPageFallback() {
  return (
    <main className="min-h-screen bg-[#e8efec] px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1160px] animate-pulse">
        <div className="mb-8 h-11 w-52 rounded-full bg-[#f5f4ed] shadow-[-5px_-5px_12px_rgba(255,255,255,0.72),6px_7px_14px_rgba(69,93,88,0.14)]" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.48fr)_minmax(330px,0.72fr)] lg:gap-8">
          <div className="min-h-[570px] rounded-[2.25rem] border border-white/75 bg-[#f5f4ed] shadow-[-12px_-12px_26px_rgba(255,255,255,0.62),14px_16px_30px_rgba(69,93,88,0.16)]" />
          <div className="min-h-[570px] rounded-[2.25rem] border border-white/75 bg-[#f5f4ed] shadow-[-12px_-12px_26px_rgba(255,255,255,0.62),14px_16px_30px_rgba(69,93,88,0.16)]" />
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DailyPageFallback />}>
      <DailyPage />
    </Suspense>
  );
}
