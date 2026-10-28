import type { LearningImageCrop } from "./learning-content";

// Editorial crop decisions for already-created v2 snapshots. New packages should
// carry the same decisions in article.observations[].crop.
const decisions: Record<string, Array<LearningImageCrop | null>> = {
  "daily-learning:cleveland-156112": [
    { x: 0.12, y: 0.4, width: 0.76, height: 0.54 },
    { x: 0.12, y: 0.27, width: 0.76, height: 0.3 },
  ],
  "daily-learning:plan-01-met-36491": [
    { x: 0.2, y: 0.04, width: 0.58, height: 0.68 },
    { x: 0, y: 0.5, width: 0.68, height: 0.42 },
  ],
  "daily-learning:plan-02-met-63385": [
    { x: 0.24, y: 0.39, width: 0.34, height: 0.42 },
    { x: 0.2, y: 0.26, width: 0.56, height: 0.42 },
  ],
  "daily-learning:plan-03-vangogh-s0114v1962": [
    null,
    { x: 0.03, y: 0.02, width: 0.92, height: 0.25 },
  ],
  "daily-learning:plan-04-loc-2017762891": [
    { x: 0.19, y: 0.08, width: 0.62, height: 0.5 },
    null,
  ],
  "daily-learning:plan-05-four-images-related-reading": [null, null],
  "daily-learning:plan-06-smithsonian-1935-23-21": [
    { x: 0.2, y: 0.1, width: 0.32, height: 0.56 },
    { x: 0.42, y: 0.05, width: 0.28, height: 0.86 },
  ],
  "daily-learning:plan-07-wassily-chair-cc0": [
    { x: 0.17, y: 0.06, width: 0.65, height: 0.72 },
    { x: 0.27, y: 0.17, width: 0.48, height: 0.4 },
  ],
  "daily-learning:plan-09-braun-sk4": [
    { x: 0.48, y: 0.22, width: 0.48, height: 0.58 },
    { x: 0.05, y: 0.02, width: 0.9, height: 0.52 },
  ],
  "daily-learning:plan-12-met-746672": [
    { x: 0.12, y: 0.13, width: 0.76, height: 0.32 },
    { x: 0.12, y: 0.48, width: 0.76, height: 0.42 },
  ],
  "daily-learning:plan-16-barragan-house-roof2": [null, null],
  "daily-learning:smk-kks1974-113": [
    { x: 0.13, y: 0.14, width: 0.74, height: 0.48 },
    { x: 0.06, y: 0.42, width: 0.88, height: 0.5 },
  ],
};

export function learningDetailCrop(contentId: string, observationIndex: number) {
  return decisions[contentId]?.[observationIndex] ?? undefined;
}
