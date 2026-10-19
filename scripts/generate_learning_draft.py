#!/usr/bin/env python3
"""Produce one owner-private unreviewed article from collected museum metadata."""
import json
import os
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/learning/research/latest.json"
NEEDED = ["GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "LEARNING_OWNER_ID"]

def call(url, method="GET", data=None, headers=None):
    payload = None if data is None else json.dumps(data, ensure_ascii=False).encode()
    with urlopen(Request(url, data=payload, method=method, headers=headers or {}), timeout=65) as response:
        return json.load(response)

def main():
    missing = [key for key in NEEDED if not os.getenv(key)]
    if missing:
        print("Auto draft skipped. Missing GitHub Actions Secrets: " + ", ".join(missing))
        return 0
    if not DATA.exists():
        print("Auto draft skipped. latest.json has not been collected.")
        return 0
    record = json.loads(DATA.read_text(encoding="utf-8"))
    if record.get("schema_version") != 1 or record.get("status") != "research_candidates_only":
        print("Auto draft skipped. Unsupported catalog data.")
        return 0
    base = os.environ["SUPABASE_URL"].rstrip("/")
    secret = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {"apikey":secret, "Authorization":"Bearer "+secret, "content-type":"application/json"}
    candidates = record.get("items", [])
    for item in candidates:
        sid = item.get("source_id")
        if not sid or item.get("review_status") != "needs_editorial_review":
            continue
        existing = call(base + "/rest/v1/daily_learning_article_drafts?source_id=eq." + quote(sid, safe="") + "&select=id&limit=1", headers=headers)
        if existing:
            continue
        prompt = (
            "编写《每日一看》完整单件作品观察草稿。宽松 ASD-STE100，中文短句。"
            "仅使用馆藏目录元数据，不得杜撰视觉细节、史实、影响关系、图片许可或其他来源。"
            "按先看、发现、理解、连接、回应组织。用户单篇阅读约2至3分钟。"
            "史料不足时明确写进 editorial_caveats，避免强行断言。"
            "返回 JSON：title,subject,creator,era,introduction,observations(2个 heading/body),history,connection,question,editorial_caveats(数组)。"
            "馆藏元数据：" + json.dumps(item,ensure_ascii=False)
        )
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        url = "https://generativelanguage.googleapis.com/v1beta/models/" + quote(model) + ":generateContent"
        result = call(url, "POST", {
            "contents":[{"parts":[{"text":prompt}]}],
            "generationConfig":{"responseMimeType":"application/json","temperature":0.4}
        }, {"x-goog-api-key":os.environ["GEMINI_API_KEY"],"content-type":"application/json"})
        message = "".join(part.get("text","") for part in result["candidates"][0]["content"]["parts"])
        article = json.loads(message)
        required = ["title","subject","creator","era","introduction","history","connection","question"]
        if any(not isinstance(article.get(k),str) or not article[k].strip() for k in required):
            raise ValueError("Model response lacks required article fields")
        if not isinstance(article.get("observations"),list) or len(article["observations"])<1:
            raise ValueError("Missing observations")
        draft = {
            "owner_id":os.environ["LEARNING_OWNER_ID"],"source_id":sid,
            "source_record":item,"content":article,"version":1,"status":"pending_review",
            "image_permission_verified":False,"historical_sources_verified":False
        }
        call(base+"/rest/v1/daily_learning_article_drafts","POST",draft,
             {**headers,"Prefer":"return=representation"})
        print("Created unreviewed private draft:",sid)
        return 0
    print("No new candidate eligible for article draft.")
    return 0

if __name__ == "__main__":
    try: sys.exit(main())
    except (HTTPError, KeyError, ValueError, TimeoutError) as error:
        print("Draft production failed:",error, file=sys.stderr); sys.exit(1)
