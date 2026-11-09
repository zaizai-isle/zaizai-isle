import { readFileSync } from "node:fs";
const mod = await import(new URL("../src/app/learning/learning-package.ts", import.meta.url).href);
const { validateLearningPackageV2 } = mod;
for (const f of [
  ".codex-output/learning-drafts/research-2026-11-09-cleveland-171296/package-v2.json",
  ".codex-output/learning-drafts/research-2026-11-09-smk-kmssp430/package-v2.json",
]) {
  const r = validateLearningPackageV2(JSON.parse(readFileSync(f, "utf8")));
  console.log(f.split("/")[2], "=> valid:", r.valid, "| readyForOwnerReview:", r.readyForOwnerReview);
  r.errors.forEach((e) => console.log("  ERROR:", e));
  r.blockers.forEach((b) => console.log("  BLOCKER:", b));
}
