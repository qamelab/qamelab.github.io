# Persona portrait pipeline

Three-step pipeline that turns a QAME Lab agent persona into a consistent
black-and-white + burnt-orange Escher-style portrait for the team page.

## Flow

```
personas.json
    │
    ▼
01-self-portrait.mjs ──► out/self-reflections/<slug>.md
   (LLM inhabits persona, answers "what do you see in the mirror?")
    │
    ▼
02-compose-prompt.mjs ──► out/portrait-prompts/<slug>.md
   (combine style/qame-escher-style.md  +  self-reflection)
    │
    ▼
03-generate-portrait.mjs ──► out/portraits/<slug>.png
                             public/team/<slug>.png        (served)
   (Nano Banana / gemini-2.5-flash-image)
    │
    ▼
04-describe-image.mjs ──► out/alt-text/<slug>.md
   (vision LLM writes ~100-word description — debug artefact, not served)
    │
    ▼
05-fidelity-check.mjs ──► out/fidelity/<slug>.json
   (vision LLM compares self-reflection ↔ image and returns:
      summary — one-sentence alt text
      pairs   — "what you see ↔ what it represents" mappings)
    │
    ▼
The team page reads fidelity JSON at build time:
  - summary becomes the <img alt="…">
  - pairs render inside the on-hover <figcaption> overlay
```

The **house style** — a shared visual grammar for all Digital-Intelligence
portraits — lives in [`style/qame-escher-style.md`](./style/qame-escher-style.md).
Change that file to evolve the look; re-run step 2 and 3 for all personas.

## Requirements

Environment variables (kept in `~/.bashrc`, not the repo):

- `OPENROUTER_API_KEY` — for step 1 (creative LLM roleplay)
- `GEMINI_API_KEY` — for step 3 (Nano Banana image generation)

Node 20+. No npm deps beyond what the site already uses.

## Usage

Generate everything for all personas:

```bash
npm run personas:self       # step 1 for all
npm run personas:compose    # step 2 for all
npm run personas:portrait   # step 3 for all
npm run personas:describe   # step 4 for all (debug artefact)
npm run personas:fidelity   # step 5 for all (what the site reads)
npm run personas:all        # all five steps in sequence
```

Or one persona at a time (same arg form for every step):

```bash
node scripts/personas/01-self-portrait.mjs a-priori
node scripts/personas/02-compose-prompt.mjs a-priori
node scripts/personas/03-generate-portrait.mjs a-priori
node scripts/personas/04-describe-image.mjs a-priori
node scripts/personas/05-fidelity-check.mjs a-priori
```

If you've only changed the image (e.g., re-rolled step 3), re-run 4 + 5
to refresh the alt / hover content. If the persona source prompt
changes, re-run all five.

## Adding a new persona

1. Append an entry to `personas.json`:
   ```json
   {
     "slug": "x-something",
     "displayName": "X. Something",
     "role": "Short role line",
     "sourcePrompt": "/absolute/path/to/qamelab_comms/prompts/personas/x.md"
   }
   ```
2. Run the three steps. Final image lands in `public/team/x-something.png`.
3. Reference it from the persona's team markdown (`src/content/team/<slug>.md`)
   with `portrait: /team/x-something.png`. The schema must have a
   `portrait` field (see `src/content/config.ts`) and the team page must
   render it on agent cards.

## Regenerating only one step

Self-reflections are random (temperature 0.95). If the generated prose
misses the persona's voice, re-run step 1 for that slug, then rerun 2 and 3.

The house style is **not** regenerated — it is a hand-written file.

## From Claude Code

There is a `/persona-portrait` slash command at
`.claude/commands/persona-portrait.md` that wraps the pipeline for one
persona. Run it inside the repo to produce a portrait interactively.

## Cost

Step 1: one OpenRouter chat call per persona (Claude Sonnet 4.5, ~$0.01–0.02).
Step 3: one Gemini image call per persona (Nano Banana, ~$0.04 each).
Approximate total per persona: ~$0.05.
