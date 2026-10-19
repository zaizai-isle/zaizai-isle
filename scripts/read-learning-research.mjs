// Read the latest unreviewed research candidates; this script never publishes them.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "data/learning/research/latest.json");

try {
  const record = JSON.parse(await readFile(path, "utf8"));
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
  if (error?.code === "ENOENT") {
    console.error("No latest.json yet. Run Daily Learning Research Collection once or wait for its next successful schedule.");
  } else {
    console.error("Unable to read research candidates:", error.message);
  }
  process.exitCode = 1;
}
