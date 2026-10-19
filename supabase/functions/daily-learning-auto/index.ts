import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.90.1";
import { jwtVerify, createRemoteJWKSet } from "npm:jose@6.1.2";

const TARGET = "https://luudxrfzwwirsszqtgiu.supabase.co/functions/v1/daily-learning-auto";
const REPO = "zaizai-isle/zaizai-isle";
const WORKFLOW = REPO + "/.github/workflows/daily-learning-research.yml@refs/heads/main";
const GITHUB_KEYS = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));
const REPLY = (body: unknown,status=200) => new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});
const str = (v: unknown) => typeof v==="string"?v.trim():"";


const IMAGE_HOSTS = new Set([
  "images.metmuseum.org", "www.artic.edu", "openaccess-cdn.clevelandart.org",
  "iip-thumb.smk.dk", "api.smk.dk", "www.loc.gov", "tile.loc.gov", "cdn.loc.gov"
]);
async function getImageInput(imageUrl: unknown) {
  try {
    const url=new URL(String(imageUrl||""));
    if(url.protocol!=="https:" || !IMAGE_HOSTS.has(url.hostname))return null;
    const result=await fetch(url,{signal:AbortSignal.timeout(12000)});
    if(!result.ok)return null;
    const mime=(result.headers.get("content-type")||"").split(";")[0].trim();
    if(!["image/jpeg","image/png","image/webp"].includes(mime))return null;
    const length=Number(result.headers.get("content-length")||0);
    if(length>4000000)return null;
    const buffer=await result.arrayBuffer();
    if(buffer.byteLength>4000000)return null;
    const bytes=new Uint8Array(buffer);
    let binary="";
    for(let offset=0;offset<bytes.length;offset+=8192){
      binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
    }
    return {inlineData:{mimeType:mime,data:btoa(binary)}};
  }catch{return null;}
}

Deno.serve(async (req: Request) => {
  if(req.method!=="POST")return REPLY({error:"Method not allowed"},405);
  const auth=req.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return REPLY({error:"Missing OIDC token"},401);
  try {
    const {payload}=await jwtVerify(auth.slice(7),GITHUB_KEYS,{
      issuer:"https://token.actions.githubusercontent.com",audience:TARGET
    });
    if(payload.repository!==REPO || payload.ref!=="refs/heads/main"
      || payload.workflow_ref!==WORKFLOW
      || !["schedule","workflow_dispatch"].includes(String(payload.event_name||""))) {
      return REPLY({error:"Unauthorized workflow"},403);
    }
  } catch {
    return REPLY({error:"Invalid workflow identity"},401);
  }
  const url=Deno.env.get("SUPABASE_URL");
  const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const gemini=Deno.env.get("GEMINI_API_KEY");
  if(!url||!secret)return REPLY({error:"Supabase configuration is incomplete"},503);
  if(!gemini)return REPLY({error:"GEMINI_API_KEY not configured"},503);
  let item: Record<string,unknown>;
  try {
    const body=await req.json();
    item=body?.candidate;
    if(!item||typeof item!=="object")throw Error("no item");
  } catch{return REPLY({error:"Invalid candidate"},400)}
  const sourceId=str(item.source_id);
  if(!/^(met|artic|cleveland|smk|loc):[a-zA-Z0-9_.-]+$/.test(sourceId)
    || !str(item.source_url).startsWith("https://")
    || !str(item.image_url).startsWith("https://")
    || item.review_status!=="needs_editorial_review")return REPLY({error:"Invalid catalog record"},400);
  const db=createClient(url,secret,{auth:{persistSession:false}});
  const {data:owners,error:ownerError}=await db.from("island_owner_accounts").select("user_id").limit(2);
  if(ownerError||owners?.length!==1)return REPLY({error:"Owner configuration invalid"},503);
  const ownerId=owners[0].user_id;
  const {data:existing,error:existsError}=await db.from("daily_learning_article_drafts")
    .select("id").eq("owner_id",ownerId).eq("source_id",sourceId).limit(1);
  if(existsError)return REPLY({error:"Draft lookup failed"},500);
  if(existing?.length)return REPLY({status:"skipped_existing",source_id:sourceId});
  const prompt=[
    "你为《每日一看》编写待审核的中文单件作品观察文章。",
    "严格使用宽松 ASD-STE100 风格：短句、一个句子一条事实、主体明确、不使用修辞。",
    "单篇逻辑：先看、发现、理解、连接、回应。一个核心观察问题，两个观察段落，简短必要历史背景，当代观察迁移和开放反馈问题。",
    "只能使用下面的馆藏元数据。无法从元数据直接验证的视觉细节、创作者意图、历史影响必须明确标为待核实，不要编造。",
    "不能把公共领域标识直接认作可以发布；图片许可状态必须由人核实。",
    "不要虚构来源或引用。不要生成Markdown图片、HTML或站点发布指令。",
    "输出严格 JSON 对象，字段 title,subject,creator,era,introduction,observations,history,connection,question,editorial_caveats,sources。",
    "observations 为两项对象数组，每项含 heading 和 body。sources 为字符串数组，只能包含实际馆藏链接。",
    "馆藏元数据："+JSON.stringify({
      source_id:sourceId,title:item.title,creator:item.creator,date:item.date,medium:item.medium,
      source_url:item.source_url,catalog_api_url:item.catalog_api_url,rights:item.rights
    })
  ].join("\n");
  const imageInput=await getImageInput(item.image_url);
  const model=Deno.env.get("GEMINI_MODEL")||"gemini-3.8-flash";
  let generated: Response;
  try {
    generated=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent",{
      method:"POST",headers:{"content-type":"application/json","x-goog-api-key":gemini},
      body:JSON.stringify({contents:[{parts:[{text:prompt},...(imageInput?[imageInput]:[])]}],generationConfig:{temperature:0.35,responseMimeType:"application/json"}}),
      signal:AbortSignal.timeout(45000)
    });
  } catch{return REPLY({error:"Text generation unavailable"},502)}
  if(!generated.ok)return REPLY({error:"Generation API failed",provider_status:generated.status},502);
  let content: Record<string,unknown>;
  try {
    const result=await generated.json();
    const text=result.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")||"";
    content=JSON.parse(text);
  }catch{return REPLY({error:"Invalid generated JSON"},502)}
  const required=["title","subject","introduction","history","connection","question"];
  if(required.some(k=>!str(content[k]))||!Array.isArray(content.observations)||content.observations.length<1)
    return REPLY({error:"Generated article incomplete"},502);
  const {data,error}=await db.from("daily_learning_article_drafts").insert({
    owner_id:ownerId,source_id:sourceId,source_record:item,content,version:1,status:"pending_review",
    image_permission_verified:false,historical_sources_verified:false
  }).select("id,version,status").single();
  if(error){
    if(error.code==="23505")return REPLY({status:"skipped_existing",source_id:sourceId});
    return REPLY({error:"Draft persistence failed"},500);
  }
  return REPLY({status:"draft_created",draft:data},201);
});