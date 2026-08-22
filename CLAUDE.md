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
3. Commit and push to `main`. Vercel builds and the post is live at `/<slug>`,
   and `.github/workflows/telegram.yml` announces it in the Telegram channel.

To scaffold the file instead of writing it by hand:

```bash
npm run post:new -- --title "عنوان" --category "بازارها" --labels "بیت‌کوین,فاندینگ"
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
author: "تیم کپی‌بیت"
labels:                                 # first label decides the category!
  - "بازارها"
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

Pillars: `آموزش پایه` · `مدیریت ریسک` · `کپی‌تریدینگ` · `بازارها` · `تحلیل و ابزار`

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

## Banners and images

**You do not need to make an image for a post.** Every post gets a 1200×630
social share banner generated at build time from its own frontmatter — brand
mark, pillar badge, title, date — by `src/app/[slug]/opengraph-image.tsx`. It is
what Telegram, X and Google show when the link is shared. Nothing to draw,
nothing to upload, and it stays correct if you edit the title later.

Each post also gets in-page cover art chosen by the `art:` field:

| `art:` | Figure | Fits |
| --- | --- | --- |
| `bars` | Rising bar chart on a grid | Fees, costs, comparisons |
| `line-up` | Green upward line | Growth, bullish analysis |
| `line-down` | Red downward line | Drawdown, liquidation, risk |
| `cards` | Two outlined panels | Comparisons, side-by-side concepts |
| `mark` | The CopyBit mark | Product and tool pieces |

Pick the one that matches the argument; omit `art:` and a stable one is derived
from the slug. Supply `cover: /images/foo.jpg` only if you have a real image
worth showing — it replaces both the in-page art and the generated banner.

**Never pre-reverse Persian text anywhere in the app.** `src/lib/rtl.ts` exists
solely because Satori, the OG image renderer, does no bidi reordering; browsers
do. Using it in HTML would render text backwards.

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
npm run post:tg -- <slug> [--dry-run] [--force] [--no-wait]   # announce to Telegram
```

## Telegram announcements

Every push to `main` that **adds** a `content/posts/*.md` file triggers
`.github/workflows/telegram.yml`, which runs `scripts/telegram.mjs` for each new
slug: it polls `/<slug>` until the deploy is live, reads the page's own
`og:image` — the same generated 1200×630 banner — and sends it as a `sendPhoto`
with a caption of title, description, label hashtags and the link.

Editing a post announces nothing. Drafts and unlisted posts are skipped.

Run it by hand for a backfill or a re-send: `npm run post:tg -- <slug>`, with
`--dry-run` to print the caption without sending. There is no sent-ledger, so a
manual run on an already-announced post posts it twice.

Secrets live in the GitHub repo, not here: `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_CHAT_ID` (`@channelusername` or the numeric `-100…` id) as Actions
secrets. The bot must be an admin of the channel.

## Product facts — the only claims you may make about CopyBit

Everything else in a draft fails safely: a weak keyword gives a boring article, a
stiff sentence gets rewritten. Claims about our own product do not fail safely. A
model writing about a Hyperliquid builder with a copy-trading feed will produce a
confident, specific, wrong fee split, because that number is plausible and varies
across every competitor it has read. Published in Farsi on our own blog, that is a
support burden at best.

**If a claim about CopyBit is not in this block, do not make it.** No invented fee
numbers, leverage limits, asset lists, launch dates, user counts or roadmap items.
If an article would benefit from a fact that is not here, write around it and flag
it in the PR description.

| | |
| --- | --- |
| Platform | A Hyperliquid builder — a third-party trading interface built on the Hyperliquid protocol, with a social copy-trading feed |
| Markets | Crypto, US stocks, commodities — spot alongside perpetual futures |
| Minimum deposit | $20 |
| Trading fee | 7 basis points (0.07%) per trade, charged by CopyBit **on top of** Hyperliquid's own protocol fees |
| Fee split | Of that 7 bps: 50% to the signal provider, 40% to CopyBit, 10% to the referrer |
| Copy trading | Traders share positions live; those copied earn from their copiers' fees |
| Deposits | Built-in bridge; accepts USDT, USDC and each chain's native token, from BSC, Polygon, Arbitrum and Base |

