export const observationThemes = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08"] as const;
export const observationMethods = ["M01", "M02", "M03", "M04", "M05", "M06"] as const;
export const historyNodes = ["H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12", "H13", "H14", "H15", "H16"] as const;
export const connectionTypes = ["C01", "C02", "C03"] as const;

export type LearningPackageV2 = {
  schema_version: 2;
  content_id: string;
  content_type: "single_artwork" | "related_reading";
  planning: {
    plan_issue: string;
    selection_reason: string;
    primary_observation_theme: typeof observationThemes[number];
    primary_observation_method: typeof observationMethods[number];
    primary_history_node: typeof historyNodes[number];
    core_question: string;
    core_discovery: string;
    visible_evidence: string[];
    connection_type: typeof connectionTypes[number];
  };
  work: {
    institution: string;
    object_id: string;
    title: string;
    creator: string;
    date: string;
    medium: string;
    source_url: string;
  };
  article: {
    title: string;
    introduction: string;
    observations: { heading: string; body: string; asset_ids: string[]; crop?: { x: number; y: number; width: number; height: number } }[];
    history: string;
    connection: string;
    question: string;
  };
  claims: {
    claim_id: string;
    text: string;
    kind: "visible_fact" | "historical_fact" | "editorial_interpretation";
    evidence_urls: string[];
    verification_status: "verified" | "needs_review" | "blocked";
  }[];
  assets: {
    asset_id: string;
    role: "main" | "detail" | "comparison";
    image_url: string;
    source_page: string;
    rights_statement: string;
    license_url: string;
    attribution: string;
    width: number;
    height: number;
    alt: string;
    crop: null | { x: number; y: number; width: number; height: number };
    availability_status: "verified" | "needs_review" | "blocked";
  }[];
  quality: {
    editorial_guideline_version: string;
    generated_at: string;
    checks: { check_id: string; status: "passed" | "failed" | "needs_review"; note: string }[];
    blockers: string[];
    human_review_items: string[];
  };
};

export type LearningPackageValidation = {
  valid: boolean;
  readyForOwnerReview: boolean;
  errors: string[];
  blockers: string[];
  value?: LearningPackageV2;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown, minimum = 1) => typeof value === "string" && value.trim().length >= minimum;
const isHttpUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const hasOnly = <T extends readonly string[]>(value: unknown, allowed: T): value is T[number] => typeof value === "string" && allowed.includes(value);
const records = (value: unknown) => Array.isArray(value) && value.every(isRecord);
const validCrop = (value: unknown) => {
  if (!isRecord(value) || !["x", "y", "width", "height"].every((field) => Number.isFinite(Number(value[field])))) return false;
  const { x, y, width, height } = value as Record<string, number>;
  return x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 1 && y + height <= 1;
};

