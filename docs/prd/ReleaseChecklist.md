# Zaizai Isle Release Checklist

> Status: Active release procedure
> Last Updated: 2026-08-12
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
- Confirm `package.json`, `package-lock.json`, `CHANGELOG.md`, and current product docs use the same release version.
- Confirm `.github/workflows/deploy.yml` uses the project-supported Node version.
- Confirm the GitHub Pages workflow still triggers on pushes to `main` and uploads the `out` directory.

---

## 5. Publish Check

After pushing `main`:

- Confirm the **Deploy GH Pages** workflow starts automatically.
- Confirm both the build and deploy jobs complete successfully.
- Open `https://zaizai-isle.github.io/zaizai-isle/` and verify the release version's primary paths.
- Record any failed check before retrying; do not silently change the release scope during deployment.

### Queued Run Recovery

If a workflow remains `Queued` without creating any jobs:

1. Confirm no other run is holding the same concurrency group.
2. Try **Cancel workflow** once.
3. If cancellation fails, push a no-code redeploy commit or trigger a fresh manual run.
4. Confirm the replacement run creates a `build` job before treating the incident as resolved.
5. Use GitHub's force-cancel API only when the stale run must be removed and an Actions-write credential is available.
