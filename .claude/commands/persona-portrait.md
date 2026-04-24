---
description: Generate or regenerate an Escher-style portrait for a QAME Lab persona
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /persona-portrait

Run the three-step persona-portrait pipeline for one (or all) QAME Lab
Digital-Intelligence personas. The pipeline is documented in
`scripts/personas/README.md`.

## Usage

- `/persona-portrait` — regenerate for **all** personas in
  `scripts/personas/personas.json`.
- `/persona-portrait <slug>` — regenerate for one persona (e.g.
  `/persona-portrait a-priori`).
- `/persona-portrait add <slug> <displayName> <role> <absolute/path/to/prompt.md>` —
  append a new persona to the registry, then run the full pipeline for it.

## What this command does

1. Parse the arguments.

2. If the first argument is `add`:
   a. Read `scripts/personas/personas.json`.
   b. Append a new entry with the provided slug / displayName / role /
      sourcePrompt, preserving valid JSON.
   c. Create a placeholder team markdown at
      `src/content/team/<slug-without-prefix>.md` with
      `kind: agent`, `status: current`, `initials`, `order`, a one-line
      `description`, and `portrait: /team/<slug>.png` — but do NOT set
      `website` (leave empty; the user can fill it in later).

3. Run the pipeline:
   ```bash
   node scripts/personas/01-self-portrait.mjs <slug>
   node scripts/personas/02-compose-prompt.mjs <slug>
   node scripts/personas/03-generate-portrait.mjs <slug>
   node scripts/personas/04-describe-image.mjs <slug>
   node scripts/personas/05-fidelity-check.mjs <slug>
   ```
   (Or no slug to run all — equivalent to `npm run personas:all`.)

   Step 5 (`05-fidelity-check.mjs`) is what the team page actually reads
   for alt text and the hover overlay. If you only rerun step 3 (e.g.
   to reroll the image), always also rerun step 5 to refresh the alt
   text — the old `out/fidelity/<slug>.json` will describe the previous
   image.

4. Report the resulting image paths and show the self-reflection markdown
   inline so the user can sanity-check the voice before the image is
   wired into the site.

5. If this was a new persona added via `add`, remind the user to:
   - Fill in the team markdown's `description` and optional `website`.
   - Run `npm run check` to validate the schema.
   - Refresh the dev server (`npm run dev`) to see the card.

## Prerequisites

- `OPENROUTER_API_KEY` must be in the environment (used for both steps —
  Claude Sonnet 4.5 for the self-reflection, and Google Gemini 2.5 Flash
  Image / Nano Banana for the portrait, routed through OpenRouter).

- The source prompt file must exist (for the `add` flow, the absolute
  path must point at an existing markdown file).

- Node 20+.

## Notes

- The **house style** is `scripts/personas/style/qame-escher-style.md`.
  Edit that to change the visual grammar of the whole series. After
  editing, re-run steps 2 and 3 for every persona.

- Step 1 is stochastic (temperature 0.95). Re-running a single persona
  with `node scripts/personas/01-self-portrait.mjs <slug>` will produce
  a different self-reflection and therefore a different portrait. That
  is intentional — it lets us iterate.

- Final images are saved to both `scripts/personas/out/portraits/` (as
  the archive) and `public/team/` (as the served asset). Check both in
  when committing.
