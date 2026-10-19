#!/usr/bin/env python3
"""Collect unreviewed public museum candidates. Never publish them automatically."""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "learning" / "research"
TZ = ZoneInfo("Asia/Tokyo")
MAX_ITEMS = 5
THEMES = [
    ("A01", "H01", "landscape", "构图与空间"),
    ("A02", "H01", "portrait", "比例与尺度"),
    ("A03", "H02", "woodblock", "色彩与光影"),
    ("A04", "H10", "poster", "线条、形态与节奏"),
    ("A05", "H03", "furniture", "材料、结构与功能"),
    ("A06", "H02", "calligraphy", "文字、符号与图文关系"),
    ("A07", "H11", "map", "信息组织与视觉秩序"),
    ("A08", "H05", "photograph", "叙事、象征与情绪"),
]
HEADERS = {
    "User-Agent": "ZaizaiIsleLearningResearch/0.2 (public catalog metadata)",
    "Accept": "application/json",
}
SOURCES = ("met", "artic", "cleveland", "smk", "loc")


def get_json(url: str) -> dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers=HEADERS), timeout=18) as response:
                result = json.load(response)
                if not isinstance(result, dict):
                    raise ValueError("Expected a JSON object")
                return result
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            last_error = error
            if attempt < 2:
                time.sleep(1 + attempt)
    raise RuntimeError(f"API unavailable: {url.split('?')[0]}: {last_error}")


def first_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        return ", ".join(filter(None, (first_text(v) for v in value[:4])))
    if isinstance(value, dict):
        for key in ("title", "name", "description", "period", "value", "creator"):
            if value.get(key):
                return first_text(value[key])
    return ""


def candidate(
    source: str,
    object_id: Any,
    title: Any,
    creator: Any,
    date: Any,
    medium: Any,
    source_url: str,
    catalog_api_url: str,
    image_url: str,
    catalog_public_domain: bool | None,
    original_rights_note: str = "",
) -> dict[str, Any] | None:
    if not object_id or not first_text(title) or not source_url or not image_url:
        return None
    if not source_url.startswith("https://") or not image_url.startswith("https://"):
        return None
    return {
        "source_id": f"{source}:{object_id}",
        "source": source,
        "title": first_text(title),
        "creator": first_text(creator),
        "date": first_text(date),
        "medium": first_text(medium),
        "source_url": source_url,
        "catalog_api_url": catalog_api_url,
        "image_url": image_url,
        "rights": {
            "catalog_public_domain": catalog_public_domain,
            "image_permission_verified": False,
            "source_rights_note": first_text(original_rights_note),
        },
        "review_status": "needs_editorial_review",
    }


def collect_met(query: str, seen: set[str]) -> list[dict[str, Any]]:
    # v1 was retired in October 2026. v1.1 is the supported paginated search.
    params = {"q": query, "hasImages": "true", "limit": 24, "offset": 0}
    url = "https://collectionapi.metmuseum.org/public/collection/v1.1/search?" + urlencode(params)
    ids = get_json(url).get("objectIDs") or []
    for object_id in ids[:12]:
        if f"met:{object_id}" in seen:
            continue
        try:
            obj = get_json(
                f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
            )
        except RuntimeError:
            continue
        if obj.get("isPublicDomain") is not True:
            continue
        item = candidate(
            "met", object_id, obj.get("title"), obj.get("artistDisplayName"),
            obj.get("objectDate"), obj.get("medium"),
            obj.get("objectURL") or f"https://www.metmuseum.org/art/collection/search/{object_id}",
            f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}",
            obj.get("primaryImageSmall") or obj.get("primaryImage") or "",
            True, "The Met Open Access; image use requires per-file review",
        )
        if item:
            return [item]
    return []


def collect_artic(query: str, seen: set[str]) -> list[dict[str, Any]]:
    params = {
        "q": query,
        "query[term][is_public_domain]": "true",
        "limit": 20,
        "fields": "id,title,artist_display,date_display,medium_display,image_id,is_public_domain,api_link",
    }
    url = "https://api.artic.edu/api/v1/artworks/search?" + urlencode(params)
    result = get_json(url)
    iiif = result.get("config", {}).get("iiif_url") or "https://www.artic.edu/iiif/2"
    for obj in result.get("data") or []:
        if obj.get("is_public_domain") is not True or not obj.get("image_id"):
            continue
        object_id = obj.get("id")
        if f"artic:{object_id}" in seen:
            continue
        item = candidate(
            "artic", object_id, obj.get("title"), obj.get("artist_display"),
            obj.get("date_display"), obj.get("medium_display"),
            f"https://www.artic.edu/artworks/{object_id}",
            obj.get("api_link") or f"https://api.artic.edu/api/v1/artworks/{object_id}",
            f'{iiif}/{obj["image_id"]}/full/843,/0/default.jpg',
            True, "Art Institute of Chicago public-domain catalog record",
        )
        if item:
            return [item]
    return []


