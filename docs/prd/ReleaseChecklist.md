# Zaizai Isle Release Checklist

> Status: V1.3 Maintenance Memory
> Last Updated: 2026-07-16
> Purpose: Keep releases small, repeatable, and aligned with the island's narrative guardrails.

---

## 1. Scope Check

Before editing:

- Confirm the release has one clear purpose.
- Confirm it does not turn the home island into a portfolio, dashboard, product index, or feed.
- Confirm it does not add a new homepage module unless an existing module cannot carry the change.
- Confirm visible copy stays short and does not over-explain the island.

---

## 2. Change Check

For each release:

- Update the relevant PRD or planning note when the change affects product direction.
- Update `CHANGELOG.md` for user-facing, architecture, asset, or workflow changes.
- Update `docs/PRODUCT_DOCUMENTATION.md` when the island's growth record changes.
- Keep generated/runtime assets separate from source/archive assets.

---

## 3. Verification Check

Run these from the project root with the local Conda environment first in `PATH`:

```bash
env PATH=/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env/bin:$PATH npm run lint
env PATH=/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env/bin:$PATH npm run build
```

When the release changes layout, animation, cards, icons, or visual assets, also run:

```bash
env PATH=/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env/bin:$PATH npm run vr:core-build
```

If visual changes are intentional, update the baseline:

```bash
env PATH=/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env/bin:$PATH npm run vr:core-build:update
```

---

## 4. Final Check

Before committing:

- Review `git status --short`.
- Confirm unrelated user changes are not included.
- Confirm static export assets exist when asset paths changed.
- Confirm the release still feels quieter after the change than before it.
