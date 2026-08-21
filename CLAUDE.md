# CopyBit Blog

Next.js (App Router) blog. Persian-first, RTL, with a dark theme and an English
side. Built to the "CopyBit Blog Redesign" canvas. Deployed on Vercel — a push
to `main` publishes.

**Every article is one markdown file in `content/posts/`.** There is no CMS and
no database. Adding, editing and deleting an article means adding, editing and
deleting a file, then committing and pushing. That is the whole publishing
pipeline, and it is designed for you to drive it directly.

## Publishing an article

1. Write `content/posts/<slug>.md` with the frontmatter below.
2. `npm run post:check` — catches malformed frontmatter and non-pillar categories.
3. Commit and push to `main`. Vercel builds and the post is live at `/<slug>`.

To scaffold the file instead of writing it by hand:

```bash
npm run post:new -- --title "عنوان" --category "تحلیل" --labels "بیت‌کوین,فاندینگ"
```

`--slug` is optional; without it the slug is the slugified title plus a short
random suffix (matching the existing posts, e.g. `copper-tahlil-c7a2c6`).

## Frontmatter

```yaml
---
title: "عنوان پست"                     # required
description: "یک تا دو جمله."           # required in practice — cards, search, OG
date: 2026-08-21                        # required, YYYY-MM-DD
lang: fa                                # fa (default) | en
author: "تیم کوپی‌بیت"
labels:                                 # first label decides the category!
  - "تحلیل"
  - "مس"
art: bars                               # bars | line-up | line-down | cards | mark
featured: false                         # at most one per language
unlisted: false                         # true = reachable by link, hidden + noindex
draft: false                            # true = never built in production
cover: /images/foo.jpg                  # optional; omit to use generated art
cta:                                    # optional dark CTA block after the body
  title: "…"
  dek: "…"
  label: "شروع کنید"
faq:                                    # optional; also emits FAQPage JSON-LD
  - q: "پرسش؟"
    a: "پاسخ."
---
```

### The first label is the category

Labels are flat. The template resolves the parent by taking **the first label
that appears in the pillar whitelist**; everything after it stays a plain tag.
The whitelist lives in `src/lib/site.ts` and drives the breadcrumb, the header
nav and the home chips at once.

Pillars: `آموزش پایه` · `تحلیل` · `استراتژی` · `بازار` · `محصول` · `راهنما`

A post whose first label is not a pillar still publishes, but it gets no `/c/`
page and no breadcrumb parent. `npm run post:check` warns about this.

## Body conventions

The template owns the styling of every tag, so write plain markdown — do not
add inline styles or wrapper divs.

| Write | Renders as |
| --- | --- |
| `> …` as the first block | The «پاسخ کوتاه» answer panel. **Write one.** This is the block AI search and featured snippets lift. |
| `## …` / `### …` | Section headings; both get ids and feed the table of contents automatically. |
| `- …` | Dot-marker list. A list directly under a `## نکات کلیدی` heading is wrapped in a card. |
| `1. …` | Numbered list with Persian-digit badge counters. |
| A GFM table | Bordered card, tabular figures, scrolls horizontally on mobile. |
| A closing `_italic paragraph_` | The muted disclaimer with a rule above it. Omit it and a site-wide disclaimer is added. |

Persian digits belong in Persian sentences (`۱۰٬۰۰۰`), Latin digits in Latin
runs. Do not force Persian digits into Inter — the CSS already handles this.

## Editing and deleting

- **Edit** — change the file. Bump `updated: YYYY-MM-DD` if the change is
  substantive; it drives `dateModified` in the structured data.
- **Hide but keep the URL working** — `unlisted: true`. The post disappears from
  the home page, category pages, search, the sitemap and the RSS feed, and
  becomes `noindex`, but `/<slug>` still resolves. This is right for links you
  send out in Instagram DMs.
- **Unpublish entirely** — `draft: true` keeps the file but excludes it from
  production builds.
- **Delete** — `npm run post:rm -- <slug> --force`, or just delete the file.
  This breaks any existing link to that URL, so prefer `unlisted` unless the
  article is genuinely being retracted.

## Do not break these

- **Never change the slug of a published post.** The four imported articles
  (`hype-tahlil-bonyadi-340d86`, `copper-tahlil-c7a2c6`, `coinlegs-6d2fe0`,
  `stoploss-risk-4f00d3`) are linked from Instagram. Their URLs are load-bearing.
- **At most one `featured: true` per language.** More than one and the first by
  date silently wins.
- **`## نکات کلیدی` is a magic heading** — the list under it gets card
  treatment. Do not use it for a non-list section.
- Structured data is emitted server-side, by the page, from frontmatter. Do not
  hand-write `<script type="application/ld+json">` into a post body — the post
  page already emits `BlogPosting` + `FAQPage`, and the template emits
  `BreadcrumbList` + `Organization` + `WebSite`. Two `Article` types on one page
  is a schema error.

## Layout

```
content/posts/*.md      articles
content/pages/*.md      standalone pages (about, …), served at /<slug>
src/lib/site.ts         site identity + the pillar whitelist
src/lib/posts.ts        frontmatter parsing, queries, search index
src/lib/markdown.ts     markdown pipeline + the structural passes above
src/app/globals.css     design tokens and the whole prose contract
scripts/post.mjs        the post CLI
```

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build — run before pushing a structural change
npm run post:check   # validate all frontmatter
npm run post:list    # what is published, with flags
```