def collect_cleveland(query: str, seen: set[str]) -> list[dict[str, Any]]:
    params = {"q": query, "cc0": "", "has_image": 1, "limit": 20}
    url = "https://openaccess-api.clevelandart.org/api/artworks/?" + urlencode(params)
    for obj in get_json(url).get("data") or []:
        if obj.get("share_license_status") != "CC0":
            continue
        object_id = obj.get("id")
        if f"cleveland:{object_id}" in seen:
            continue
        image = obj.get("images") or {}
        image_url = ((image.get("web") or {}).get("url")
                     or (image.get("print") or {}).get("url") or "")
        creators = obj.get("creators") or []
        creator = first_text(creators[0].get("description") or creators[0].get("name")) if creators and isinstance(creators[0], dict) else first_text(creators)
        item = candidate(
            "cleveland", object_id, obj.get("title"), creator,
            obj.get("creation_date"), obj.get("technique"),
            f'https://www.clevelandart.org/art/{obj.get("accession_number") or object_id}',
            f"https://openaccess-api.clevelandart.org/api/artworks/{object_id}",
            image_url, True, "Cleveland Museum of Art share_license_status=CC0",
        )
        if item:
            return [item]
    return []


def collect_smk(query: str, seen: set[str]) -> list[dict[str, Any]]:
    params = {
        "keys": query, "filters": "[public_domain:true],[has_image:true]",
        "offset": 0, "rows": 20, "lang": "en",
    }
    url = "https://api.smk.dk/api/v1/art/search/?" + urlencode(params)
    result = get_json(url)
    rows = result.get("items") or result.get("data") or result.get("results") or []
    for obj in rows:
        if not isinstance(obj, dict) or obj.get("public_domain") is not True:
            continue
        object_id = obj.get("object_number") or obj.get("id")
        if f"smk:{object_id}" in seen:
            continue
        titles = obj.get("titles") or obj.get("title")
        creator = obj.get("artist") or obj.get("production") or obj.get("creator")
        date = obj.get("production_date") or obj.get("dating")
        image_url = obj.get("image_thumbnail") or obj.get("image_native") or ""
        item = candidate(
            "smk", object_id, titles, creator, date,
            obj.get("techniques") or obj.get("materials") or obj.get("object_names"),
            f"https://open.smk.dk/artwork/image/{object_id}",
            f"https://api.smk.dk/api/v1/art/?object_number={object_id}&lang=en",
            image_url, True, "SMK public_domain=true; check image record",
        )
        if item:
            return [item]
    return []


def collect_loc(query: str, seen: set[str]) -> list[dict[str, Any]]:
    # Library of Congress results do not confer image-reuse permission.
    category = "maps" if query == "map" else "photos"
    params = {"q": query, "fo": "json", "c": 20}
    url = f"https://www.loc.gov/{category}/?" + urlencode(params)
    for obj in get_json(url).get("results") or []:
        source_url = obj.get("id") or ""
        if not isinstance(source_url, str) or not source_url.startswith("https://www.loc.gov/item/"):
            continue
        object_id = source_url.rstrip("/").split("/")[-1]
        if f"loc:{object_id}" in seen:
            continue
        images = obj.get("image_url") or []
        image_url = images[-1] if isinstance(images, list) and images else first_text(images)
        item = candidate(
            "loc", object_id, obj.get("title"), obj.get("contributor"),
            obj.get("date"), obj.get("original_format"),
            source_url, source_url.rstrip("/") + "/?fo=json",
            image_url, None,
            first_text(obj.get("rights_and_access") or obj.get("rights")) or "Rights require item-level review",
        )
        if item:
            return [item]
    return []


FETCHERS = {
    "met": collect_met,
    "artic": collect_artic,
    "cleveland": collect_cleveland,
    "smk": collect_smk,
    "loc": collect_loc,
}


def main() -> int:
    now = datetime.now(TZ)
    day = now.date().isoformat()
    run_path = OUT / "runs" / f"{day}.json"
    if run_path.exists():
        print(f"Research for {day} already saved.")
        return 0
    index_path = OUT / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {
        "schema_version": 1, "seen_ids": [], "runs": []
    }
    seen = set(index.get("seen_ids", []))
    observation, history_node, query, theme_name = THEMES[now.toordinal() % len(THEMES)]
    items, warnings = [], []
    # Rotate source order to avoid consistently prioritizing the same provider.
    start = now.toordinal() % len(SOURCES)
    sources = SOURCES[start:] + SOURCES[:start]
    for source in sources:
        try:
            items.extend(FETCHERS[source](query, seen))
        except (RuntimeError, KeyError, TypeError) as error:
            warnings.append(f"{source}: {error}")
        if len(items) >= MAX_ITEMS:
            break
    if not items:
        print("No candidates collected; existing latest.json was not modified.", file=sys.stderr)
        for warning in warnings:
            print(warning, file=sys.stderr)
        return 1
    items = items[:MAX_ITEMS]
    record = {
        "schema_version": 1,
        "status": "research_candidates_only",
        "generated_at": now.isoformat(timespec="seconds"),
        "research_date": day,
        "theme": {
            "observation_code": observation,
            "observation_name": theme_name,
            "history_node": history_node,
            "query": query,
            "classification_verified": False,
        },
        "items": items,
        "sources_attempted": list(sources),
        "warnings": warnings,
        "notes": "Catalog candidates only. No images saved and no content published.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    run_path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(record, ensure_ascii=False, indent=2) + "\n"
    run_path.write_text(content, encoding="utf-8")
    (OUT / "latest.json").write_text(content, encoding="utf-8")
    index["seen_ids"] = list(dict.fromkeys(
        index.get("seen_ids", []) + [item["source_id"] for item in items]
    ))[-1000:]
    index["runs"] = list(dict.fromkeys(index.get("runs", []) + [f"runs/{day}.json"]))[-90:]
    index["last_research_date"] = day
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(items)} unreviewed candidates ({day}); sources: {', '.join(sources)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
