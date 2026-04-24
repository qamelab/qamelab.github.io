# qamelab.org

Website for the **QAME Lab** (Quantitative Agentic & Media Economics) —
an affiliated research lab of the Institute for Applied Data Science & Finance
at Bern University of Applied Sciences (BFH).

**Live site:** https://qamelab.org
**Stack:** [Astro 5](https://astro.build), static site, deployed to GitHub Pages.

---

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # astro check (type + schema)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

Pushes to `main` trigger `.github/workflows/deploy.yml` which builds and
publishes to GitHub Pages. No manual deploy step.

## Adding content

All content lives in `src/content/` as Markdown (papers, publications, team,
projects, grants, software, data) or JSON (news). Schemas are in
`src/content/config.ts` — `npm run check` catches typos, missing required
fields, and broken references at build time.

### Add a QAME Paper

Create `src/content/papers/qame-YYYY-NNN.md`:

```yaml
---
id: "QAME-2026-003"
title: "Paper title"
authors:
  - "First Author"
  - "Second Author"
qameAuthors:        # subset of `authors` affiliated with the lab (bolded)
  - "First Author"
date: 2026-06-01
abstract: "Full abstract text."
keywords:
  - keyword one
  - keyword two
pdf: /papers/qame-2026-003.pdf    # optional; place PDF in public/papers/
doi: 10.5281/zenodo.xxxxxxx       # optional; Zenodo DOI
arxiv: 2606.01234                 # optional
ssrn: 1234567                     # optional
replication: https://github.com/... # optional; must be a URL
---

Optional markdown body rendered below the abstract on the detail page.
```

Filename must match the ID slugified (`QAME-2026-003` → `qame-2026-003.md`).

### Add a peer-reviewed publication

Create `src/content/publications/slug.md`:

```yaml
---
title: "Article title"
authors: ["Author A", "Author B"]
qameAuthors: ["Author A"]
venue: "Journal of X"
year: 2026
doi: 10.1234/abcd
preprint: https://arxiv.org/abs/...      # optional URL
replication: https://github.com/...      # optional URL
fromQamePaper: qame-2026-001             # optional; references a paper by slug
era: since-founding                       # or "earlier" for pre-lab work
---
```

### Add a team member

Current member — `src/content/team/firstname-lastname.md`:

```yaml
---
name: "First Last"
role: "Postdoctoral Researcher"
affiliation: "BFH / Institute for Applied Data Science & Finance"
status: current              # default
order: 5                     # lower = higher on page; director = 1
website: https://...         # optional URL
email: first.last@bfh.ch     # optional email
initials: FL                 # optional; auto-derived from name
---
```

Alumni — same file shape but with `status: alumni`, `yearLeft`
(required), `alumniRole`, `currentPosition`.

### Add a project / grant / software / dataset

See the Zod schemas in `src/content/config.ts` for required fields.
`repo` (software) and `url` (data) must be full URLs; DOIs for data are
just the DOI suffix (no `https://doi.org/` prefix).

### News / social feed

News posts live in `src/content/news/*.json` and are populated
automatically by `scripts/fetch-social.mjs`, which pulls recent
public posts from the lab's Bluesky and Mastodon accounts
(handles configured in `src/config/site.ts`).

The fetcher runs every 6 hours via `.github/workflows/fetch-social.yml`
and commits updates to `main`. Accounts that don't exist yet are skipped
gracefully (no build failure, existing files preserved). Run locally:

```bash
npm run fetch:social
```

To change the instance or handle, edit `src/config/site.ts` **and**
the matching constants at the top of `scripts/fetch-social.mjs`
(duplicated because the script is plain Node ESM).

The home-page sidebar shows the 3 most recent posts.

## Design

Swiss minimalist. Hanken Grotesk for UI, JetBrains Mono for metadata
(paper IDs, dates, tech stacks, formats). Burnt-orange accent
(`#c4622a`), generous whitespace, typography-driven hierarchy. Light
mode only. See `src/styles/global.css` for tokens and
`CLAUDE.md` for component patterns.

## License

Content © QAME Lab, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE`.
