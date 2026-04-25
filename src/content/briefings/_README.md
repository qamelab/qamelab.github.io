# Briefings

Daily editorial briefings written by the qame-comms team.

## Filename

`YYYY-MM-DD.md` (e.g. `2026-04-25.md`). The filename is canonical — it
becomes the URL slug and must match the `date` in frontmatter.

## Frontmatter

```yaml
---
date: 2026-04-25                       # required, ISO 8601
title: "Eval saturation week"          # optional thematic headline
summary: "1–2 line abstract for the index card."  # optional
tags: ["AI evals", "platforms"]        # optional
byline: "Comms team"                   # optional
---
```

Only `date` is required. Everything else optional.

## Body conventions

- Open with one short paragraph framing the day, or skip straight to items.
- Each topic is one `## H2` heading. 4–6 per issue. ~400–500 words each.
- Inline links freely: `[the bill text](https://example.com)`.
- Close each item with a `**Sources:**` line if the citations are denser
  than the inline links cover. Format: `**Sources:** [Name](url) · [Name](url)`.
- Separate items with `---` (markdown horizontal rule) or just blank lines.

The team page reads briefings via `getCollection('briefings')` and renders
them with the global markdown styles in `src/styles/global.css`. Headings,
links, and the orange accent rule are styled centrally — the file just
needs to be valid markdown.
