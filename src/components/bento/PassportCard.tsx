"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { LIFE_PASSPORT_STRUCTURE } from "./built-structures.config";

export function PassportCard() {
  const { t } = useLanguage();

  return (
    <BentoCard
      colSpan={2}
      rowSpan={1}
      theme="light"
      className="group h-full min-h-[220px] overflow-hidden p-0"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <Link
        href={LIFE_PASSPORT_STRUCTURE.href}
        aria-label={LIFE_PASSPORT_STRUCTURE.title}
        className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(138,48,43,0.14),transparent_45%),linear-gradient(145deg,rgba(255,255,255,0.4),rgba(232,219,194,0.45))]" />
        <Image
          src={LIFE_PASSPORT_STRUCTURE.image}
          alt=""
          aria-hidden="true"
          className="absolute -bottom-7 -right-7 w-36 rotate-[-7deg] opacity-25 transition-transform duration-500 group-hover:rotate-[-2deg] group-hover:scale-105"
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="rounded-full border border-[#8a302b]/20 bg-white/55 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#8a302b]">
            LIFE PASSPORT
          </span>
          <ArrowUpRight className="h-5 w-5 text-[#8a302b] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        <div className="relative z-10 max-w-[11rem]">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">
            {LIFE_PASSPORT_STRUCTURE.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-gray-600">
            {t(LIFE_PASSPORT_STRUCTURE.descriptionKey)}
          </p>
        </div>
      </Link>
    </BentoCard>
  );
}
