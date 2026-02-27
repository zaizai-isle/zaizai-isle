export type CoreBuildPhase = "done" | "building" | "planned";

export interface CoreBuildMilestone {
  id: string;
  moduleKey: string;
  phase: CoreBuildPhase;
  statusKey: string;
}

export interface CoreBuildGroup {
  id: "running" | "steady" | "building";
  titleKey: string;
  statusKey: string;
  modules: CoreBuildMilestone[];
}

interface CoreBuildGroupDefinition {
  id: CoreBuildGroup["id"];
  titleKey: string;
  statusKey: string;
  matcher: (milestone: CoreBuildMilestone) => boolean;
}

const ACTIVE_STATUS_KEY = "build.status.active";
const STABLE_STATUS_KEYS = new Set(["build.status.stable", "build.status.ready", "build.status.sync"]);

export const CORE_BUILD_PROGRESS_BLOCKS = 24;
const PROGRESS_SNAP_SIZE = 3;
const MIN_BUILDING_BLOCKS = 2;

export const CORE_BUILD_MILESTONES: CoreBuildMilestone[] = [
  { id: "identity", moduleKey: "build.module.identity", phase: "done", statusKey: ACTIVE_STATUS_KEY },
  { id: "weather", moduleKey: "build.module.weather", phase: "done", statusKey: ACTIVE_STATUS_KEY },
  { id: "stats", moduleKey: "build.module.stats", phase: "done", statusKey: ACTIVE_STATUS_KEY },
  { id: "works", moduleKey: "build.module.works", phase: "done", statusKey: "build.status.stable" },
  { id: "sifter", moduleKey: "build.module.sifter", phase: "done", statusKey: "build.status.ready" },
  { id: "inspiration", moduleKey: "build.module.inspiration", phase: "done", statusKey: "build.status.ready" },
  { id: "deposits", moduleKey: "build.module.deposits", phase: "done", statusKey: "build.status.sync" },
  { id: "kernel", moduleKey: "build.module.kernel", phase: "building", statusKey: "build.status.forming" },
];

const CORE_BUILD_GROUP_DEFINITIONS: CoreBuildGroupDefinition[] = [
  {
    id: "running",
    titleKey: "build.group.running",
    statusKey: ACTIVE_STATUS_KEY,
    matcher: (milestone) => milestone.statusKey === ACTIVE_STATUS_KEY,
  },
  {
    id: "steady",
    titleKey: "build.group.steady",
    statusKey: "build.group.steady_status",
    matcher: (milestone) => STABLE_STATUS_KEYS.has(milestone.statusKey),
  },
  {
    id: "building",
    titleKey: "build.group.building",
    statusKey: "build.status.forming",
    matcher: (milestone) => milestone.phase === "building",
  },
];

export interface CoreBuildViewModel {
  runningModules: CoreBuildMilestone[];
  steadyModules: CoreBuildMilestone[];
  buildingModules: CoreBuildMilestone[];
  groups: CoreBuildGroup[];
  progress: {
    buildingStart: number;
    buildingBlocks: number;
  };
}

export const createCoreBuildViewModel = (
  milestones: CoreBuildMilestone[] = CORE_BUILD_MILESTONES
): CoreBuildViewModel => {
  const safeMilestones = milestones.length > 0 ? milestones : CORE_BUILD_MILESTONES;
  const totalModules = Math.max(safeMilestones.length, 1);

  const groups = CORE_BUILD_GROUP_DEFINITIONS.map(({ matcher, ...group }) => ({
    ...group,
    modules: safeMilestones.filter(matcher),
  }));

  const runningModules = groups.find((group) => group.id === "running")?.modules ?? [];
  const steadyModules = groups.find((group) => group.id === "steady")?.modules ?? [];
  const buildingModules = groups.find((group) => group.id === "building")?.modules ?? [];

  const settledRatio = (runningModules.length + steadyModules.length) / totalModules;
  const settledBlocks = Math.min(
    CORE_BUILD_PROGRESS_BLOCKS - MIN_BUILDING_BLOCKS,
    Math.max(
      0,
      Math.round((settledRatio * CORE_BUILD_PROGRESS_BLOCKS) / PROGRESS_SNAP_SIZE) * PROGRESS_SNAP_SIZE
    )
  );
  const buildingStart = Math.max(0, settledBlocks - 1);
  const buildingBlocks = Math.min(
    CORE_BUILD_PROGRESS_BLOCKS - buildingStart,
    Math.max(
      MIN_BUILDING_BLOCKS,
      Math.ceil((buildingModules.length / totalModules) * CORE_BUILD_PROGRESS_BLOCKS)
    )
  );

  return {
    runningModules,
    steadyModules,
    buildingModules,
    groups,
    progress: {
      buildingStart,
      buildingBlocks,
    },
  };
};
