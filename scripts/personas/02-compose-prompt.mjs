#!/usr/bin/env node
/**
 * Step 2 — compose portrait prompt.
 *
 * For each persona, combine:
 *   - the global style description (style/qame-escher-style.md)
 *   - the persona's own self-reflection (out/self-reflections/<slug>.md)
 * into a single image-generation prompt, and save it.
 *
 * Output: scripts/personas/out/portrait-prompts/<slug>.md
 *
 * Run: node scripts/personas/02-compose-prompt.mjs [slug ...]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, 'personas.json');
const STYLE_FILE = join(__dirname, 'style/qame-escher-style.md');
const SELF_DIR = join(__dirname, 'out/self-reflections');
const PROMPT_DIR = join(__dirname, 'out/portrait-prompts');

function stripFrontmatter(md) {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  if (end === -1) return md;
  return md.slice(end + 4).trimStart();
}

const PRESENTATION_HINTS = {
  woman: [
    'Render the figure as a **schematic female figure** inside the Escher',
    'plate — recognisably a woman at thumbnail scale. Cues to use within',
    'the flat engraving style:',
    '  - Hair visibly longer than a crop, or tied back (bun / low braid',
    '    visible in silhouette).',
    '  - Softer jawline; narrower shoulders than the robe waist.',
    '  - No makeup, no jewellery, no gender performance — just the',
    '    recognisable silhouette.',
    'Still flat, schematic, no individual likeness — but a woman, not a',
    'default Escher monk.',
  ].join('\n'),
  man: [
    'Render the figure as a **schematic male figure** inside the Escher',
    'plate — recognisably a man at thumbnail scale. Cues:',
    '  - Short hair or shaved.',
    '  - Angular jaw, broader shoulders than waist.',
    'Still flat, schematic, no individual likeness.',
  ].join('\n'),
  androgynous: [
    'Render the figure as a **deliberately androgynous schematic figure**',
    'inside the Escher plate — readable as a person, not as one gender.',
    'Cues:',
    '  - Medium-length hair, neither close-cropped nor long.',
    '  - Neutral silhouette — neither narrow nor broad through the',
    '    shoulders; jaw neither soft nor sharp.',
    '  - No gender performance in dress or posture.',
    'The figure should be identifiably a person whose gender is not the',
    'subject of the plate.',
  ].join('\n'),
};

async function composeForPersona(persona, style) {
  const selfPath = join(SELF_DIR, `${persona.slug}.md`);
  const self = stripFrontmatter(await readFile(selfPath, 'utf8'));
  const presentationHint = persona.presentation
    ? PRESENTATION_HINTS[persona.presentation]
    : null;

  const prompt = [
    `Generate a square 1:1 plate in the house style below. Treat it as`,
    `an M.C. Escher print, not a character portrait. The geometric motif`,
    `is the subject; the figure is one element inside it.`,
    ``,
    `# House style (applies to every plate in this series)`,
    ``,
    style.trim(),
    ``,
    `# This plate`,
    ``,
    `Subject: ${persona.displayName} — ${persona.role} at QAME Lab.`,
    ``,
    `The persona's self-description below is a character study. It is NOT`,
    `a scene to illustrate. Translate it into a pure Escher-print composition`,
    `by extracting only these three things and discarding everything else:`,
    ``,
    `  1. **One** Escher geometric motif that embodies how this persona`,
    `     thinks. Pick from: tessellation (interlocking figures that tile`,
    `     the plane), Möbius strip, impossible staircase (Penrose), reflecting`,
    `     sphere, hand-drawing-hand recursion, metamorphosis (one shape`,
    `     gradually becoming another across the plate), Penrose triangle /`,
    `     tribar, balcony paradox, two mirrors facing each other. Choose`,
    `     the one most emblematic of the persona's cognitive move; build`,
    `     the whole plate around it; render it densely, like Escher himself.`,
    ``,
    `  2. **One** schematic artefact — a single shape that stands for the`,
    `     persona's work. A scroll, a folded sheet, a compass-and-straightedge,`,
    `     a single printed column. Geometric and flat, never a detailed`,
    `     contemporary object. No laptops, no mugs, no chairs, no desks.`,
    ``,
    `  3. **One** figure inside the motif. The figure is flat, schematic,`,
    `     rendered in the same engraving style as the motif — the kind of`,
    `     figure that appears in *Relativity* or *Ascending and Descending*:`,
    `     simplified robe or plain clothing, minimal or no facial features,`,
    `     geometric body, no individual likeness, no contemporary fashion,`,
    `     no performed expression. The figure is a participant in the`,
    `     geometry, not the star of a character portrait.`,
    ``,
    `# Figure presentation`,
    ``,
    presentationHint ?? [
      'No specific gender cue is required. Render the figure as a',
      'neutral schematic Escher figure.',
    ].join('\n'),
    ``,
    `Discard completely: furniture, rooms, bookshelves, desks, laptops,`,
    `phones, mugs, coffee, clothing detail beyond a simple robe/shirt,`,
    `hair styling, grooming, glasses-as-styling-choice, ethnicity cues,`,
    `age cues, gender performance, expression performed to camera,`,
    `colour beyond the single burnt-orange accent.`,
    ``,
    `Self-description:`,
    ``,
    self.trim(),
    ``,
    `# Non-negotiable constraints`,
    ``,
    `- Square 1:1.`,
    `- Pure black-and-white engraving with exactly ONE burnt-orange`,
    `  (#c4622a) element — a continuous filled shape, not a thin hairline.`,
    `  The orange must be clearly visible at thumbnail (44px avatar) scale.`,
    `  Examples: the whole scroll / sheet the figure holds; one whole row`,
    `  of a tessellation; the entire perimeter of a Möbius band or tribar;`,
    `  the outer ring of a mirror / reflecting sphere; a single continuous`,
    `  thread tracing an impossible path.`,
    `- One orange element only. No additional tint, no secondary accent,`,
    `  no grey-orange gradient. Everything else is pure black ink on warm`,
    `  off-white paper.`,
    `- Austere. Generous negative space. At most three distinct objects`,
    `  in the entire plate (figure + motif + one schematic artefact).`,
    `- No scene-setting room, furniture, desk, bookshelf, window, wallpaper,`,
    `  laptop, mug, phone, or stack of papers.`,
    `- No detailed human likeness — flat, schematic figure only.`,
    `- No text, captions, numerals, labels, watermark, or signature.`,
    `- No painterly brushwork, no photorealism, no 3D render, no cinematic`,
    `  lighting.`,
  ].join('\n');

  const md = [
    `---`,
    `slug: ${persona.slug}`,
    `displayName: "${persona.displayName}"`,
    `composedAt: ${new Date().toISOString()}`,
    `---`,
    ``,
    prompt,
    ``,
  ].join('\n');

  const outPath = join(PROMPT_DIR, `${persona.slug}.md`);
  await writeFile(outPath, md, 'utf8');
  console.log(`[compose-prompt] ${persona.slug} -> ${outPath}`);
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  const style = await readFile(STYLE_FILE, 'utf8');
  const filter = new Set(process.argv.slice(2));
  const picks = filter.size ? registry.filter(p => filter.has(p.slug)) : registry;

  if (!picks.length) {
    console.error('No personas matched.');
    process.exit(1);
  }
  for (const persona of picks) {
    await composeForPersona(persona, style);
  }
}

main();
