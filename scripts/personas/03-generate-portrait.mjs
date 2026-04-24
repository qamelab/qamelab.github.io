#!/usr/bin/env node
/**
 * Step 3 — generate portrait via Nano Banana (gemini-2.5-flash-image).
 *
 * Reads the composed prompt for each persona and writes a PNG into
 * scripts/personas/out/portraits/ and copies the final image to
 * public/team/<slug>.png for the website to serve.
 *
 * Run: node scripts/personas/03-generate-portrait.mjs [slug ...]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoBananaImage, extFromMime } from './lib/nano-banana.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');
const REGISTRY = join(__dirname, 'personas.json');
const PROMPT_DIR = join(__dirname, 'out/portrait-prompts');
const OUT_DIR = join(__dirname, 'out/portraits');
const PUBLIC_DIR = join(REPO_ROOT, 'public/team');

function stripFrontmatter(md) {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  if (end === -1) return md;
  return md.slice(end + 4).trimStart();
}

async function generateForPersona(persona) {
  const promptPath = join(PROMPT_DIR, `${persona.slug}.md`);
  const prompt = stripFrontmatter(await readFile(promptPath, 'utf8'));

  const { mimeType, base64 } = await nanoBananaImage({
    apiKey: process.env.OPENROUTER_API_KEY,
    prompt,
  });

  const ext = extFromMime(mimeType);
  const buf = Buffer.from(base64, 'base64');

  const archivePath = join(OUT_DIR, `${persona.slug}.${ext}`);
  await writeFile(archivePath, buf);

  const publicPath = join(PUBLIC_DIR, `${persona.slug}.${ext}`);
  await writeFile(publicPath, buf);

  console.log(`[generate-portrait] ${persona.slug} -> ${archivePath}`);
  console.log(`[generate-portrait] ${persona.slug} -> ${publicPath}  (served)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  const filter = new Set(process.argv.slice(2));
  const picks = filter.size ? registry.filter(p => filter.has(p.slug)) : registry;

  if (!picks.length) {
    console.error('No personas matched.');
    process.exit(1);
  }
  for (const persona of picks) {
    try {
      await generateForPersona(persona);
    } catch (err) {
      console.error(`[generate-portrait] ${persona.slug} failed:`, err.message);
      process.exitCode = 1;
    }
  }
}

main();
