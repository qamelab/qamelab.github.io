#!/usr/bin/env node
/**
 * Step 5 — fidelity check.
 *
 * For each persona, compare their step-1 self-reflection against the
 * step-3 image (via vision LLM). Produce:
 *   - summary: one sentence describing what the viewer literally sees —
 *              used as the portrait's `alt` attribute (short, plain).
 *   - pairs:   anchor ↔ rendering table. Each pair says what element of
 *              the image corresponds to what concept from the self-
 *              reflection — used in the hover overlay.
 *
 * Output: scripts/personas/out/fidelity/<slug>.json
 *
 * Run: node scripts/personas/05-fidelity-check.mjs [slug ...]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, 'personas.json');
const SELF_DIR = join(__dirname, 'out/self-reflections');
const PORTRAIT_DIR = join(__dirname, 'out/portraits');
const OUT_DIR = join(__dirname, 'out/fidelity');

const MODEL = process.env.PERSONA_FIDELITY_MODEL || 'anthropic/claude-sonnet-4.5';

const SYSTEM = `You are auditing the fidelity between a persona's written
self-description and the final Escher-style portrait produced for them.

You are given:
  - A display name and role.
  - The persona's self-reflection (prose, ~200 words): how they described
    themselves in a mirror.
  - The final image: a black-and-white engraving in the style of M.C.
    Escher with one sparing burnt-orange accent.

Output STRICT JSON with these fields:

{
  "summary": "<one sentence, <=25 words, plain prose describing what the
              viewer literally sees in the image — figure, central motif,
              where the single orange accent sits>",
  "pairs": [
    { "see": "<specific visual element literally present in the image>",
      "represents": "<the concept from the self-reflection this element
                     maps to, in <=12 words>" },
    ...
  ]
}

Rules:
- summary: plain prose, no markdown, no quote marks around phrases.
- pairs: 3 to 5 entries. Include the central motif and the central
  artefact. Omit trivia (composition border, small decorative lines).
- "see" describes something visually in the image; "represents" draws
  directly from the self-reflection's concepts.
- If a self-reflection concept is absent in the image, skip it; do NOT
  invent a mapping.
- If the match is a loose stand-in, say so honestly (e.g. "stand-in for
  her daily verification work") rather than forcing fit.
- Output ONLY the JSON object. No preamble, no markdown fences.`;

function stripFrontmatter(md) {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  if (end === -1) return md;
  return md.slice(end + 4).trimStart();
}

async function check(persona) {
  const selfPath = join(SELF_DIR, `${persona.slug}.md`);
  const selfRaw = await readFile(selfPath, 'utf8');
  const self = stripFrontmatter(selfRaw).trim();

  const ext = ['png', 'jpg', 'jpeg', 'webp'].find(e =>
    existsSync(join(PORTRAIT_DIR, `${persona.slug}.${e}`)),
  ) || 'png';
  const imgPath = join(PORTRAIT_DIR, `${persona.slug}.${ext}`);
  const imgBytes = await readFile(imgPath);
  const base64 = imgBytes.toString('base64');
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Subject: ${persona.displayName} — ${persona.role}.\n\nSelf-reflection:\n\n${self}`,
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${base64}` },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://qamelab.org',
      'X-Title': 'QAME Lab - persona portrait pipeline (fidelity)',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('empty response');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error(`non-JSON response: ${text.slice(0, 400)}`);
    parsed = JSON.parse(m[0]);
  }

  const out = {
    slug: persona.slug,
    displayName: persona.displayName,
    role: persona.role,
    model: MODEL,
    generatedAt: new Date().toISOString(),
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    pairs: Array.isArray(parsed.pairs)
      ? parsed.pairs.filter(p => p && typeof p.see === 'string' && typeof p.represents === 'string')
      : [],
  };

  const outPath = join(OUT_DIR, `${persona.slug}.json`);
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[fidelity] ${persona.slug} -> ${outPath}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  const filter = new Set(process.argv.slice(2));
  const picks = filter.size ? registry.filter(p => filter.has(p.slug)) : registry;

  if (!picks.length) {
    console.error('No personas matched.');
    process.exit(1);
  }
  for (const persona of picks) {
    try {
      await check(persona);
    } catch (err) {
      console.error(`[fidelity] ${persona.slug} failed:`, err.message);
      process.exitCode = 1;
    }
  }
}

main();
