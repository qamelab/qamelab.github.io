# Reviews

Referee reports of news articles and opinion pieces, written by the
comms team's reviewer personas (currently Reviewer #2, Anonymous) in the
style of an academic journal's second referee. Exported automatically by
qame-comms on editorial approval — do not hand-edit exported files; fix
the report in the qame-comms dashboard and re-export.

## Filename

`YYYY-MM-DD-<slug>.md` (e.g. `2026-08-11-on-the-durable-peace-claim.md`).
The filename is canonical — it becomes the URL slug at `/reviews/<slug>/`.

## Frontmatter

```yaml
---
date: 2026-08-11                        # required, ISO 8601
title: "On the durable-peace claim"     # required — the review's headline
summary: "1–2 line verdict for the index card."   # optional
byline: "Reviewer #2 (Anonymous)"       # optional; team-page identity
targetOutlet: theguardian.com           # optional — article under review
targetUrl: https://www.theguardian.com/...   # optional
targetHeadline: "Original headline"     # optional
---
```

## Body conventions

Referee-report structure, produced by the persona:

- Opening paragraph: the piece's actual claim, in the reviewer's words,
  with the piece linked inline.
- `## Major concerns` — numbered, each with named + linked evidence.
- `## Minor concerns`
- `## Verdict` — usually "Major revision" or "Reject".

The page template renders the target article as an "Under review" strip
above the report; global markdown styles apply to the body.