The 7 bps applies to every trade, copied or not. Never state or imply that trading
on your own costs less, and never mention custom or negotiated rates for any
trader. State the fee as additional to Hyperliquid's protocol fees rather than
blending them into one number — traders check this, and being straight about it is
worth more than looking cheap.

**Not established — say nothing about these:** whether 7 bps applies to spot at the
same rate as perps · which assets are spot versus perps only · withdrawal chains,
timing or minimums · bridge fees or conversion rates · mobile app availability ·
supported indices or forex · leverage limits · user counts, volumes, launch dates,
roadmap.

## Editorial rules

**Audience.** Persian-speaking retail traders, beginner to intermediate. Crypto
spot and perps, US stocks, gold and commodities, indices. Self-taught,
price-sensitive, sceptical of hype.

**Tone.** Knowledgeable peer, not a guru. Direct, practical, honest about risk.
Never hype, never "financial freedom" language, never urgency.

### Financial content — non-negotiable

- **No price predictions.** Never «بیت کوین به X می‌رسد» or any target price.
- **No buy, sell or entry recommendations.** Explain the mechanism; the reader decides.
- **No guaranteed or implied returns.** Never suggest copy trading is passive income or low risk.
- On copy trading, state plainly that copiers can lose money, that past performance
  does not predict future results, and that a lead trader's incentives are not
  identical to a copier's.
- Where leverage, liquidation or margin come up, show the **downside** math, not just the upside.
- **Nothing about legal status, regulation, tax treatment or availability** of any
  market or platform for Iranian users. We do not have reliable current information
  and a wrong claim here is costly.
- Any price, statistic or market datum must come from a source checked during that
  run, with the date stated. If you cannot verify it, leave it out.

### Persian writing

Natural, human Farsi — never translation-flavoured. Persian `ی` and `ک`, never
Arabic `ي` or `ك`. Correct نیم‌فاصله: `می‌شود`, `پوزیشن‌ها`, `نمی‌توان` — a full
space there is the single most common tell of machine-written Persian.

Banned clichés: `در دنیای امروز` · `بدون شک` · `شایان ذکر است` · `لازم به ذکر است`

**Use the loanwords traders actually type into Google**, not academic Persian.
Introduce the formal term once in parentheses where it genuinely aids
understanding, then use the common term throughout.

| Use | Not |
| --- | --- |
| لوریج | اهرم مالی |
| استاپ لاس | دستور توقف زیان |
| پوزیشن | موقعیت معاملاتی |
| لیکوئید شدن | — |
| مارجین · فاندینگ ریت | — |
| اسپات · فیوچرز · پرپچوال | — |
| کندل · تایم فریم | — |
| ولت / کیف پول | — |

Brand name is **کپی‌بیت** (not کوپی‌بیت).

### SEO and GEO

- Title ≤ 60 characters, containing the primary keyword.
- Primary keyword in the title, the first 100 words, and at least one `##`.
- At least three `##` sections, written as **real user questions**.
- 2–4 internal links to live posts with descriptive Persian anchor text — never «اینجا کلیک کنید».
- At least one comparison or data table.
- The opening `> ` blockquote is a 40–55 word direct answer that **stands entirely
  alone** and could be quoted with no surrounding context. Read it in isolation: if
  it needs the article around it, nothing will cite it.
- A `## نکات کلیدی` list of 3–5 one-sentence takeaways near the top.
- Be specific with entities, numbers and dates — «در سال ۱۴۰۴», not «اخیراً».
- Close with 4–6 `faq:` entries in frontmatter, each answer 40–80 words.

Mention CopyBit only where it is genuinely relevant, in one or two sentences drawn
strictly from the product facts above. **A useful article that never mentions us
beats a thin one that does.**
