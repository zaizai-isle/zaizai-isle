"use client";

import { ExternalLink, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { TranslatedText } from "@/components/TranslatedText";
import { usePageVisibility } from "@/lib/use-page-visibility";
import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import {
  GRID_DISPLAY_LIMIT,
  TOOLBOX_ITEMS,
  getNow,
  getPresence,
  readToolUsage,
  writeToolUsage,
  type ToolboxItem,
} from "./toolbox.config";

const AIHubToolsModal = lazy(() => import("./AIHubToolsModal"));

function ToolItem({
  tool,
  isQuiet,
  onUse,
}: {
  tool: ToolboxItem;
  isQuiet: boolean;
  onUse: (id: string) => void;
}) {
  const content = (
    <>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tool.tone)}>
        <tool.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-white/75 transition-colors group-hover:text-white">
        {tool.name}
      </span>
      {tool.external ? <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-white/25" aria-hidden="true" /> : null}
    </>
  );
  const className = cn(
    "group flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 transition-all hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
    isQuiet && "scale-[0.97] opacity-40 grayscale-[0.3] hover:scale-100 hover:opacity-100 hover:grayscale-0",
  );

  return tool.external ? (
    <a href={tool.href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => onUse(tool.id)}>
      {content}
      <span className="sr-only"><TranslatedText translationKey="tools.ai.new_tab" /></span>
    </a>
  ) : (
    <Link href={tool.href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => onUse(tool.id)}>
      {content}
      <span className="sr-only"><TranslatedText translationKey="tools.ai.new_tab" /></span>
    </Link>
  );
}

export function AIHubCard() {
  // The card only mounts client-side (gated by ViewportCard), so reading
  // localStorage in the lazy initializers is safe and avoids an extra render.
  const [usage, setUsage] = useState<Record<string, number>>(() =>
    typeof window === "undefined" ? {} : readToolUsage(),
  );
  const [referenceNow, setReferenceNow] = useState(() => getNow());
  const [showAllTools, setShowAllTools] = useState(false);
  const isPageVisible = usePageVisibility();

  useEffect(() => {
    if (!isPageVisible) return;
    const timer = window.setInterval(() => setReferenceNow(getNow()), 60_000);
    return () => window.clearInterval(timer);
  }, [isPageVisible]);

  const markUsed = useCallback((id: string) => {
    setUsage((previous) => {
      const next = { ...previous, [id]: getNow() };
      writeToolUsage(next);
      return next;
    });
  }, []);

  const { visibleTools, quietIds, hasHiddenTools } = useMemo(() => {
    const active: ToolboxItem[] = [];
    const quiet: ToolboxItem[] = [];
    let hidden = false;

    TOOLBOX_ITEMS.forEach((tool) => {
      const presence = getPresence(usage[tool.id] ?? 0, referenceNow);
      if (presence === "active") active.push(tool);
      else if (presence === "quiet") quiet.push(tool);
      else hidden = true;
    });

    const visible = [...active, ...quiet];
    if (visible.length > GRID_DISPLAY_LIMIT) hidden = true;

    return {
      visibleTools: visible.slice(0, GRID_DISPLAY_LIMIT),
      quietIds: new Set(quiet.map((tool) => tool.id)),
      hasHiddenTools: hidden,
    };
  }, [usage, referenceNow]);

  return (
    <BentoCard
      colSpan={8}
      rowSpan={1}
      theme="dark"
      className="h-full overflow-hidden p-5"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            <TranslatedText translationKey="tools.ai.title" />
          </h2>
          {hasHiddenTools ? (
            <button
              type="button"
              onClick={() => setShowAllTools(true)}
              className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">
                <TranslatedText translationKey="tools.ai.show_all" />
              </span>
            </button>
          ) : null}
        </header>

        <div className="grid flex-1 grid-cols-2 content-start gap-2 sm:grid-cols-4">
          {visibleTools.map((tool) => (
            <ToolItem key={tool.id} tool={tool} isQuiet={quietIds.has(tool.id)} onUse={markUsed} />
          ))}
        </div>
      </div>

      {showAllTools ? (
        <Suspense fallback={null}>
          <AIHubToolsModal
            usage={usage}
            referenceNow={referenceNow}
            onClose={() => setShowAllTools(false)}
            onUse={markUsed}
          />
        </Suspense>
      ) : null}
    </BentoCard>
  );
}
