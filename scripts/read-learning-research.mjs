// Read the latest unreviewed research candidates from Supabase Storage; this script never publishes them.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function supabaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (fromEnv) return fromEnv.trim().replace(/\/$/, "");
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, "utf8").match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
    if (match) return match[1].trim().replace(/\/$/, "");
  }
  return null;
}

const base = supabaseUrl();
if (!base) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL (env or .env.local).");
  process.exit(1);
}
const url = `${base}/storage/v1/object/public/learning-research/latest.json`;

try {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.httpStatus = response.status;
    throw error;
  }
  const record = await response.json();
  if (record.schema_version !== 1 || record.status !== "research_candidates_only" || !Array.isArray(record.items)) {
    throw new Error("Unrecognized research candidate format");
  }
  const candidates = record.items.filter((item) =>
    typeof item.source_id === "string" &&
    typeof item.title === "string" &&
    item.review_status === "needs_editorial_review" &&
    item.rights?.image_permission_verified === false
  );
  if (process.argv.includes("--json")) {
    process.stdout.write(JSON.stringify({ research_date: record.research_date, candidates }, null, 2) + "\n");
  } else {
    console.log("Research date:", record.research_date);
    console.log("Unreviewed candidates:", candidates.length);
    for (const item of candidates) {
      console.log(item.source_id, "|", item.title, "|", item.source_url);
    }
    console.log("Not suitable for direct publication; approval is required.");
  }
} catch (error) {
  if (error?.httpStatus === 400 || error?.httpStatus === 404) {
    console.error("No latest.json in Supabase Storage yet. Run Daily Learning Research Collection once or wait for its next successful schedule.");
  } else {
    console.error("Unable to read research candidates:", error.message);
  }
  process.exitCode = 1;
}
