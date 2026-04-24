#!/usr/bin/env node
/**
 * Step 4 — describe portrait.
 *
 * After step 3 has produced an image, ask a vision LLM to describe what
 * the image literally contains. This description is what will be shown
 * as alt text and in hover tooltips — it must describe the Escher plate
 * the viewer sees, not the realistic self-reflection from step 1.
 *
 * Output: scripts/personas/out/alt-text/<slug>.md
 *
 * Run: node scripts/personas/04-describe-image.mjs [slug ...]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, 'personas.json');
const PORTRAIT_DIR = join(__dirname, 'out/portraits');
const ALT_DIR = join(__dirname, 'out/alt-text');

const MODEL = process.env.PERSONA_DESCRIBE_MODEL || 'anthropic/claude-sonnet-4.5';

const SYSTEM = `You are writing alt text and a short descriptive tooltip
for an image on a research-lab website. You are given the image itself
plus the display name and role of the subject. Describe, in plain prose,
what a viewer actually sees in the image.

Ground rules:

- Describe what is literally present in the image. Do not invent details.
  Do not describe things the self-description mentioned if they are not
  visibly in the image.
- Treat the subject by the display name you are given. Use their role
  once for context. Do not speculate about age, ethnicity, or emotion
  beyond what the figure plainly shows.
- Keep it compact: 80–150 words. Aim for 100.
- Describe in this order: overall medium (black-and-white engraving in
  the style of M.C. Escher), the central geometric motif, the figure's
  posture and appearance, what they hold or interact with, and the
  single orange accent element (name where the orange actually sits).
- Plain English. No markdown headings, no bullet points, no quotation
  marks around phrases, no "As an AI" framings, no meta-commentary.
- Return prose only — one or two paragraphs.`;

async function describeForPersona(persona) {
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
            text: `Subject: ${persona.displayName} — ${persona.role}. Describe the plate.`,
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${base64}` },
          },
        ],
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://qamelab.org',
      'X-Title': 'QAME Lab - persona portrait pipeline (describe)',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`No description: ${JSON.stringify(data).slice(0, 400)}`);

  const md = [
    `---`,
    `slug: ${persona.slug}`,
    `displayName: "${persona.displayName}"`,
    `role: ${persona.role}`,
    `sourceImage: ${imgPath}`,
    `model: ${MODEL}`,
    `generatedAt: ${new Date().toISOString()}`,
    `---`,
    ``,
    text,
    ``,
  ].join('\n');

  const outPath = join(ALT_DIR, `${persona.slug}.md`);
  await writeFile(outPath, md, 'utf8');
  console.log(`[describe-image] ${persona.slug} -> ${outPath}`);
}

async function main() {
  await mkdir(ALT_DIR, { recursive: true });

  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  const filter = new Set(process.argv.slice(2));
  const picks = filter.size ? registry.filter(p => filter.has(p.slug)) : registry;

  if (!picks.length) {
    console.error('No personas matched.');
    process.exit(1);
  }
  for (const persona of picks) {
    try {
      await describeForPersona(persona);
    } catch (err) {
      console.error(`[describe-image] ${persona.slug} failed:`, err.message);
      process.exitCode = 1;
    }
  }
}

main();
