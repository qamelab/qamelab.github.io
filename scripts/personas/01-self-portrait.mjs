#!/usr/bin/env node
/**
 * Step 1 — self-portrait.
 *
 * For each persona in personas.json, read the source prompt (the persona's
 * own system-prompt inside qamelab_comms), then ask a creative LLM to
 * *inhabit* the persona and describe how it sees itself in a mirror.
 *
 * Output: scripts/personas/out/self-reflections/<slug>.md
 *
 * Run: node scripts/personas/01-self-portrait.mjs [slug ...]
 *      (no args = all personas)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openrouterChat } from './lib/openrouter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, 'personas.json');
const OUT_DIR = join(__dirname, 'out/self-reflections');

// Creative model for roleplay self-description.
const MODEL = process.env.PERSONA_SELF_MODEL || 'anthropic/claude-sonnet-4.5';

const META_SYSTEM = `You are a character-inhabiting actor. You will be given
another AI persona's system prompt. Your task is to read that prompt
carefully, step fully into the character it defines, and answer one
question from inside the character's point of view.

Do not break character. Do not meta-comment on being an AI. Speak as the
persona would, in their voice.

Your reply is a short mirror self-portrait, written as plain prose, 150–250
words. It will be fed into an image-generation model as part of a portrait
prompt, so be visually concrete: describe appearance, posture, expression,
clothing, and the environment you imagine around yourself. Include at least
one object or symbol that embodies the *kind of thinking* the persona does
(e.g. a causal diagram, a redlined bill, a marked-up galley proof). Include
one thing you would never have in your portrait, and why.

Do NOT include stage directions, JSON, markdown headings, or "As an AI" framings.
Just the prose answer.`;

const QUESTION = `You look into a mirror. Describe what you see —
appearance, posture, expression, what you are wearing, what is in the
room around you. Then name the one object nearest to you, the one
artefact of your work that would always be within arm's reach. Then
name one thing that would never appear in your portrait, and say why.`;

async function generateForPersona(persona) {
  const sourcePrompt = await readFile(persona.sourcePrompt, 'utf8');

  const user = [
    `Below, inside <persona> tags, is the system prompt that defines the`,
    `character you will inhabit. Its display name is: ${persona.displayName}.`,
    `Its stated role on the QAME Lab team is: ${persona.role}.`,
    ``,
    `<persona>`,
    sourcePrompt.trim(),
    `</persona>`,
    ``,
    `Now, fully inside that character, answer:`,
    ``,
    QUESTION,
  ].join('\n');

  const content = await openrouterChat({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: MODEL,
    system: META_SYSTEM,
    user,
    temperature: 0.95,
    maxTokens: 900,
  });

  const md = [
    `---`,
    `slug: ${persona.slug}`,
    `displayName: "${persona.displayName}"`,
    `role: ${persona.role}`,
    `sourcePrompt: ${persona.sourcePrompt}`,
    `model: ${MODEL}`,
    `generatedAt: ${new Date().toISOString()}`,
    `---`,
    ``,
    content,
    ``,
  ].join('\n');

  const outPath = join(OUT_DIR, `${persona.slug}.md`);
  await writeFile(outPath, md, 'utf8');
  console.log(`[self-portrait] ${persona.slug} -> ${outPath}`);
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  const filter = new Set(process.argv.slice(2));
  const picks = filter.size ? registry.filter(p => filter.has(p.slug)) : registry;

  if (!picks.length) {
    console.error('No personas matched. Known slugs:', registry.map(p => p.slug).join(', '));
    process.exit(1);
  }

  for (const persona of picks) {
    try {
      await generateForPersona(persona);
    } catch (err) {
      console.error(`[self-portrait] ${persona.slug} failed:`, err.message);
      process.exitCode = 1;
    }
  }
}

main();
