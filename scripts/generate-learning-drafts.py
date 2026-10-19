#!/usr/bin/env python3
"""Create review-only article drafts from today's public catalog candidates.

Required env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
The script never publishes, never approves a draft, and never exports private drafts to Git.
"""
from __future__ import annotations
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "data/learning/research/latest.json"
MODEL = os.environ.get("LEARNING_GEMINI_MODEL", "gemini-2.5-flash")


def call(url: str, headers: dict[str, str], body: dict | None = None, method: str = "GET"):
    data = json.dumps(body, ensure_ascii=False).encode() if body is not None else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=90) as response:
            raw = response.read().decode()
        return json.loads(raw) if raw else None
    except HTTPError as err:
        raise RuntimeError(f"HTTP {err.code} from {url.split('?')[0]}: {err.read(250).decode(errors='replace')}") from err


def generate(candidate: dict, theme: dict, api_key: str) -> dict:
    prompt = {
        "role": "每日一看艺术与设计史内容编辑。输出完整的中文单件作品观察草稿，供岛主审核。不得宣称完成图片授权或史料核实。",
        "style": "面向读者的文章使用自然简明中文；编辑元数据客观。每篇一件作品、一个可核对的视觉问题。",
        "object": candidate,
        "research_theme": theme,
        "requirements": [
            "必须包含 title,subject,summary,observation,context,connection,question,sources 字段。",
            "观察必须以来源中可核实的视觉证据为依据；没有实际观察图片时，不得编造视觉细节。",
            "除馆藏元数据外缺少史料时，在 context 明确标注待核实，不作无依据的历史影响推断。",
            "sources 是数组，每条记录包含 url,claim,verification_status，状态只能 pending_verification。",
            "不得编造引用来源、图片版权或照片中人物的思想。",
            "建议文章总长 500—900 中文字，不要套用固定五段标题。",
        ],
    }
    body = {
        "contents": [{"role": "user", "parts": [{"text": json.dumps(prompt, ensure_ascii=False)}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.35,
        },
    }
    result = call(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={quote(api_key)}",
        {"Content-Type": "application/json"}, body, "POST",
    )
    candidates = result.get("candidates") or []
    parts = (candidates[0].get("content") or {}).get("parts") if candidates else None
    if not parts or not isinstance(parts[0].get("text"), str):
        raise RuntimeError("Model did not return a JSON article.")
    draft = json.loads(parts[0]["text"])
    required = ("title", "subject", "summary", "observation", "context", "connection", "question", "sources")
    if any(not isinstance(draft.get(key), (str if key != "sources" else list)) for key in required):
        raise RuntimeError("Draft missing required fields.")
    if not all(isinstance(row, dict) and row.get("verification_status") == "pending_verification" for row in draft["sources"]):
        raise RuntimeError("Invalid evidence status")
    return draft


def main() -> int:
    variables = ("GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
    missing = [name for name in variables if not os.environ.get(name)]
    if missing:
        print(f"Article generation not configured: {', '.join(missing)}", file=sys.stderr)
        return 2
    if not RESEARCH.exists():
        print("No research JSON. The collection job must finish first.", file=sys.stderr)
        return 3
    record = json.loads(RESEARCH.read_text(encoding="utf-8"))
    if record.get("schema_version") != 1 or record.get("status") != "research_candidates_only":
        raise RuntimeError("Unexpected source schema.")
    base = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1"
    token = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {
        "apikey": token, "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    owner = call(base + "/island_owner_accounts?select=user_id&limit=2", headers)
    if not isinstance(owner, list) or len(owner) != 1:
        raise RuntimeError("Expected exactly one provisioned island owner.")
    owner_id = owner[0]["user_id"]
    count = 0
    for candidate in record.get("items", [])[:3]:
        source_id = candidate.get("source_id")
        if not isinstance(source_id, str):
            continue
        existing_url = (base + "/daily_learning_article_drafts?select=id&owner_id=eq."
                        + quote(owner_id) + "&source_id=eq." + quote(source_id, safe="") + "&limit=1")
        if call(existing_url, headers):
            continue
        try:
            content = generate(candidate, record.get("theme") or {}, os.environ["GEMINI_API_KEY"])
            call(base + "/daily_learning_article_drafts", {
                **headers, "Prefer": "return=minimal",
            }, {
                "owner_id": owner_id,
                "source_id": source_id,
                "source_record": candidate,
                "content": content,
                "status": "pending_review",
                "version": 1,
                "image_permission_verified": False,
                "historical_sources_verified": False,
            }, "POST")
            count += 1
            print("Stored unapproved draft", source_id)
        except (RuntimeError, ValueError, KeyError) as error:
            print(f"Skipped {source_id}: {error}", file=sys.stderr)
    print(f"Saved {count} draft(s) for owner review. Nothing was approved or published.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
