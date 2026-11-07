import assert from "node:assert/strict";
import test from "node:test";
import { validateLearningPackageForPublication, validateLearningPackageV2 } from "../src/app/learning/learning-package";

const validPackage = {
  schema_version: 2,
  content_id: "daily-learning:example-01",
  content_type: "single_artwork",
  planning: { plan_issue: "01", selection_reason: "验证材料与结构观察。", primary_observation_theme: "A05", primary_observation_method: "M02", primary_history_node: "H09", core_question: "材料如何改变形态？", core_discovery: "材料与连接方式影响视觉体量。", visible_evidence: ["框架与承托面相互分离。"], connection_type: "C03" },
  work: { institution: "Example Museum", object_id: "OBJECT-1", title: "Example", creator: "Example Creator", date: "1925", medium: "Metal", source_url: "https://example.com/object/1" },
  article: { title: "材料如何改变形态？", introduction: "先看完整作品。", observations: [{ heading: "观察连接", body: "连接方式让结构保持可见。", asset_ids: ["asset-main"] }], history: "作品产生于新的制造条件中。", connection: "可以把这种观察方法用于其他家具。", question: "你最先注意哪一处连接？" },
  claims: [{ claim_id: "claim-1", text: "作品使用金属。", kind: "historical_fact", evidence_urls: ["https://example.com/object/1"], verification_status: "verified" }],
  assets: [{ asset_id: "asset-main", role: "main", image_url: "https://example.com/image.jpg", source_page: "https://example.com/object/1", rights_statement: "Public Domain", license_url: "https://creativecommons.org/publicdomain/mark/1.0/", attribution: "Example Museum", width: 1200, height: 800, alt: "作品完整图像。", crop: null, availability_status: "verified", rights_status: "open-commons" }],
  quality: { editorial_guideline_version: "v0.1", generated_at: "2026-10-20T06:00:00Z", checks: [{ check_id: "structure", status: "passed", note: "结构完整。" }], blockers: [], human_review_items: ["核对页面视觉效果。"] },
};

test("daily learning v2 package accepts a complete review package", () => {
  const result = validateLearningPackageV2(validPackage);
  assert.equal(result.valid, true);
  assert.equal(result.readyForOwnerReview, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.blockers, []);
});

test("daily learning v2 package rejects missing editorial planning", () => {
  const invalid = structuredClone(validPackage) as Record<string, unknown>;
  const planning = invalid.planning as Record<string, unknown>;
  delete planning.primary_observation_theme;
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.errors.join(" "), /A01–A08/);
});

test("daily learning v2 package keeps unresolved evidence out of owner review", () => {
  const blocked = structuredClone(validPackage);
  blocked.claims[0].verification_status = "needs_review";
  blocked.assets[0].availability_status = "needs_review";
  const result = validateLearningPackageV2(blocked);
  assert.equal(result.valid, true);
  assert.equal(result.readyForOwnerReview, false);
  assert.equal(result.blockers.length, 2);
});

test("daily learning v2 package allows owner publication when a valid main image exists", () => {
  const blocked = structuredClone(validPackage);
  blocked.claims[0].verification_status = "needs_review";
  blocked.assets[0].availability_status = "needs_review";
  blocked.quality.checks[0].status = "needs_review";
  blocked.quality.blockers = ["来源仍待核。"];
  const result = validateLearningPackageForPublication(blocked);
  assert.equal(result.publishable, true);
  assert.deepEqual(result.errors, []);
});

test("daily learning v2 package rejects publication without a structurally valid main image", () => {
  const invalid = structuredClone(validPackage);
  invalid.assets[0].image_url = "";
  const result = validateLearningPackageForPublication(invalid);
  assert.equal(result.publishable, false);
  assert.match(result.errors.join(" "), /image_url/);
});

test("daily learning v2 package rejects an observation with a missing image", () => {
  const invalid = structuredClone(validPackage);
  invalid.article.observations[0].asset_ids = ["asset-missing"];
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /引用了不存在的图片/);
});

test("daily learning v2 package accepts a normalized detail crop", () => {
  const withCrop = structuredClone(validPackage);
  withCrop.assets[0].crop = { x: 0.2, y: 0.1, width: 0.5, height: 0.6 };
  const result = validateLearningPackageV2(withCrop);
  assert.equal(result.valid, true);
});

test("daily learning v2 package accepts an observation-specific crop", () => {
  const withCrop = structuredClone(validPackage) as typeof validPackage & {
    article: { observations: Array<(typeof validPackage.article.observations)[number] & { crop?: { x: number; y: number; width: number; height: number } }> };
  };
  withCrop.article.observations[0].crop = { x: 0.1, y: 0.2, width: 0.45, height: 0.5 };
  const result = validateLearningPackageV2(withCrop);
  assert.equal(result.valid, true);
});

