---
name: persona-portraits
description: Context for QAME Lab's Digital-Intelligence portrait system — the three-step pipeline that turns an agent persona into a consistent Escher-style black-and-white + burnt-orange portrait on the team page. Load this when working on anything related to agent-persona headshots, the team page's digital-intelligence section, the style grammar, or the `scripts/personas/` pipeline.
---

# QAME Lab — persona portrait system

## Why this exists

The team page (`/team`) splits into two blocks:

- **Current members (biological intelligence)** — human researchers.
- **Current members (digital intelligence)** — agent personas implemented
  in the sister repo `qamelab_comms` as drafter personalities (different
  editorial voices for the lab's social-media feed).

For consistency across the site, each digital-intelligence persona has
a hand-generated portrait in a single house style: M.C. Escher-inspired
black-and-white line engraving with one sparing use of the lab's
burnt-orange accent (#c4622a). Portraits live at `public/team/<slug>.png`.

## The pipeline

Five steps, orchestrated from the repo root:

```
personas.json
    │
    ▼
01-self-portrait.mjs ──► out/self-reflections/<slug>.md
   (LLM-as-persona answers "how do you see yourself in the mirror?")
    │
    ▼
02-compose-prompt.mjs ──► out/portrait-prompts/<slug>.md
   (style/qame-escher-style.md  +  self-reflection  +  presentation cue)
    │
    ▼
03-generate-portrait.mjs ──► out/portraits/<slug>.png
                             public/team/<slug>.png         (served)
   (Nano Banana / gemini-2.5-flash-image via OpenRouter)
    │
    ▼
04-describe-image.mjs ──► out/alt-text/<slug>.md
   (vision LLM writes ~100-word literal description — debug artefact)
    │
    ▼
05-fidelity-check.mjs ──► out/fidelity/<slug>.json
   (vision LLM compares self-reflection ↔ image; returns
      summary — one-sentence alt text
      pairs   — "what you see ↔ what it represents" mappings)
```

The team page reads `out/fidelity/<slug>.json` at build time:
  - `summary` → the image's `alt` attribute (short, accessible)
  - `pairs` → rendered inside the on-hover `<figcaption>` overlay

Steps 1, 2, 4, 5 all call OpenRouter (Claude Sonnet 4.5 for creative
roleplay and vision). Step 3 calls `google/gemini-2.5-flash-image` (Nano
Banana) also through OpenRouter. The direct Gemini API key
(`GEMINI_API_KEY`) has `limit: 0` on the image model's free tier —
OpenRouter is the only practical route.

**Important nuance.** The self-reflection (step 1) is a realistic
character study — desk, monitors, clothing, coffee mugs. Step 2
deliberately discards most of that and extracts only the essentials for
an Escher plate (one motif + one artefact + one figure). **Do not use
the self-reflection as alt text** — it describes an office that does
not appear in the image. Use the step 5 fidelity output instead.

## Key files

| File | Purpose |
|---|---|
| `scripts/personas/personas.json` | Registry: slug, displayName, role, sourcePrompt path |
| `scripts/personas/style/qame-escher-style.md` | **The house style** — hand-written, governs every portrait |
| `scripts/personas/lib/openrouter.mjs` | Chat-completions wrapper |
| `scripts/personas/lib/nano-banana.mjs` | Image wrapper (OpenRouter chat completions with `modalities: ["image","text"]`) |
| `scripts/personas/01-self-portrait.mjs` | Step 1 — mirror self-reflection (prose) |
| `scripts/personas/02-compose-prompt.mjs` | Step 2 — wrap style + self-reflection into image prompt |
| `scripts/personas/03-generate-portrait.mjs` | Step 3 — Nano Banana image |
| `scripts/personas/04-describe-image.mjs` | Step 4 — vision LLM, long image description (debug) |
| `scripts/personas/05-fidelity-check.mjs` | Step 5 — vision LLM, summary + anchor↔image pairs (drives alt & hover) |
| `scripts/personas/README.md` | End-user docs |
| `.claude/commands/persona-portrait.md` | Slash command wrapping all of the above |

## Style grammar (summary — authoritative file: `style/qame-escher-style.md`)

- Black-and-white engraving, Escher discipline. No photorealism, no painterly.
- **Only** colour: burnt orange #c4622a, used sparingly as a single accent.
- Square 1:1. Head-and-shoulders, three-quarter view.
- Framing: the subject *seeing themselves* — mirror, reflective surface,
  recursive hand-draws-self arrangement.
- Background: one Escher motif (tessellation, impossible staircase,
  metamorphosis, Möbius strip, reflected sphere, interlocking creatures).
- No text, captions, watermark, or signature on the image.

## How personas flow into the site

1. Agent-persona source prompts live in `~/tools/qamelab_comms/prompts/personas/<name>.md`.
2. Running the pipeline produces `public/team/<slug>.png`.
3. The team markdown at `src/content/team/<slug>.md` has:
   ```yaml
   kind: agent
   status: current
   portrait: /team/<slug>.png
   ```
4. `src/pages/team/index.astro` renders the portrait on agent cards.
   The schema in `src/content/config.ts` defines the `portrait` field.

## Tradeoffs / open questions

- **Stochasticity.** Step 1 uses temperature 0.95 — each re-run produces
  a new self-reflection and a different portrait. If a generated
  portrait misses the voice, rerun step 1 for that slug and then steps
  2+3. Keep the generated-at timestamp in the frontmatter so you can
  diff.

- **Gemini vs. newer models.** OpenRouter also lists `google/gemini-3-pro-image-preview`
  and `google/gemini-3.1-flash-image-preview`. The pipeline uses the
  classic Nano Banana (`gemini-2.5-flash-image`) by default for
  consistency. Upgrading would regenerate every portrait — treat as a
  style-grammar change.

- **Do not commit API keys.** Keys are read from `OPENROUTER_API_KEY`
  in the environment. `~/.bashrc` holds them on this machine; they must
  never land in the repo.

## When to load this skill

- User asks to add, regenerate, or swap a persona portrait.
- User wants to change the Escher house style, colour rules, or framing.
- Any work touching `scripts/personas/`, the `/persona-portrait` slash
  command, or the digital-intelligence block of the team page.
- Debugging pipeline errors, OpenRouter 404s, or model routing issues.
