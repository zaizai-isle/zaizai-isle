import {
  Bot,
  CloudLightning,
  Cpu,
  Database,
  FileText,
  ImageDown,
  MessageSquareCode,
  Palette,
  Sailboat,
  Send,
  Smile,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface ToolboxItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  tone: string;
  external: boolean;
  /** Seeded as recently used the first time the toolbox is opened. */
  defaultActive?: boolean;
}

/** Max tools shown in the card grid (4 per row × 2 rows) before the "all tools" popup is needed. */
export const GRID_DISPLAY_LIMIT = 8;

export const PRESENCE_STORAGE_KEY = "tools_presence_v1";

export const PRESENCE_THRESHOLDS = {
  ACTIVE: 7 * 24 * 60 * 60 * 1000, // 7 days
  QUIET: 30 * 24 * 60 * 60 * 1000, // 30 days
  RETREAT: 60 * 24 * 60 * 60 * 1000, // 60 days
} as const;

export type Presence = "active" | "quiet" | "retreat" | "vanished";

export const TOOLBOX_ITEMS: readonly ToolboxItem[] = [
  { id: "compressor", name: "Image Compressor", href: "/tools/image-compressor", icon: ImageDown, tone: "text-sky-300 bg-sky-400/10", external: false, defaultActive: true },
  { id: "chatgpt", name: "ChatGPT", href: "https://chatgpt.com", icon: Bot, tone: "text-emerald-300 bg-emerald-400/10", external: true, defaultActive: true },
  { id: "claude", name: "Claude", href: "https://claude.ai", icon: MessageSquareCode, tone: "text-orange-300 bg-orange-400/10", external: true, defaultActive: true },
  { id: "figma", name: "Figma", href: "https://www.figma.com", icon: Palette, tone: "text-pink-300 bg-pink-400/10", external: true, defaultActive: true },
  { id: "gemini", name: "Gemini", href: "https://gemini.google.com", icon: Sparkles, tone: "text-indigo-300 bg-indigo-400/10", external: true, defaultActive: true },
  { id: "notion", name: "Notion", href: "https://www.notion.so", icon: FileText, tone: "text-slate-200 bg-white/10", external: true, defaultActive: true },
  { id: "midjourney", name: "Midjourney", href: "https://www.midjourney.com", icon: Sailboat, tone: "text-blue-300 bg-blue-400/10", external: true },
  { id: "huggingface", name: "HuggingFace", href: "https://huggingface.co", icon: Smile, tone: "text-yellow-300 bg-yellow-400/10", external: true },
  { id: "ollama", name: "Ollama", href: "https://ollama.com", icon: Cpu, tone: "text-white bg-white/10", external: true },
  { id: "comfyui", name: "ComfyUI", href: "https://github.com/comfyanonymous/ComfyUI", icon: Workflow, tone: "text-purple-300 bg-purple-400/10", external: true },
  { id: "cloudflare", name: "Cloudflare", href: "https://dash.cloudflare.com", icon: CloudLightning, tone: "text-orange-300 bg-orange-400/10", external: true },
  { id: "postman", name: "Postman", href: "https://www.postman.com", icon: Send, tone: "text-amber-300 bg-amber-400/10", external: true },
  { id: "supabase", name: "Supabase", href: "https://supabase.com", icon: Database, tone: "text-teal-300 bg-teal-400/10", external: true },
];

export const getNow = () => Date.now();

export function getPresence(lastUsed: number, now: number): Presence {
  const diff = now - lastUsed;
  if (diff < PRESENCE_THRESHOLDS.ACTIVE) return "active";
  if (diff < PRESENCE_THRESHOLDS.QUIET) return "quiet";
  if (diff < PRESENCE_THRESHOLDS.RETREAT) return "retreat";
  return "vanished";
}

/** Read last-used timestamps; seed defaults once so first visits still render. */
export function readToolUsage(): Record<string, number> {
  try {
    const saved = window.localStorage.getItem(PRESENCE_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Record<string, number>;
  } catch {
    // Corrupt storage falls through to a fresh seed.
  }
  const now = getNow();
  const seeded: Record<string, number> = {};
  TOOLBOX_ITEMS.forEach((tool) => {
    seeded[tool.id] = tool.defaultActive ? now : now - PRESENCE_THRESHOLDS.QUIET - 86_400_000;
  });
  try {
    window.localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // Private-mode storage failures are non-fatal.
  }
  return seeded;
}

export function writeToolUsage(usage: Record<string, number>) {
  try {
    window.localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage failures; state still lives in memory for this visit.
  }
}
