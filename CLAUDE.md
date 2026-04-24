# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for QAME Lab (Quantitative Agentic & Media Economics Lab), an
affiliated research lab of the Institute for Applied Data Science & Finance at
Bern University of Applied Sciences (BFH).

**Stack:** Astro 5, static site, deployed to GitHub Pages.
**Site:** https://qamelab.org

**Design:** Light Swiss minimalist. Hanken Grotesk for UI, JetBrains Mono for
metadata (paper IDs, dates, tech stacks, formats). Burnt-orange accent
(`#c4622a`), generous whitespace, typography-driven hierarchy. Light mode only.
The only decorative element is the short orange `<hr class="rule">` below
section headings.

## Architecture

- **Content collections** in `src/content/` (papers, publications, team, projects,
  grants, software, data, news) with Zod schemas in `src/content/config.ts`.
- **Pages** in `src/pages/` — Astro file-based routing. `papers/[slug].astro` is
  the only dynamic route (paper detail pages).
- **Components** in `src/components/` — all `.astro`, no framework (React/Vue/etc).
- **Single layout** `src/layouts/Base.astro` — HTML shell, fonts, global CSS.
- **Styles** in `src/styles/global.css` — design tokens, base styles, utilities.
  No CSS modules or preprocessors.

## Content Collections

### Papers — QAME Paper Series (`src/content/papers/*.md`)
- **Filename:** `qame-YYYY-NNN.md` (e.g. `qame-2026-001.md`)
- **Required:** `id`, `title`, `authors`, `date`, `abstract`
- **Optional:** `qameAuthors` (subset bolded in display), `keywords`, `pdf`,
  `doi`, `arxiv`, `ssrn`, `replication`
- **Body:** Rendered below the abstract on the detail page (use for extended
  summaries, supplementary material, links to replication).

### Publications — peer-reviewed articles (`src/content/publications/*.md`)
- **Required:** `title`, `authors`, `venue`, `year`
- **Optional:** `qameAuthors`, `doi`, `preprint`, `replication`,
  `fromQamePaper` (e.g. `"QAME-2025-003"` — shows cross-reference badge)
- **`era`:** `"since-founding"` (default) or `"earlier"` — controls which
  section the publication appears in on the Papers page.

### Team (`src/content/team/*.md`)
- **Required:** `name`, `role`, `affiliation`
- **`status`:** `"current"` (default) or `"alumni"`.
- **Current members:** `website`, `email`, `initials` (auto-derived if omitted),
  `order` (lower = higher on page; director = 1).
- **Alumni:** `alumniRole`, `currentPosition`, `yearLeft`. Displayed as a
  four-column ledger sorted by `yearLeft` descending.

### Projects — ongoing funded work (`src/content/projects/*.md`)
- **Required:** `title`, `funder`, `yearStart`, `pi`, `description`
- **Optional:** `yearEnd`, `partner`, `order`
- **Note:** Only funded projects are shown per design decision. Unfunded work
  lives on the Software page or paper entries.

### Grants — completed (`src/content/grants/*.md`)
- **Required:** `title`, `funder`, `pi`, `yearStart`, `yearEnd`
- First 3 shown by default; rest behind a "Show all" toggle.

### Software (`src/content/software/*.md`)
- **Required:** `name`, `stack`, `description`, `repo`
- **Optional:** `fullName`, `logoColor`, `logoText`, `logoGradient`, `order`
- Logo tile renders with `logoGradient` if present, else `logoColor`.
- `logoText` defaults to first 3 chars of `name`.

### Data (`src/content/data/*.md`)
- **Required:** `name`, `format`, `description`
- **Optional:** `doi`, `url`, `logoColor`, `logoText`, `order`

### News (`src/content/news/*.json`) — social feed items
- **Required:** `platform` (`"bluesky"` | `"mastodon"`), `text`, `url`, `postedAt`
- Home page sidebar shows 3 most recent. A build-time script (to be added)
  will populate this from the lab's Bluesky / Mastodon accounts.

## Design Tokens (in `global.css`)

- **Accent:** `--accent: #c4622a` (burnt orange), `--accent-deep: #b05a2a`
- **Text:** `--black: #111111`
- **Background:** `--white: #ffffff`
- **Fonts:** `--font-sans: 'Hanken Grotesk', …`, `--font-mono: 'JetBrains Mono', …`
- **Spacing:** 8px grid (`--space-1` through `--space-24`)
- **Max width:** `--max-width: 72rem` (1152px)

## Key Patterns

- Section pattern: `<p class="label">` → `<h2>` → `<hr class="rule">` → content
- Pillar-tag pattern on cards: `<span class="label-accent">` (orange, caps)
- Mono type reserved for machine-readable metadata: paper IDs, dates,
  tech stacks, data formats, funder tags, DOI stubs
- Author rendering: `<AuthorList authors={…} qameAuthors={…} />` — QAME-affiliated
  authors get `<strong>` emphasis; external co-authors stay regular weight
- Active nav state: orange 2px underline + bold

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Build to dist/
npm run preview   # Preview production build
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml` which builds and
deploys to GitHub Pages via `actions/deploy-pages`. No manual deploy step needed.
