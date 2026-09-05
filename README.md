# CopyBit Blog

Persian-first (RTL) blog for [CopyBit](https://copybit.org/fa), built to the
"CopyBit Blog Redesign" canvas: light and dark themes, a long-form article
template with a table of contents, an answer panel aimed at AI search, and
server-rendered structured data.

Next.js App Router · markdown content in git · deployed on Vercel.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Writing

Articles are markdown files in `content/posts/`. Create one with:

```bash
npm run post:new -- --title "عنوان مطلب" --category "تحلیل"
```

Then edit the file, `npm run post:check`, commit and push. Vercel deploys on
push to `main`.

`CLAUDE.md` documents the frontmatter, the body conventions and the publishing
rules in full — it is written for both people and agents.

| Command | |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run post:new` | scaffold a post |
| `npm run post:list` | list posts with their flags |
| `npm run post:rm -- <slug>` | delete a post |
| `npm run post:check` | validate frontmatter |

## Configuration

All optional — set them in the Vercel project settings. `NEXT_PUBLIC_*` values
are inlined at build time, so changing one needs a redeploy to take effect.

| Variable | |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonical tags, `sitemap.xml`, RSS and JSON-LD. Defaults to `https://blog.copybit.org` in production. |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami website id. Analytics load only when this is set. |
| `NEXT_PUBLIC_UMAMI_SRC` | Umami script URL. Defaults to `https://cloud.umami.is/script.js`; set it to `https://<your-host>/script.js` when self-hosting. |
| `NEXT_PUBLIC_UMAMI_DOMAINS` | Hosts that report data. Defaults to `blog.copybit.org`, which keeps preview deployments out of your stats. |
| `NEXT_PUBLIC_UMAMI_TAG` | Optional Umami tag stamped on every event — useful to separate a redesign or a campaign in the dashboard. |
| `NEXT_PUBLIC_UMAMI_DISABLED` | Set to `1` to not load the script at all. |

Site identity and the category whitelist live in `src/lib/site.ts`; design
tokens in `src/app/globals.css`.

## Analytics events

Every event carries `lang`, and `pillar` on post and category pages — stamped
automatically by the `data-before-send` hook in `src/components/Analytics.tsx`,
which reads the `x-lang` / `x-pillar` meta tags each page emits. So any event
below can be broken down by section in the dashboard without the call site
passing it.

Plain links use `data-umami-event` attributes (no JS). Anything with a computed
value goes through `track()` in `src/lib/analytics.ts`, which no-ops when the
script is blocked.

| Event | Properties | Fired by |
| --- | --- | --- |
| `scroll-depth` | `slug`, `depth` (25/50/75) | `ReadingProgress` |
| `post-finished` | `slug`, `depth` (100) | `ReadingProgress` |
| `search` | `query`, `results` | `SearchView`, debounced 900ms |
| `search-no-results` | `query`, `results` | `SearchView` — the content-gap list |
| `search-result-click` | `slug`, `query`, `position` | `SearchView` |
| `search-clear` | — | `SearchView` |
| `faq-open` | `question`, `slug`, `position` | `Faq` |
| `toc-click` | `section`, `slug` | `Toc` |
| `post-click` | `slug`, `place` (`home` · `featured` · `related` · `next-post` · `category`), `from` | cards, rows, next-post |
| `badge-click` | `pillar` | cards, rows, featured |
| `chip-click` / `chip-clear` | `category` | `Chips` |
| `nav-pillar` | `pillar`, `placement` | header, footer |
| `nav-search` | `placement` | header |
| `nav-menu-toggle` | — | header |
| `lang-switch` | `to` | header, footer, chips |
| `theme-toggle` | `theme` | `ThemeToggle` |
| `share` | `network`, `slug` | post page |
| `permalink` | `slug` | post page |
| `tag-click` | `tag`, `slug` | post page |
| `older-posts` | — | home |
| `rss-click`, `footer-fees` | — | footer |
| `cta-header` · `cta-mobile-nav` · `cta-footer-trade` · `cta-footer-copy` · `cta-post` | `placement`, `lang`, plus `cta` + `slug` on `cta-post` | outbound CTAs |

Two reports worth building on top of these in Umami: a **funnel** of
`pageview` → `scroll-depth` 75 → `cta-post`, which shows whether an article
actually earns its click, and a **goal** on `search-no-results` — every entry
there is a post someone wanted and we have not written.
