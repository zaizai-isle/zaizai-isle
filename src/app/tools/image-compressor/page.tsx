import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { TranslatedText } from "@/components/TranslatedText";
import { CompressorCard } from "@/components/bento/CompressorCard";

export default function ImageCompressorPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm text-white/75 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <TranslatedText translationKey="tools.compressor.back" />
        </Link>

        <header className="mb-8 mt-10 max-w-2xl text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Isle Tool</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Image Compressor</h1>
          <p className="mt-3 text-sm leading-6 text-white/60"><TranslatedText translationKey="tools.compressor.privacy" /></p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[360px]">
          <CompressorCard colSpan={12} />
        </div>
      </div>
    </main>
  );
}
