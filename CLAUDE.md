# QAME Lab Website

## Project Overview

Website for QAME Lab (Quantitative Agentic & Media Economics Lab), an
affiliated research lab of the Institute for Applied Data Science & Finance at
Bern University of Applied Sciences (BFH).

**Stack:** Astro 5, static site, deployed to GitHub Pages.

**Design:** Light Swiss minimalist. Hanken Grotesk for UI, JetBrains Mono for
metadata (paper IDs, dates, tech stacks, formats). Burnt-orange accent
(`#c4622a`), generous whitespace, typography-driven hierarchy. Light mode only.
The only decorative element is the short orange `<hr class="rule">` below
section headings.

## Project Structure

```
src/
├── content/
│   ├── config.ts           # Collection schemas
│   ├── papers/             # QAME Paper Series entries (.md)
│   ├── publications/       # Peer-reviewed articles (.md)
│   ├── team/               # Current members + alumni (.md)
│   ├── projects/           # Ongoing funded projects (.md)
│   ├── grants/             # Previous grants (.md)
│   ├── software/           # Open-source tools (.md)
│   ├── data/               # Datasets (.md)
│   └── news/               # Social feed items (.json)
├── layouts/
│   └── Base.astro          # HTML shell, meta, fonts, global CSS
├── components/
│   ├── Header.astro        # Sticky nav, BFH affiliation, active state
│   ├── Footer.astro        # Institutional links, contact, copyright
│   ├── ResearchAreas.astro # Four-pillar grid with orange labels
│   ├── FeedSidebar.astro   # Social feed (3 posts + see-more)
│   ├── ProjectsGrants.astro# Ongoing cards + collapsible grant list
│   ├── AuthorList.astro    # Renders authors with QAME members bolded
│   └── PaperCard.astro     # QAME Paper Series card
├── pages/
│   ├── index.astro         # Home (Research): hero, areas+feed, projects
│   ├── papers/
│   │   ├── index.astro     # 3-layer: Series, Published, Earlier
│   │   └── [slug].astro    # Detail page with sidebar + BibTeX
│   ├── software/index.astro
│   ├── data/index.astro
│   └── team/index.astro    # Current cards + alumni ledger
└── styles/
    └── global.css          # Design tokens, base, utilities
```

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

GitHub Pages from the `dist/` directory. Configure in repo Settings → Pages → Source: GitHub Actions (or deploy from `gh-pages` branch using a workflow).

## Skills

See `.claude/skills/` for task-specific instructions:
- `add-paper.md` — Adding a paper to the QAME Paper Series
- `add-publication.md` — Adding a peer-reviewed article
- `add-team-member.md` — Adding a current or former member
- `add-project.md` — Adding an ongoing project or grant
- `add-software.md` — Adding a software project
- `add-dataset.md` — Adding a dataset
- `update-content.md` — Editing static copy (hero, research areas, contact)
