import { ISLAND_STATE } from "./island-state.config";

export const CORE_BUILD_PROGRESS_BLOCKS = 24;
export const CORE_BUILD_BLOCKS_PER_CHECKPOINT =
  CORE_BUILD_PROGRESS_BLOCKS / ISLAND_STATE.coreBuild.totalCheckpoints;

export const getCoreBuildBlockTone = (index: number) => {
  const completedBlocks =
    ISLAND_STATE.coreBuild.completedCheckpoints * CORE_BUILD_BLOCKS_PER_CHECKPOINT;

  return index < completedBlocks ? "settled" : "building";
};
