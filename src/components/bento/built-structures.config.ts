import type { StaticImageData } from "next/image";

import projectAchievement from "@/assets/project-achievement.svg";
import projectAiTrainer from "@/assets/project-ai-trainer.webp";
import projectBanana from "@/assets/project-banana-v3.webp";
import projectExam from "@/assets/project-exam.webp";

export type BuiltStructureStatus = "stable" | "experimental" | "archived";
export type BuiltStructureKind = "tool" | "experiment" | "external";

export interface BuiltStructure {
  id: string;
  title: string;
  descriptionKey: string;
  image: StaticImageData;
  href: string;
  status: BuiltStructureStatus;
  kind: BuiltStructureKind;
  updatedAt: string;
  external: boolean;
  placeholder: "blur" | "empty";
}

export const LIFE_PASSPORT_STRUCTURE: BuiltStructure = {
  id: "life-achievement-generator",
  title: "人生护照",
  descriptionKey: "page.works.structure.achievement.desc",
  image: projectAchievement,
  href: "/achievement",
  status: "experimental",
  kind: "tool",
  updatedAt: "2026-08-21",
  external: false,
  placeholder: "empty",
};

export const BUILT_STRUCTURES: readonly BuiltStructure[] = [
  {
    id: "everything-is-banana",
    title: "Everything is Banana",
    descriptionKey: "page.works.structure.banana.desc",
    image: projectBanana,
    href: "/banana",
    status: "experimental",
    kind: "experiment",
    updatedAt: "2026-07-16",
    external: false,
    placeholder: "blur",
  },
  {
    id: "smart-exam-platform",
    title: "Smart Exam Platform",
    descriptionKey: "page.works.structure.exam.desc",
    image: projectExam,
    href: "https://app-7vpd7214bjlt.appmiaoda.com",
    status: "stable",
    kind: "external",
    updatedAt: "2026-07-16",
    external: true,
    placeholder: "blur",
  },
  {
    id: "ai-trainer-assistant",
    title: "AI Trainer Assistant",
    descriptionKey: "page.works.structure.trainer.desc",
    image: projectAiTrainer,
    href: "https://www.doubao.com/code/launch/detail/66403617282?from=from_launch_share_link",
    status: "stable",
    kind: "external",
    updatedAt: "2026-07-16",
    external: true,
    placeholder: "blur",
  },
];

export const getStructureStatusKey = (status: BuiltStructureStatus) =>
  `page.works.status.${status}`;

export const getStructureKindKey = (kind: BuiltStructureKind) =>
  `page.works.kind.${kind}`;
