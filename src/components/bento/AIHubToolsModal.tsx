"use client";

import { RotateCcw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { TranslatedText } from "@/components/TranslatedText";
import { cn } from "@/lib/utils";
import {
  getPresence,
  TOOLBOX_ITEMS,
  type Presence,
  type ToolboxItem,
} from "./toolbox.config";

interface AIHubToolsModalProps {
  usage: Record<string, number>;
  referenceNow: number;
  onClose: () => void;
  onUse: (id: string) => void;
}

const PRESENCE_LABEL_KEYS: Record<Presence, string> = {
  active: "tools.ai.presence.active",
  quiet: "tools.ai.presence.quiet",
  retreat: "tools.ai.presence.retreat",
  vanished: "tools.ai.presence.vanished",
};

interface Section {
  key: string;
  titleKey: string;
  entries: { tool: ToolboxItem; presence: Presence }[];
}

function SectionToolRow({
  tool,
  presence,
  onUse,
}: {
  tool: ToolboxItem;
  presence: Presence;
  onUse: (id: string) => void;
}) {
  const content = (
    <>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tool.tone)}>
        <tool.icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white/85">{tool.name}</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          <TranslatedText translationKey={PRESENCE_LABEL_KEYS[presence]} />
        </span>
      </span>
    </>
  );
  const rowClassName =
    "group flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

  return (
    <div className={rowClassName}>
      {tool.external ? (
        <a
          href={tool.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-3"
          onClick={() => onUse(tool.id)}
        >
          {content}
        </a>
      ) : (
        <a
          href={tool.href}
          className="flex min-w-0 flex-1 items-center gap-3"
          onClick={() => onUse(tool.id)}
        >
          {content}
        </a>
      )}
      <button
        type="button"
        onClick={() => onUse(tool.id)}
        className="shrink-0 rounded-full p-1.5 text-emerald-300/70 transition-colors hover:bg-white/10 hover:text-emerald-300"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">
          <TranslatedText translationKey="tools.ai.reset" />
        </span>
      </button>
    </div>
  );
}

export default function AIHubToolsModal({ usage, referenceNow, onClose, onUse }: AIHubToolsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sections: Section[] = TOOLBOX_ITEMS.reduce<Section[]>((acc, tool) => {
    const presence = getPresence(usage[tool.id] ?? 0, referenceNow);
    const sectionKey = presence === "active" || presence === "quiet" ? "current" : presence;
    const titleKey =
      sectionKey === "current"
        ? "tools.ai.section_active"
        : sectionKey === "retreat"
          ? "tools.ai.section_retreat"
          : "tools.ai.section_vanished";
    let section = acc.find((s) => s.key === sectionKey);
    if (!section) {
      section = { key: sectionKey, titleKey, entries: [] };
      acc.push(section);
    }
    section.entries.push({ tool, presence });
    return acc;
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div
        onClick={onClose}
        className="isle-fade-in absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-hub-all-tools-title"
        className="isle-pop-in relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 id="ai-hub-all-tools-title" className="text-lg font-semibold text-white">
            <TranslatedText translationKey="tools.ai.all_title" />
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">
              <TranslatedText translationKey="tools.ai.close" />
            </span>
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.key}>
              <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                <TranslatedText translationKey={section.titleKey} />
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {section.entries.map(({ tool, presence }) => (
                  <SectionToolRow key={tool.id} tool={tool} presence={presence} onUse={onUse} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
