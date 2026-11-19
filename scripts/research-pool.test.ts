import assert from "node:assert/strict";
import test from "node:test";
import { parseResearchPool } from "../src/app/learning/research-pool-data";

const TODAY = "2026-11-19";

test("research pool: 机器人直写的最新候选即刻解析（免部署）", () => {
  const pool = {
    status: "research_candidates_only",
    research_date: TODAY,
    items: [
      { source_id: "met:1", review_status: "needs_editorial_review" },
      { source_id: "met:2", review_status: "auto_published" },
      { source_id: "met:3", review_status: "needs_editorial_review" },
    ],
  };
  const state = parseResearchPool(pool, TODAY);
  assert.deepEqual(state.candidates.map((c) => c.source_id), ["met:1", "met:3"]);
  assert.equal(state.researchDate, TODAY);
  assert.equal(state.dryDays, 0);
  assert.equal(state.poolIssue, "");
});

test("research pool: 干涸判定与状态异常（审核页与岛主提醒共用同一结果）", () => {
  const fresh = parseResearchPool({ status: "research_candidates_only", research_date: "2026-11-18", items: [] }, TODAY);
  assert.equal(fresh.dryDays, 0);
  const dry = parseResearchPool({ status: "research_candidates_only", research_date: "2026-11-15", items: [{ source_id: "x", review_status: "needs_editorial_review" }] }, TODAY);
  assert.equal(dry.dryDays, 4);
  assert.equal(dry.poolIssue, "已干涸");
  // 干涸时候选仍在，审核页照旧展示，提醒页报干涸——同一份解析结果两种消费。
  assert.deepEqual(dry.candidates.map((c) => c.source_id), ["x"]);
  assert.equal(parseResearchPool({ status: "oops" }, TODAY).poolIssue, "状态异常（oops）");
  assert.equal(parseResearchPool(null, TODAY).poolIssue, "无法读取，采集任务可能未运行");
  assert.equal(parseResearchPool({ status: "research_candidates_only", items: [] }, TODAY).poolIssue, "缺少采集日期");
});
