#!/usr/bin/env python3
"""R2 图片三件套生成器 · 每日一看自动化规则 v1
为 manifest 中每个资产生成 阅读图(≤350KB) + 首页缩略图(≤60KB)，
原图保持不动（存档），并把派生图路径/字节/SHA256 写回 manifest。
幂等：派生图已存在且原图未变则跳过（--force 强制重建）。
rights_status 缺失的资产直接报错退出（规则 R5：新资产必须带权利标记）。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public" / "learning" / "manifest.json"
PUBLIC = ROOT / "public"
READING_DIR = PUBLIC / "learning" / "reading"
THUMB_DIR = PUBLIC / "learning" / "thumb"

READING_MAX_SIDE = 1600
READING_MAX_BYTES = 350 * 1024
THUMB_MAX_SIDE = 640
THUMB_MAX_BYTES = 60 * 1024
ALLOWED_RIGHTS = {"risk", "open", "open-commons", "unverified"}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def encode_under_budget(img: Image.Image, max_bytes: int, out: Path) -> int:
    """等比缩放到 max_side 内，再降质量直到 ≤ max_bytes。返回字节数。"""
    quality, scale = 82, 1.0
    while True:
        work = img
        if scale < 1.0:
            w, h = img.size
            work = img.resize((max(1, int(w * scale)), max(1, int(h * scale))))
        work.save(out, format="WEBP", quality=quality, method=4)
        size = out.stat().st_size
        if size <= max_bytes:
            return size
        if quality > 35:
            quality -= 6
        elif scale > 0.5:
            scale *= 0.88
            quality = 82
        else:
            raise RuntimeError(f"{out.name}: 无法压到 {max_bytes} 字节以内")


def process(asset_id: str, entry: dict, force: bool) -> dict | None:
    # 原图已迁至 learning-assets-archive/（仓库根）；兼容旧的 public 相对路径。
    src = ROOT / entry["path"]
    if not src.exists():
        src = PUBLIC / entry["path"]
    if not src.exists():
        raise FileNotFoundError(f"{asset_id}: 原图缺失 {entry['path']}")
    rights = entry.get("rights_status")
    if rights not in ALLOWED_RIGHTS:
        raise ValueError(f"{asset_id}: rights_status 缺失或非法（{rights!r}），按规则拒绝处理")

    reading = READING_DIR / f"{asset_id}.webp"
    thumb = THUMB_DIR / f"{asset_id}.webp"
    orig_sha = sha256_file(src)
    if not force and reading.exists() and thumb.exists() and entry.get("original_sha256") == orig_sha:
        return None  # 幂等跳过

    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        read_img = im.copy()
        read_img.thumbnail((READING_MAX_SIDE, READING_MAX_SIDE), Image.LANCZOS)
        rb = encode_under_budget(read_img, READING_MAX_BYTES, reading)
        thumb_img = im.copy()
        thumb_img.thumbnail((THUMB_MAX_SIDE, THUMB_MAX_SIDE), Image.LANCZOS)
        tb = encode_under_budget(thumb_img, THUMB_MAX_BYTES, thumb)

    return {
        "original_sha256": orig_sha,
        "reading_path": f"learning/reading/{asset_id}.webp",
        "reading_bytes": rb,
        "reading_sha256": sha256_file(reading),
        "thumb_path": f"learning/thumb/{asset_id}.webp",
        "thumb_bytes": tb,
        "thumb_sha256": sha256_file(thumb),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="强制重建全部派生图")
    ap.add_argument("--only", default=None, help="仅处理指定 asset_id（逗号分隔）")
    args = ap.parse_args()

    manifest = json.loads(MANIFEST.read_text("utf-8"))
    if not isinstance(manifest, dict):
        print("manifest 结构异常：期望 dict", file=sys.stderr)
        return 1
    READING_DIR.mkdir(parents=True, exist_ok=True)
    THUMB_DIR.mkdir(parents=True, exist_ok=True)

    wanted = set(args.only.split(",")) if args.only else None
    done, skipped, failed = 0, 0, []
    for asset_id, entry in manifest.items():
        if wanted and asset_id not in wanted:
            continue
        try:
            result = process(asset_id, entry, args.force)
        except Exception as error:  # noqa: BLE001
            failed.append(f"{asset_id}: {error}")
            continue
        if result is None:
            skipped += 1
            continue
        entry.update(result)
        done += 1
        print(f"✓ {asset_id}: 阅读图 {result['reading_bytes']//1024}KB · 缩略图 {result['thumb_bytes']//1024}KB")

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"\n生成 {done} · 跳过 {skipped} · 失败 {len(failed)}")
    for f in failed:
        print(f"  ✗ {f}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
