#!/usr/bin/env node
/**
 * Fetches recent posts from the lab's Bluesky and Mastodon accounts
 * and writes them as JSON files into src/content/news/ matching the
 * `news` collection schema.
 *
 * Usage: node scripts/fetch-social.mjs
 * Run by: .github/workflows/fetch-social.yml (cron) or locally as needed.
 *
 * If both sources return zero posts (e.g. accounts don't exist yet or
 * the API is down), existing files are left untouched so the site keeps
 * building with whatever was last committed.
 */

import { writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const newsDir = join(repoRoot, 'src/content/news');

// Keep this in sync with src/config/site.ts. Duplicated here because the
// Astro config is TS and this script is plain JS/ESM.
const BLUESKY_HANDLE = 'qamelab.bsky.social';
const MASTODON_INSTANCE = 'sciences.social';
const MASTODON_HANDLE = 'qamelab';

const PER_PLATFORM_LIMIT = 20;

/** @returns {Promise<NewsPost[]>} */
async function fetchBluesky(handle) {
  const url = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed');
  url.searchParams.set('actor', handle);
  url.searchParams.set('limit', String(PER_PLATFORM_LIMIT));
  url.searchParams.set('filter', 'posts_no_replies');

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 400 || res.status === 404) {
      console.warn(`[bluesky] account ${handle} not found (${res.status}) — skipping`);
      return [];
    }
    throw new Error(`bluesky fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const feed = Array.isArray(data.feed) ? data.feed : [];

  return feed
    .filter(item => !item.reason) // skip reposts
    .map(item => {
      const post = item.post;
      const rkey = post.uri.split('/').pop();
      const text = post.record?.text ?? '';
      const createdAt = post.record?.createdAt ?? post.indexedAt;
      return {
        id: `bluesky-${rkey}`,
        data: {
          platform: 'bluesky',
          text,
          url: `https://bsky.app/profile/${handle}/post/${rkey}`,
          postedAt: createdAt,
        },
      };
    })
    .filter(p => p.data.text && p.data.postedAt);
}

/** @returns {Promise<NewsPost[]>} */
async function fetchMastodon(instance, handle) {
  const lookupUrl = new URL(`https://${instance}/api/v1/accounts/lookup`);
  lookupUrl.searchParams.set('acct', handle);

  const lookupRes = await fetch(lookupUrl);
  if (!lookupRes.ok) {
    if (lookupRes.status === 404) {
      console.warn(`[mastodon] account @${handle}@${instance} not found — skipping`);
      return [];
    }
    throw new Error(`mastodon lookup failed: ${lookupRes.status} ${lookupRes.statusText}`);
  }
  const account = await lookupRes.json();
  const accountId = account.id;

  const statusesUrl = new URL(`https://${instance}/api/v1/accounts/${accountId}/statuses`);
  statusesUrl.searchParams.set('limit', String(PER_PLATFORM_LIMIT));
  statusesUrl.searchParams.set('exclude_replies', 'true');
  statusesUrl.searchParams.set('exclude_reblogs', 'true');

  const statusesRes = await fetch(statusesUrl);
  if (!statusesRes.ok) {
    throw new Error(`mastodon statuses failed: ${statusesRes.status} ${statusesRes.statusText}`);
  }
  const statuses = await statusesRes.json();

  return statuses
    .map(s => ({
      id: `mastodon-${s.id}`,
      data: {
        platform: 'mastodon',
        text: stripHtml(s.content),
        url: s.url,
        postedAt: s.created_at,
      },
    }))
    .filter(p => p.data.text && p.data.postedAt);
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function clearNewsDir() {
  const entries = await readdir(newsDir);
  await Promise.all(
    entries
      .filter(f => f.endsWith('.json'))
      .map(f => unlink(join(newsDir, f))),
  );
}

async function writePosts(posts) {
  for (const post of posts) {
    const path = join(newsDir, `${post.id}.json`);
    await writeFile(path, JSON.stringify(post.data, null, 2) + '\n', 'utf8');
  }
}

async function main() {
  await mkdir(newsDir, { recursive: true });

  const results = await Promise.allSettled([
    fetchBluesky(BLUESKY_HANDLE),
    fetchMastodon(MASTODON_INSTANCE, MASTODON_HANDLE),
  ]);

  const posts = [];
  for (const [i, r] of results.entries()) {
    const label = i === 0 ? 'bluesky' : 'mastodon';
    if (r.status === 'fulfilled') {
      console.log(`[${label}] fetched ${r.value.length} posts`);
      posts.push(...r.value);
    } else {
      console.warn(`[${label}] error:`, r.reason?.message ?? r.reason);
    }
  }

  if (posts.length === 0) {
    console.warn('No posts fetched from any platform — leaving existing files intact.');
    return;
  }

  posts.sort((a, b) => new Date(b.data.postedAt).valueOf() - new Date(a.data.postedAt).valueOf());

  await clearNewsDir();
  await writePosts(posts);
  console.log(`Wrote ${posts.length} posts to src/content/news/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
