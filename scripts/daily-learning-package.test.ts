import assert from "node:assert/strict";
import test from "node:test";
import { validateLearningPackageV2 } from "../src/app/learning/learning-package";

const validPackage = {
  schema_version: 2,
  content_id: "daily-learning:example-01",
  content_type: "single_artwork",
  planning: { plan_issue: "01", selection_reason: "验证材料与结构观察。", primary_observation_theme: "A05", primary_observation_method: "M02", primary_history_node: "H09", core_question: "材料如何改变形态？", core_discovery: "材料与连接方式影响视觉体量。", visible_evidence: ["框架与承托面相互分离。"], connection_type: "C03" },
  work: { institution: "Example Museum", object_id: "OBJECT-1", title: "Example", creator: "Example Creator", date: "1925", medium: "Metal", source_url: "https://example.com/object/1" },
  article: { title: "材料如何改变形态？", introduction: "先看完整作品。", observations: [{ heading: "观察连接", body: "连接方式让结构保持可见。", asset_ids: ["asset-main"] }], history: "作品产生于新的制造条件中。", connection: "可以把这种观察方法用于其他家具。", question: "你最先注意哪一处连接？" },
  claims: [{ claim_id: "claim-1", text: "作品使用金属。", kind: "historical_fact", evidence_urls: ["https://example.com/object/1"], verification_status: "verified" }],
  assets: [{ asset_id: "asset-main", role: "main", image_url: "https://example.com/image.jpg", source_page: "https://example.com/object/1", rights_statement: "Public Domain", license_url: "https://creativecommons.org/publicdomain/mark/1.0/", attribution: "Example Museum", width: 1200, height: 800, alt: "作品完整图像。", crop: null, availability_status: "verified" }],
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
