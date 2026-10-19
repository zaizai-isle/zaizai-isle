import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.90.1";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, apikey, content-type" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return json({});
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const secret = Deno.env.get("GEMINI_API_KEY") || "";
  const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt || !url || !anon) return json({ error: "Unauthorized" }, 401);
  const client = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return json({ error: "Unauthorized" }, 401);
  const { data: owner, error: ownerError } = await client.from("island_owner_accounts").select("user_id").eq("user_id", user.id).maybeSingle();
  if (ownerError || !owner) return json({ error: "Owner access required" }, 403);
  if (!secret) return json({ error: "Missing GEMINI_API_KEY Supabase Edge Function secret. No draft was created." }, 503);
  let payload: unknown;
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const source = (payload as { source?: Record<string, unknown> })?.source;
  if (!source || typeof source !== "object" || !/^(met|artic|cleveland|smk|loc):[\w.-]+$/.test(String(source.source_id ?? ""))) return json({ error: "Invalid source_id" }, 400);
  for (const key of ["title", "source_url", "image_url"]) {
    if (typeof source[key] !== "string" || !source[key] || String(source[key]).length > 2000) return json({ error: `Invalid ${key}` }, 400);
  }
  if (JSON.stringify(source).length > 16000) return json({ error: "Source record too large" }, 400);
  if (!String(source.source_url).startsWith("https://") || !String(source.image_url).startsWith("https://")) return json({ error: "HTTPS source URLs required" }, 400);

  const prompt = `你是每日一看项目的艺术与设计作品内容编辑。根据提供的馆藏记录，为读者写一篇中文单件作品观察草稿。
必须采用宽松 ASD-STE100 风格：短句、主体明确、术语一致、无比喻与营销修辞。
叙事：先看→发现→理解→连接→回应。一个核心问题，1到2个具体观察。
严格区分馆藏来源提供的事实与推断。只根据给定馆藏记录确立作品名称、作者、年代、媒介和来源。
不要编造作品图像中不可从记录核实的细节，也不要编造研究文献、版权许可、作者动机或历史影响。
如果缺少图像观察依据，应在 editorial_warnings 中注明“视觉细节需核对原图”。
未提供可靠史实来源时，历史解释保持审慎，并标记需复核。图片使用许可永远标记为未审核。
请输出单个 JSON 对象，不要 markdown 代码块。
JSON 字段：title,subject,creator,era,medium,intro,observations(数组，包含 title 与 text),context,connection,question,editorial_warnings(字符串数组),references(数组，每项包含 label,url),observation_code,history_node。
观察与历史分类标记仅为建议。source record: ${JSON.stringify(source)}`;

  const model = Deno.env.get("DAILY_LEARNING_MODEL") || "gemini-2.5-flash";
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": secret },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.35 } }),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!resp) return json({ error: "Generation request timed out" }, 504);
  if (!resp.ok) return json({ error: `Model request failed (${resp.status})` }, 502);
  const result = await resp.json();
  const raw = result.candidates?.[0]?.content?.parts?.find((part: {text?: string}) => part.text)?.text;
  if (!raw) return json({ error: "Model returned no content" }, 502);
  let content: Record<string, unknown>;
  try { content = JSON.parse(raw); } catch { return json({ error: "Model output was not JSON" }, 502); }
  if (typeof content.title !== "string" || typeof content.intro !== "string" || !Array.isArray(content.observations) || !Array.isArray(content.editorial_warnings)) return json({ error: "Incomplete draft output" }, 502);
  content = {
    ...content,
    source_url: source.source_url,
    image_url: source.image_url,
    source_id: source.source_id,
    rights_verified: false,
  };
  const { data: existing } = await client.from("daily_learning_article_drafts").select("version").eq("source_id", source.source_id).order("version", { ascending: false }).limit(1);
  const version = Number(existing?.[0]?.version ?? 0) + 1;
  const { data: inserted, error } = await client.from("daily_learning_article_drafts").insert({
    owner_id: user.id, source_id: source.source_id, source_record: source, content, version,
    status: "pending_review", image_permission_verified: false, historical_sources_verified: false,
  }).select("id,version,status").single();
  if (error) return json({ error: `Draft save failed: ${error.message}` }, 500);
  return json({ draft: inserted });
});
