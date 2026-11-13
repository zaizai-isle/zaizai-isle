#!/usr/bin/env python3
"""一次性迁移：学习原图迁出 public/，仓库/Pages 只留访客层（thumb + reading）。

- public/learning/assets/ 中被 manifest 引用的原图 + 未被任何代码引用的遗留工作文件
  → 移到仓库根 learning-assets-archive/（已加入 .gitignore，仅本机保留）。
- 岛主补充图（learning-plan-gaps.ts 直接引用的 7 张）留在 public/learning/assets/。
- manifest 每条：path 改指归档相对路径，新增 original_url（远端原图 URL，审核页读它）。
幂等：重复运行只补齐缺失字段，不重复移动。
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public" / "learning" / "manifest.json"
PUBLIC_ASSETS = ROOT / "public" / "learning" / "assets"
ARCHIVE = ROOT / "learning-assets-archive"

# 岛主补充图：由 learning-plan-gaps.ts 以 /learning/assets/<file> 直接引用，必须留在 public。
GAPS_SRC = ROOT / "src" / "app" / "learning" / "review" / "learning-plan-gaps.ts"
gap_files = set(re.findall(r"/learning/assets/([^\"']+)", GAPS_SRC.read_text()))

manifest = json.loads(MANIFEST.read_text())
ARCHIVE.mkdir(exist_ok=True)

moved, patched = 0, 0
for asset_id, entry in manifest.items():
    if not isinstance(entry, dict):
        continue
    path = entry.get("path", "")
    name = path.split("/")[-1]
    if path.startswith("learning/assets/") and name not in gap_files:
        src = PUBLIC_ASSETS / name
        dst = ARCHIVE / name
        if src.exists():
            shutil.move(str(src), str(dst))
            moved += 1
        entry["path"] = f"learning-assets-archive/{name}"
        patched += 1
    if "original_url" not in entry and entry.get("source_url"):
        entry["original_url"] = entry["source_url"]
        patched += 1

# 迁走磁盘上残留的、既不在 manifest 也不是岛主补充图的原图/工作文件
if PUBLIC_ASSETS.exists():
    manifest_names = {e["path"].split("/")[-1] for e in manifest.values() if isinstance(e, dict) and e.get("path")}
    for f in PUBLIC_ASSETS.iterdir():
        if f.is_file() and f.name not in gap_files and f.name not in manifest_names and f.name != ".DS_Store":
            shutil.move(str(f), ARCHIVE / f.name)
            moved += 1

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
print(f"moved={moved} patched={patched} archive={ARCHIVE}")
