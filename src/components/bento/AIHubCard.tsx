import {
  Bot,
  ExternalLink,
  FileText,
  ImageDown,
  MessageSquareCode,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { TranslatedText } from "@/components/TranslatedText";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";

interface ToolboxItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  tone: string;
  external: boolean;
}

const TOOLBOX_ITEMS: readonly ToolboxItem[] = [
  { id: "compressor", name: "Image Compressor", href: "/tools/image-compressor", icon: ImageDown, tone: "text-sky-300 bg-sky-400/10", external: false },
  { id: "chatgpt", name: "ChatGPT", href: "https://chatgpt.com", icon: Bot, tone: "text-emerald-300 bg-emerald-400/10", external: true },
  { id: "claude", name: "Claude", href: "https://claude.ai", icon: MessageSquareCode, tone: "text-orange-300 bg-orange-400/10", external: true },
  { id: "figma", name: "Figma", href: "https://www.figma.com", icon: Palette, tone: "text-pink-300 bg-pink-400/10", external: true },
  { id: "gemini", name: "Gemini", href: "https://gemini.google.com", icon: Sparkles, tone: "text-indigo-300 bg-indigo-400/10", external: true },
  { id: "notion", name: "Notion", href: "https://www.notion.so", icon: FileText, tone: "text-slate-200 bg-white/10", external: true },
];

function ToolItem({ tool }: { tool: ToolboxItem }) {
  const content = (
    <>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tool.tone}`}>
        <tool.icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-white/75 transition-colors group-hover:text-white">
        {tool.name}
      </span>
      {tool.external ? <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-white/25" aria-hidden="true" /> : null}
    </>
  );
  const className = "group flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

  return tool.external ? (
    <a href={tool.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
      <span className="sr-only"><TranslatedText translationKey="tools.ai.new_tab" /></span>
    </a>
  ) : (
    <Link href={tool.href} className={className}>
      {content}
    </Link>
  );
}

export function AIHubCard() {
  return (
    <BentoCard
      colSpan={8}
      rowSpan={1}
      theme="dark"
      className="h-full overflow-hidden p-5"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-300/60">
              <TranslatedText translationKey="tools.ai.eyebrow" />
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
              <TranslatedText translationKey="tools.ai.title" />
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs leading-5 text-white/35 sm:block">
            <TranslatedText translationKey="tools.ai.subtitle" />
          </p>
        </header>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          {TOOLBOX_ITEMS.map((tool) => <ToolItem key={tool.id} tool={tool} />)}
        </div>
      </div>
    </BentoCard>
  );
}