test("daily learning v2 package rejects an observation crop outside the source image", () => {
  const invalid = structuredClone(validPackage) as typeof validPackage & {
    article: { observations: Array<(typeof validPackage.article.observations)[number] & { crop?: { x: number; y: number; width: number; height: number } }> };
  };
  invalid.article.observations[0].crop = { x: 0.75, y: 0.2, width: 0.5, height: 0.5 };
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /observations\[0\]\.crop/);
});

test("daily learning v2 package rejects a crop outside the source image", () => {
  const invalid = structuredClone(validPackage);
  invalid.assets[0].crop = { x: 0.8, y: 0.1, width: 0.5, height: 0.6 };
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /有效矩形/);
});

test("daily learning v2 package blocks internal status words in reader-visible text", () => {
  const invalid = structuredClone(validPackage);
  invalid.article.title = "材料如何改变形态？（草稿）";
  invalid.assets[0].alt = "作品完整图像，待审核。";
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, true);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.blockers.join(" "), /article\.title 含内部状态词「草稿」/);
  assert.match(result.blockers.join(" "), /assets\[0\]\.alt 含内部状态词「待审核」/);
});

test("daily learning v2 package catches English placeholders case-insensitively", () => {
  const invalid = structuredClone(validPackage);
  invalid.article.history = "todo: confirm the workshop date. FIXME later.";
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.blockers.join(" "), /article\.history 含内部状态词「TODO」/);
});

test("daily learning v2 package passes the forbidden-term scan on clean reader text", () => {
  const clean = structuredClone(validPackage);
  clean.article.history = "作品产生于新的制造条件中，页面呈现最终核定文本。";
  const result = validateLearningPackageV2(clean);
  assert.equal(result.valid, true);
  assert.deepEqual(result.blockers, []);
});

test("daily learning v2 package blocks assets without rights_status", () => {
  const invalid = structuredClone(validPackage);
  delete (invalid.assets[0] as Record<string, unknown>).rights_status;
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, true);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.blockers.join(" "), /assets\[0\]\.rights_status 必须为 risk、open、open-commons 或 unverified/);
});

test("daily learning v2 package blocks risky rights_status until rights_note is added", () => {
  const risky = structuredClone(validPackage) as typeof validPackage & {
    assets: Array<(typeof validPackage.assets)[number] & { rights_note?: string }>;
  };
  risky.assets[0].rights_status = "risk";
  const missing = validateLearningPackageV2(risky);
  assert.equal(missing.valid, true);
  assert.equal(missing.readyForOwnerReview, false);
  assert.match(missing.blockers.join(" "), /assets\[0\]\.rights_status 为 risk 时 rights_note 必填/);
  risky.assets[0].rights_note = "来源页面未声明许可，需人工确认。";
  const noted = validateLearningPackageV2(risky);
  assert.equal(noted.readyForOwnerReview, true);
  assert.deepEqual(noted.blockers, []);
});

test("daily learning v2 package accepts open rights_status without a rights_note", () => {
  const open = structuredClone(validPackage);
  open.assets[0].rights_status = "open";
  const result = validateLearningPackageV2(open);
  assert.equal(result.valid, true);
  assert.deepEqual(result.blockers, []);
});

test("daily learning v2 package blocks a package without a main image", () => {
  const invalid = structuredClone(validPackage);
  invalid.assets[0].role = "detail";
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.errors.join(" "), /必须且只能提供一张主图/);
  assert.match(result.blockers.join(" "), /主图必须恰好一张，当前 0 张/);
});

test("daily learning v2 package blocks more than one main image", () => {
  const invalid = structuredClone(validPackage);
  invalid.assets.push({ ...structuredClone(validPackage.assets[0]), asset_id: "asset-main-2" });
  const result = validateLearningPackageV2(invalid);
  assert.equal(result.valid, false);
  assert.equal(result.readyForOwnerReview, false);
  assert.match(result.blockers.join(" "), /主图必须恰好一张，当前 2 张/);
});

test("daily learning v2 package accepts one main image plus details", () => {
  const ok = structuredClone(validPackage);
  ok.assets.push({ ...structuredClone(validPackage.assets[0]), asset_id: "asset-detail", role: "detail" });
  const result = validateLearningPackageV2(ok);
  assert.equal(result.valid, true);
  assert.equal(result.readyForOwnerReview, true);
  assert.deepEqual(result.blockers, []);
});
