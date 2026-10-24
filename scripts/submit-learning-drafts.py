#!/usr/bin/env python3
"""Submit collected catalog records to the private, OIDC-protected draft generator.

Requires GitHub Actions id-token:write permission. No Supabase admin key is stored
in GitHub. Drafts remain private and require owner review.
"""
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ENDPOINT = "https://luudxrfzwwirsszqtgiu.supabase.co/functions/v1/daily-learning-auto"
DATA = Path(__file__).resolve().parents[1] / "data/learning/research/latest.json"

def get_oidc_token():
    url = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_URL", "")
    token = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "")
    if not url or not token:
        raise RuntimeError("GitHub OIDC permissions unavailable")
    separator = "&" if "?" in url else "?"
    request = Request(
        url + separator + "audience=" + quote(ENDPOINT, safe=""),
        headers={"Authorization": "bearer " + token, "Accept": "application/json"},
    )
    with urlopen(request, timeout=15) as result:
        return json.load(result)["value"]

def submit(candidate, jwt):
    data = json.dumps({"candidate": candidate}, ensure_ascii=False).encode()
    request = Request(
        ENDPOINT, data=data, method="POST",
        headers={"authorization": "Bearer " + jwt, "content-type": "application/json"},
    )
    with urlopen(request, timeout=65) as result:
        return json.load(result)

def main():
    if not DATA.exists():
        print("Research latest.json not found. No drafts submitted.", file=sys.stderr)
        return 1
    record = json.loads(DATA.read_text(encoding="utf8"))
    if record.get("status") != "research_candidates_only":
        print("Unexpected source status.", file=sys.stderr)
        return 1
    candidates = record.get("items", [])
    if not candidates:
        print("No candidates available.", file=sys.stderr)
        return 1
    token = get_oidc_token()
    created = 0
    failures = 0
    for item in candidates[:5]:
        source = item.get("source_id", "<missing>")
        try:
            result = submit(item, token)
            status = result.get("status", "unknown")
            print(f"{source}: {status}")
            if status == "draft_created":
                created += 1
        except HTTPError as error:
            failures += 1
            print(f"{source}: generator HTTP {error.code}", file=sys.stderr)
        except (URLError, TimeoutError, ValueError) as error:
            failures += 1
            print(f"{source}: request failed: {type(error).__name__}", file=sys.stderr)
    print(f"New private drafts: {created}. Failed requests: {failures}.")
    return 1 if failures else 0

if __name__ == "__main__":
    raise SystemExit(main())
