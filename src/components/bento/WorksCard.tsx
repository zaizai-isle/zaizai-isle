"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import Image from "next/image";
import { lazy, Suspense, useState } from "react";
import { BentoHeader } from "./BentoCommon";
import {
  BUILT_STRUCTURES,
  getStructureStatusKey,
  type BuiltStructure,
} from "./built-structures.config";

const STATUS_STYLES: Record<BuiltStructure["status"], string> = {
  stable: "bg-emerald-950/75 text-emerald-50",
  experimental: "bg-amber-950/75 text-amber-50",
  archived: "bg-slate-800/75 text-slate-100",
};

const WorksPreviewModal = lazy(() => import("./WorksPreviewModal"));

export function WorksCard() {
  const { t } = useLanguage();
  const [previewProject, setPreviewProject] = useState<BuiltStructure | null>(null);

  return (
    <>
      <BentoCard
        colSpan={4}
        rowSpan={1}
        theme="light"
        className="h-full justify-between group relative overflow-hidden"
        borderGradient={VERTICAL_BORDER_GRADIENT}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-transparent opacity-30" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start gap-5">
            <BentoHeader
              icon={ArrowUpRight}
              title={t('page.works.title')}
              subtitle={t('page.works.desc')}
              theme="light"
              className="flex-1"
            />
            <Link
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("page.works.docs")}
              className="p-2 bg-black/80 text-white rounded-full group-hover:scale-110 transition-transform shrink-0 mt-1"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {BUILT_STRUCTURES.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setPreviewProject(project)}
                className="aspect-[3/2] w-full bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group/item cursor-pointer"
                aria-label={`${t("page.works.preview")} ${project.title}`}
              >
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(min-width: 640px) 30vw, 50vw"
                  className="object-cover transition-all duration-500 grayscale group-hover/item:grayscale-0 group-hover/item:scale-105"
                  placeholder={project.placeholder}
                />
                <span
                  className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide backdrop-blur-sm ${STATUS_STYLES[project.status]}`}
                >
                  {t(getStructureStatusKey(project.status))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </BentoCard>

      {previewProject ? (
        <Suspense fallback={null}>
          <WorksPreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />
        </Suspense>
      ) : null}
    </>
  );
}
