# Agent Notes

## Project Environment

- Use the project-local Conda environment at `./.conda-env` for Python and Node commands.
- Activate it with:

```bash
conda activate /Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env
```

- If running commands non-interactively, prefer putting the Conda environment first in `PATH`:

```bash
env PATH=/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle/.conda-env/bin:$PATH npm run lint
```

- The environment currently includes Python `3.13.13`, Node.js `25.8.2`, and npm `11.11.1`.
- Do not use the system Node `20.11.1` for this project; some dependencies require newer Node versions.
- Keep `./.conda-env`, `./.venv`, and `./node_modules` untracked.

## Common Checks

- Install Node dependencies with `npm ci` from the project root.
- Run lint with `npm run lint`.
- Run production build with `npm run build`.
- `npm run build` requires Supabase environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
