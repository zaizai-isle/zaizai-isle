#!/usr/bin/env python3
"""Cache verified Daily Learning images for stable, attribution-preserving display."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DRAFTS = ROOT / ".codex-output" / "learning-drafts"
PUBLIC_DIR = ROOT / "public" / "learning" / "assets"
MANIFEST_PATH = ROOT / "data" / "learning" / "assets" / "manifest.json"
MAX_EDGE = 1800
MAX_DOWNLOAD_BYTES = 40 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
OFFICIAL_DOWNLOAD_ALTERNATIVES = {
    "https://upload.wikimedia.org/wikipedia/commons/b/bc/Migrant_Mother_%28LOC_fsa.8b29516%29.jpg": "https://tile.loc.gov/storage-services/service/pnp/fsa/8b29000/8b29500/8b29516v.jpg",
}


def safe_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-_")


def download(url: str, destination: Path) -> str:
    url = OFFICIAL_DOWNLOAD_ALTERNATIVES.get(url, url)
    parsed = urllib.parse.urlparse(url)
    if parsed.hostname == "upload.wikimedia.org" and "/wikipedia/commons/" in parsed.path:
        prefix, filename = parsed.path.rsplit("/", 1)
        url = urllib.parse.urlunparse(("https", "thumb.wikimedia.org", f"{prefix.replace('/commons/', '/commons/thumb/', 1)}/{filename}/1800px-{filename}", "", "", ""))
    result = subprocess.run(
        ["/usr/bin/curl", "--fail", "--location", "--silent", "--show-error", "--connect-timeout", "20", "--max-time", "180", "--retry", "2", "--retry-delay", "2", "--retry-all-errors", "--max-filesize", str(MAX_DOWNLOAD_BYTES), "--user-agent", "Zaizai-Isle-Daily-Learning/1.0", "--output", str(destination), "--write-out", "%{content_type}", url],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"curl failed with status {result.returncode}")
    content_type = result.stdout.split(";", 1)[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"unsupported content type {content_type}")
    if destination.stat().st_size > MAX_DOWNLOAD_BYTES:
        raise ValueError("image exceeds 40 MB download limit")
    return ALLOWED_CONTENT_TYPES[content_type]


def resize(source: Path, destination: Path) -> None:
    result = subprocess.run(
        ["/usr/bin/sips", "--resampleHeightWidthMax", str(MAX_EDGE), str(source), "--out", str(destination)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "sips failed")


def iter_assets(drafts_dir: Path):
    for package_path in sorted(drafts_dir.glob("*v2.json")):
        package = json.loads(package_path.read_text())
        for asset in package.get("assets", []):
            if asset.get("availability_status") != "verified":
                continue
            asset_id = asset.get("asset_id")
            image_url = asset.get("image_url")
            if isinstance(asset_id, str) and isinstance(image_url, str) and image_url.startswith("https://"):
                yield asset_id, image_url, package_path.name


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--drafts", type=Path, default=DEFAULT_DRAFTS)
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--asset-id", action="append", default=[], help="Cache only the named asset id; may be repeated.")
    args = parser.parse_args()
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST_PATH.read_text()) if MANIFEST_PATH.exists() else {}
    failures: list[str] = []

    for asset_id, image_url, package_name in iter_assets(args.drafts):
        if args.asset_id and asset_id not in args.asset_id:
            continue
        existing = manifest.get(asset_id)
        if not args.refresh and isinstance(existing, dict) and existing.get("source_url") == image_url and (ROOT / "public" / existing.get("path", "")).is_file():
            print(f"cached  {asset_id}")
            continue
        matching = next((value for value in manifest.values() if isinstance(value, dict) and value.get("source_url") == image_url and (ROOT / "public" / value.get("path", "")).is_file()), None)
        if not args.refresh and matching:
            manifest[asset_id] = {**matching, "package": package_name}
            MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
            print(f"reused  {asset_id}")
            continue
        try:
            with tempfile.TemporaryDirectory(prefix="learning-asset-") as temp_dir:
                temp_path = Path(temp_dir) / "source"
                extension = download(image_url, temp_path)
                output_name = f"{safe_name(asset_id)}{extension}"
                output_path = PUBLIC_DIR / output_name
                resize(temp_path, output_path)
            payload = output_path.read_bytes()
            manifest[asset_id] = {
                "path": f"learning/assets/{output_name}",
                "source_url": image_url,
                "sha256": hashlib.sha256(payload).hexdigest(),
                "bytes": len(payload),
                "package": package_name,
            }
            MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
            print(f"stored  {asset_id} -> {output_name}")
        except Exception as error:
            failures.append(f"{asset_id}: {error}")
            print(f"failed  {asset_id}: {error}")

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    if failures:
        print("\nFailures:")
        print("\n".join(failures))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
