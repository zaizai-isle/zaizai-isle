"use client";

import { BentoCard } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { useBackground } from "@/lib/background-context";
import { BentoHeader } from "./BentoCommon";
import { CORE_BUILD_PROGRESS_BLOCKS, createCoreBuildViewModel } from "./core-build.config";

export const CoreBuildCard = () => {
    const { t } = useLanguage();
    const { settings } = useBackground();
    const textMode = settings.textMode || "dark";
    const isDarkBackground = textMode === "light";
    const cardTheme = isDarkBackground ? "glass" : "light";
    const { groups, progress } = createCoreBuildViewModel();
    const { buildingStart, buildingBlocks } = progress;
    const tokens = isDarkBackground
        ? {
            summaryText: "text-white/92",
            progressSettled: "bg-white/72",
            progressBuilding: "bg-amber-200/90 shadow-[0_0_10px_rgba(251,191,36,0.55)]",
            progressPending: "bg-white/22",
            sectionSurface: "border-white/15 bg-white/[0.03]",
            sectionLabel: "text-white/72",
            sectionBody: "text-white/92",
            footer: "text-white/42",
        }
        : {
            summaryText: "text-black/88",
            progressSettled: "bg-black/52",
            progressBuilding: "bg-amber-600/90 shadow-[0_0_8px_rgba(217,119,6,0.42)]",
            progressPending: "bg-black/14",
            sectionSurface: "border-black/20 bg-black/[0.03]",
            sectionLabel: "text-black/72",
            sectionBody: "text-black/90",
            footer: "text-black/55",
        };

    const toneByGroup = {
        running: isDarkBackground
            ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/10"
            : "text-emerald-800 border-emerald-700/30 bg-emerald-700/12",
        steady: isDarkBackground
            ? "text-sky-300 border-sky-300/30 bg-sky-300/10"
            : "text-sky-800 border-sky-700/30 bg-sky-700/12",
        building: isDarkBackground
            ? "text-amber-200 border-amber-200/30 bg-amber-200/10"
            : "text-amber-800 border-amber-700/35 bg-amber-700/12",
    } as const;

    return (
        <BentoCard
            colSpan={4}
            rowSpan={2}
            theme={cardTheme}
            className={cn(
                "js-core-build-card h-full min-h-[460px] sm:min-h-[500px] md:min-h-0 flex flex-col overflow-hidden font-mono p-4 sm:p-5 md:p-6",
                // !isDarkBackground && "!bg-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.1)]"
            )}
        >
            <BentoHeader
                title={t("build.core_build")}
                subtitle={`${t("build.timeline.stage_label")} · ${t("build.timeline.stage_value")}`}
                theme={isDarkBackground ? "dark" : "light"}
                className="mb-2 sm:mb-3"
            />

            <div className="mb-3 sm:mb-4">
                <p className={cn(
                    "text-[13px] sm:text-sm leading-relaxed",
                    tokens.summaryText
                )}>
                    {t("build.timeline.summary")}
                </p>
                <div className="mt-2 sm:mt-2.5">
                    <div className={cn(
                        "grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 sm:gap-1",
                        isDarkBackground ? "opacity-95" : "opacity-90"
                    )}>
                        {Array.from({ length: CORE_BUILD_PROGRESS_BLOCKS }).map((_, idx) => {
                            const isBuilding = idx >= buildingStart && idx < buildingStart + buildingBlocks;
                            const isSettled = idx < buildingStart;

                            return (
                                <span
                                    className={cn(
                                        "h-2 sm:h-2.5 rounded-[2px] transition-all motion-reduce:transition-none",
                                        isSettled && tokens.progressSettled,
                                        isBuilding && cn(
                                            tokens.progressBuilding,
                                            "animate-pulse motion-reduce:animate-none motion-reduce:shadow-none"
                                        ),
                                        !isSettled && !isBuilding && tokens.progressPending
                                    )}
                                    key={`progress-block-${idx}`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-rows-3 gap-2 sm:gap-2.5">
                {groups.map((group) => (
                    <section
                        key={group.id}
                        className={cn(
                            "h-full rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col justify-center",
                            tokens.sectionSurface
                        )}
                    >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className={cn(
                                "text-[10px] sm:text-[11px] uppercase tracking-[0.12em]",
                                tokens.sectionLabel
                            )}>
                                {t(group.titleKey)}
                            </h4>
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border",
                                toneByGroup[group.id]
                            )}>
                                {t(group.statusKey)}
                            </span>
                        </div>
                        <p className={cn(
                            "text-[13px] sm:text-sm leading-snug break-words",
                            tokens.sectionBody
                        )}>
                            {group.modules.length > 0
                                ? group.modules.map((module) => t(module.moduleKey)).join(" · ")
                                : t("build.group.empty")}
                        </p>
                    </section>
                ))}
            </div>

            <div className={cn(
                "text-[10px] italic mt-1.5 sm:mt-2 text-right",
                tokens.footer
            )}>
                — {t("build.footer_note")}
            </div>
        </BentoCard>
    );
};