export function validateLearningPackageV2(input: unknown): LearningPackageValidation {
  const errors: string[] = [];
  const blockers: string[] = [];
  if (!isRecord(input)) return { valid: false, readyForOwnerReview: false, errors: ["草稿包必须是 JSON 对象。"], blockers };
  if (input.schema_version !== 2) errors.push("schema_version 必须为 2。");
  if (!isText(input.content_id, 3) || !/^[a-z0-9][a-z0-9:_-]+$/i.test(String(input.content_id))) errors.push("content_id 格式无效。");
  if (!hasOnly(input.content_type, ["single_artwork", "related_reading"] as const)) errors.push("content_type 无效。");

  const planning = input.planning;
  if (!isRecord(planning)) errors.push("缺少 planning。");
  else {
    for (const field of ["plan_issue", "selection_reason", "core_question", "core_discovery"] as const) if (!isText(planning[field])) errors.push(`planning.${field} 不能为空。`);
    if (!hasOnly(planning.primary_observation_theme, observationThemes)) errors.push("主要观察主题必须为 A01–A08。");
    if (!hasOnly(planning.primary_observation_method, observationMethods)) errors.push("主要观察方法必须为 M01–M06。");
    if (!hasOnly(planning.primary_history_node, historyNodes)) errors.push("主要历史节点必须为 H01–H16。");
    if (!hasOnly(planning.connection_type, connectionTypes)) errors.push("连接类型必须为 C01–C03。");
    if (!Array.isArray(planning.visible_evidence) || planning.visible_evidence.length < 1 || planning.visible_evidence.length > 2 || !planning.visible_evidence.every((item) => isText(item))) errors.push("visible_evidence 必须包含 1–2 项可见依据。");
  }

  const work = input.work;
  if (!isRecord(work)) errors.push("缺少 work。");
  else {
    for (const field of ["institution", "object_id", "title", "creator", "date", "medium"] as const) if (!isText(work[field])) errors.push(`work.${field} 不能为空。`);
    if (!isHttpUrl(work.source_url)) errors.push("work.source_url 必须是有效网址。");
  }

  const article = input.article;
  if (!isRecord(article)) errors.push("缺少 article。");
  else {
    for (const field of ["title", "introduction", "history", "connection", "question"] as const) if (!isText(article[field])) errors.push(`article.${field} 不能为空。`);
    if (!records(article.observations) || article.observations.length < 1 || article.observations.length > 2) errors.push("article.observations 必须包含 1–2 项观察。");
    else article.observations.forEach((item, index) => {
      if (!isText(item.heading) || !isText(item.body)) errors.push(`article.observations[${index}] 不完整。`);
      if (!Array.isArray(item.asset_ids) || !item.asset_ids.every(isText)) errors.push(`article.observations[${index}].asset_ids 无效。`);
      if (item.crop !== undefined && !validCrop(item.crop)) errors.push(`article.observations[${index}].crop 必须是 0–1 范围内的有效矩形。`);
    });
  }

  if (!records(input.claims) || input.claims.length < 1) errors.push("claims 至少包含一项论断。");
  else input.claims.forEach((claim, index) => {
    if (!isText(claim.claim_id) || !isText(claim.text)) errors.push(`claims[${index}] 不完整。`);
    if (!hasOnly(claim.kind, ["visible_fact", "historical_fact", "editorial_interpretation"] as const)) errors.push(`claims[${index}].kind 无效。`);
    if (!Array.isArray(claim.evidence_urls) || !claim.evidence_urls.every(isHttpUrl)) errors.push(`claims[${index}].evidence_urls 无效。`);
    if (!hasOnly(claim.verification_status, ["verified", "needs_review", "blocked"] as const)) errors.push(`claims[${index}].verification_status 无效。`);
    if (claim.verification_status !== "verified") blockers.push(`论断 ${String(claim.claim_id || index + 1)} 尚未通过核查。`);
  });

  if (!records(input.assets) || input.assets.length < 1) errors.push("assets 至少包含一张主图。");
  else {
    const assetIds = new Set<string>();
    const mainAssets = input.assets.filter((asset) => asset.role === "main");
    if (mainAssets.length !== 1) errors.push("必须且只能提供一张主图。");
    input.assets.forEach((asset, index) => {
      for (const field of ["asset_id", "rights_statement", "attribution", "alt"] as const) if (!isText(asset[field])) errors.push(`assets[${index}].${field} 不能为空。`);
      const assetId = typeof asset.asset_id === "string" ? asset.asset_id : "";
      if (isText(assetId)) {
        if (assetIds.has(assetId)) errors.push(`assets[${index}].asset_id 重复。`);
        assetIds.add(assetId);
      }
      for (const field of ["image_url", "source_page", "license_url"] as const) if (!isHttpUrl(asset[field])) errors.push(`assets[${index}].${field} 必须是有效网址。`);
      if (!hasOnly(asset.role, ["main", "detail", "comparison"] as const)) errors.push(`assets[${index}].role 无效。`);
      if (!Number.isInteger(asset.width) || Number(asset.width) <= 0 || !Number.isInteger(asset.height) || Number(asset.height) <= 0) errors.push(`assets[${index}] 必须记录有效宽高。`);
      if (!hasOnly(asset.availability_status, ["verified", "needs_review", "blocked"] as const)) errors.push(`assets[${index}].availability_status 无效。`);
      if (asset.crop !== null) {
        if (!validCrop(asset.crop)) errors.push(`assets[${index}].crop 必须是 0–1 范围内的有效矩形。`);
      }
      if (asset.availability_status !== "verified") blockers.push(`图片 ${String(asset.asset_id || index + 1)} 尚未通过可用性核查。`);
    });
    if (isRecord(article) && records(article.observations)) article.observations.forEach((observation, observationIndex) => {
      if (Array.isArray(observation.asset_ids)) observation.asset_ids.forEach((assetId) => {
        if (typeof assetId === "string" && !assetIds.has(assetId)) errors.push(`article.observations[${observationIndex}] 引用了不存在的图片 ${assetId}。`);
      });
    });
  }

  const quality = input.quality;
  if (!isRecord(quality)) errors.push("缺少 quality。");
  else {
    if (!isText(quality.editorial_guideline_version) || !isText(quality.generated_at) || Number.isNaN(Date.parse(String(quality.generated_at)))) errors.push("quality 规范版本或生成时间无效。");
    if (!records(quality.checks) || quality.checks.length < 1) errors.push("quality.checks 不能为空。");
    else quality.checks.forEach((check) => { if (check.status !== "passed") blockers.push(`自动检查 ${String(check.check_id || "unknown")} 尚未通过。`); });
    if (!Array.isArray(quality.blockers) || !quality.blockers.every(isText)) errors.push("quality.blockers 无效。");
    else blockers.push(...quality.blockers);
    if (!Array.isArray(quality.human_review_items) || !quality.human_review_items.every(isText)) errors.push("quality.human_review_items 无效。");
  }

  const uniqueBlockers = [...new Set(blockers)];
  return { valid: errors.length === 0, readyForOwnerReview: errors.length === 0 && uniqueBlockers.length === 0, errors, blockers: uniqueBlockers, value: errors.length === 0 ? input as LearningPackageV2 : undefined };
}
