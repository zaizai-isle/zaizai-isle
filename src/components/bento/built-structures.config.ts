import type { StaticImageData } from "next/image";

import projectAchievement from "@/assets/project-achievement.svg";
import projectBanana from "@/assets/project-banana-v3.webp";
import projectBananaThumbnail from "@/assets/project-banana-thumb.jpg";

export type BuiltStructureStatus = "stable" | "experimental" | "archived";
export type BuiltStructureKind = "tool" | "experiment" | "external";

export interface BuiltStructure {
  id: string;
  title: string;
  descriptionKey: string;
  image: StaticImageData;
  thumbnail: StaticImageData;
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
  thumbnail: projectAchievement,
  href: "/achievement",
  status: "experimental",
  kind: "tool",
  updatedAt: "2026-10-09",
  external: false,
  placeholder: "empty",
};

export const BUILT_STRUCTURES: readonly BuiltStructure[] = [
  LIFE_PASSPORT_STRUCTURE,
  {
    id: "everything-is-banana",
    title: "Everything is Banana",
    descriptionKey: "page.works.structure.banana.desc",
    image: projectBanana,
    thumbnail: projectBananaThumbnail,
    href: "/banana",
    status: "experimental",
    kind: "experiment",
    updatedAt: "2026-07-16",
    external: false,
    placeholder: "blur",
  },
];

export const getStructureStatusKey = (status: BuiltStructureStatus) =>
  `page.works.status.${status}`;

export const getStructureKindKey = (kind: BuiltStructureKind) =>
  `page.works.kind.${kind}`;
