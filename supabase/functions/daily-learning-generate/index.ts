import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function response(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...CORS, "content-type": "application/json" } }); }
function str(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const modelKey = Deno.env.get("GEMINI_API_KEY");
  if (!url || !anonKey) return response({ error: "Supabase environment unavailable" }, 503);
  if (!modelKey) return response({ error: "GEMINI_API_KEY is not configured" }, 503);
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return response({ error: "Authentication required" }, 401);
  const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return response({ error: "Invalid session" }, 401);
  const { data: owner, error: ownerError } = await client.from("island_owner_accounts").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (ownerError || !owner) return response({ error: "Owner access required" }, 403);

  let payload: { candidate?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return response({ error: "Invalid JSON" }, 400); }
  const candidate = payload.candidate;
  if (!candidate || typeof candidate !== "object") return response({ error: "Candidate required" }, 400);
  const title = str(candidate.title);
  const sourceId = str(candidate.source_id);
  const sourceUrl = str(candidate.source_url);
  const imageUrl = str(candidate.image_url);
  if (!title || !/^(met|artic|cleveland|smk|loc):[a-zA-Z0-9_.-]+$/.test(sourceId) || !sourceUrl.startsWith("https://") || !imageUrl.startsWith("https://")) {
    return response({ error: "Invalid candidate" }, 400);
  }
  if (candidate.review_status !== "needs_editorial_review") return response({ error: "Not a research candidate" }, 400);

  // A candidate never supplies publishing rights or verified historical claims.
  const instruction = [
    "你是《每日一看》的内容编辑。请用宽松 ASD-STE100 风格撰写一篇完整、短句、无修辞的中文单件作品观察草稿。",
    "遵循：先看→发现→理解→连接→回应。用具体可见细节提出一个观察问题；事实与推断必须区分。",
    "你只能使用下列馆藏元数据，不得编造可见细节、历史影响、作者意图、馆藏版权或引用来源。",
    "如果资料不能支持细节，必须在 editorial_caveats 中明确说明，正文只作审慎表述。",
    "不要声称图片已获使用许可。所有草稿均需史实审核及图片许可核查。",
    "输出 JSON 对象，字段为 title,subject,creator,era,introduction,observations,history,connection,question,editorial_caveats。",
    "observations 是两个对象的数组，每个包含 heading 与 body。",
    "intro、observations、history、connection 等正文内容应足够形成一篇约2至3分钟的完整短文。",
    "不要生成任何 Markdown 图片、假链接或占位引用。",
    "馆藏资料：" + JSON.stringify({ source_id:sourceId,title,creator:candidate.creator,date:candidate.date,medium:candidate.medium,source_url:sourceUrl,source_note:candidate.rights }),
  ].join("\n");

  try {
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash";
    const api = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const generated = await fetch(api, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": modelKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instruction }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!generated.ok) return response({ error: "Content generation failed", status: generated.status }, 502);
    const result = await generated.json();
    const text = result.candidates?.[0]?.content?.parts?.map((p: {text?: string}) => p.text || "").join("");
    const article = JSON.parse(text);
    const required = ["title","subject","creator","era","introduction","history","connection","question"];
    if (required.some((field) => !str(article[field])) || !Array.isArray(article.observations) || article.observations.length < 1) {
      return response({ error: "Generated content was incomplete" }, 502);
    }
    const { data: lastVersion, error: versionError } = await client
      .from("daily_learning_article_drafts").select("version").eq("source_id",sourceId)
      .order("version",{ascending:false}).limit(1);
    if (versionError) return response({ error: "Draft lookup failed" }, 500);
    const version = (lastVersion?.[0]?.version ?? 0) + 1;
    const { data: row, error: saveError } = await client.from("daily_learning_article_drafts")
      .insert({
        owner_id: auth.user.id,
        source_id:sourceId,
        source_record:candidate,
        content:article,
        version,
        status:"pending_review",
        image_permission_verified:false,
        historical_sources_verified:false,
      }).select("id,version,status").single();
    if(saveError) return response({ error: "Draft save failed: "+saveError.message }, 500);
    return response({ draft:row, note:"Draft only. Verify source claims and image permissions before approval." }, 201);
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Generation failed" }, 500);
  }
});
