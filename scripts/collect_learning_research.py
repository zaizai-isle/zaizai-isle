#!/usr/bin/env python3
"""Collect public museum catalog candidates for editorial review."""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "learning" / "research"
TZ = ZoneInfo("Asia/Tokyo")
THEMES = [
    ("A01", "H01", "landscape", "构图与空间"),
    ("A02", "H01", "portrait", "比例与尺度"),
    ("A03", "H02", "woodblock", "色彩与光影"),
    ("A04", "H10", "poster", "线条、形态与节奏"),
    ("A05", "H03", "furniture", "材料、结构与功能"),
    ("A06", "H02", "calligraphy", "文字、符号与图文关系"),
    ("A07", "H11", "map", "信息组织与视觉秩序"),
    ("A08", "H06", "photograph", "叙事、象征与情绪"),
]
HEADERS = {
    "User-Agent": "ZaizaiIsleLearningResearch/0.1 (public museum metadata)",
    "Accept": "application/json",
}


def get_json(url: str) -> dict:
    error = None
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers=HEADERS), timeout=18) as response:
                return json.load(response)
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            error = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Request failed for {url.split('?')[0]}: {error}")


def collect_artic(query: str, seen: set[str]) -> list[dict]:
    params = {
        "q": query,
        "query[term][is_public_domain]": "true",
        "limit": 18,
        "fields": "id,title,artist_display,date_display,medium_display,image_id,is_public_domain,api_link",
    }
    result = get_json("https://api.artic.edu/api/v1/artworks/search?" + urlencode(params))
    iiif = result.get("config", {}).get("iiif_url", "https://www.artic.edu/iiif/2")
    items = []
    for obj in result.get("data", []):
        key = f'artic:{obj.get("id")}'
        if key in seen or obj.get("is_public_domain") is not True or not obj.get("image_id"):
            continue
        items.append({
            "source_id": key, "source": "artic",
            "title": obj.get("title"), "creator": obj.get("artist_display"),
            "date": obj.get("date_display"), "medium": obj.get("medium_display"),
            "source_url": f'https://www.artic.edu/artworks/{obj["id"]}',
            "catalog_api_url": obj.get("api_link"),
            "image_url": f'{iiif}/{obj["image_id"]}/full/843,/0/default.jpg',
            "rights": {"catalog_public_domain": True, "image_permission_verified": False},
            "review_status": "needs_editorial_review",
        })
        if len(items) >= 3:
            break
    return items


def collect_met(query: str, seen: set[str]) -> list[dict]:
    params = {
        "q": query, "hasImages": "true", "isPublicDomain": "true",
        "limit": "24", "offset": "0",
    }
    search = get_json(
        "https://collectionapi.metmuseum.org/public/collection/v1/search?" + urlencode(params)
    )
    items = []
    for object_id in (search.get("objectIDs") or [])[:12]:
        if f"met:{object_id}" in seen:
            continue
        try:
            obj = get_json(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}")
        except RuntimeError:
            continue
        if obj.get("isPublicDomain") is not True or not obj.get("primaryImage"):
            continue
        items.append({
            "source_id": f"met:{object_id}", "source": "met",
            "title": obj.get("title"), "creator": obj.get("artistDisplayName"),
            "date": obj.get("objectDate"), "medium": obj.get("medium"),
            "source_url": obj.get("objectURL") or f"https://www.metmuseum.org/art/collection/search/{object_id}",
            "catalog_api_url": f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}",
            "image_url": obj.get("primaryImageSmall") or obj.get("primaryImage"),
            "rights": {"catalog_public_domain": True, "image_permission_verified": False},
            "review_status": "needs_editorial_review",
        })
        if len(items) >= 3:
            break
        time.sleep(0.2)
    return items


def main() -> int:
    now = datetime.now(TZ)
    date = now.date().isoformat()
    run_path = OUT / "runs" / f"{date}.json"
    if run_path.exists():
        print(f"Already collected {date}. No changes.")
        return 0
    index_path = OUT / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {
        "schema_version": 1, "seen_ids": [], "runs": []
    }
    seen = set(index.get("seen_ids", []))
    code, history_node, query, theme_name = THEMES[now.toordinal() % len(THEMES)]
    items, warnings = [], []
    for source, fetcher in [("artic", collect_artic), ("met", collect_met)]:
        try:
            items.extend(fetcher(query, seen))
        except RuntimeError as exc:
            warnings.append(f"{source}: {exc}")
    items = items[:5]
    if not items:
        print("No catalog candidates. Retry at next run.", file=sys.stderr)
        for warning in warnings:
            print(warning, file=sys.stderr)
        return 1
    run = {
        "schema_version": 1,
        "status": "research_candidates_only",
        "generated_at": now.isoformat(timespec="seconds"),
        "research_date": date,
        "theme": {
            "observation_code": code,
            "observation_name": theme_name,
            "history_node": history_node,
            "query": query,
        },
        "items": items,
        "warnings": warnings,
        "notes": "Unreviewed catalog metadata. No images downloaded. No content approved or published.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    run_path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(run, ensure_ascii=False, indent=2) + "\n"
    run_path.write_text(data, encoding="utf-8")
    (OUT / "latest.json").write_text(data, encoding="utf-8")
    index["seen_ids"] = list(dict.fromkeys(index.get("seen_ids", []) + [
        item["source_id"] for item in items
    ]))[-1000:]
    index["runs"] = list(dict.fromkeys(index.get("runs", []) + [
        f"runs/{date}.json"
    ]))[-90:]
    index["last_research_date"] = date
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Collected {len(items)} candidates: {date}, {code}/{history_node}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
