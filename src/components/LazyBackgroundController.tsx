"use client";

import { lazy, Suspense, useState } from "react";
import { SwatchBook } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { GlassButton } from "./GlassButton";

const BackgroundController = lazy(() =>
  import("./BackgroundController").then((mod) => ({ default: mod.BackgroundController }))
);

export function LazyBackgroundController({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <Suspense
        fallback={(
          <GlassButton className={className} active title={t('bg.settings')}>
            <SwatchBook className="h-4 w-4" />
          </GlassButton>
        )}
      >
        <BackgroundController className={className} initiallyOpen />
      </Suspense>
    );
  }

  return (
    <GlassButton
      className={className}
      onClick={() => setActivated(true)}
      title={t('bg.settings')}
    >
      <SwatchBook className="h-4 w-4" />
    </GlassButton>
  );
}
