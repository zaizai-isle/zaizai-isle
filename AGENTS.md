# Agent Notes

## Project Environment

- Use the project-local Conda environment at `./.conda-env` for Python and Node commands.
- From the project root, activate it with:

```bash
conda activate "$PWD/.conda-env"
```

- When `.auto-activate-conda.zsh` is sourced from the shell configuration, it resolves the repository from its own location and auto-activates this environment after `cd` into the repo.
- If running commands non-interactively, prefer putting the Conda environment first in `PATH`:

```bash
env PATH="$PWD/.conda-env/bin:$PATH" npm run lint
```

- The environment currently includes Python `3.13.13`, Node.js `25.8.2`, and npm `11.11.1`.
- Use the project-local Node rather than whichever Node happens to be installed globally.
- Keep `./.conda-env`, `./.venv`, and `./node_modules` untracked.

## Common Checks

- Install Node dependencies with `npm ci` from the project root.
- Run lint with `npm run lint`.
- Run local development with `npm run dev` (the Next.js default Turbopack bundler).
- Run production build with `npm run build` so local verification matches the GitHub Pages workflow.
- If Turbopack reports a filesystem permission panic after switching bundlers or builds, move the disposable `.next` directory aside and let Next.js rebuild it before changing filesystem permissions.
- The production build requires Supabase environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Site Performance Contract

- Before adding or changing any page or module, read `docs/prd/PerformanceContract.md`.
- Classify work before implementation: route-critical, near-viewport, or interaction/idle only.
- Keep route-critical content server-rendered or static wherever possible. Put `"use client"` at the smallest interactive leaf.
- Dynamically import below-the-fold sections and preserve their layout with a matching placeholder; homepage Bento placeholders must match the exact card footprint.
- Load dialogs, editors, export/image processing, background controls, analytics, and other non-critical dependencies only on interaction or idle.
- Keep route-specific CSS, images, translations, fonts, and SDKs out of unrelated routes and initial paths.
- Browser verification remains manual by the project owner; agents perform code, lint, and production-build verification only.
