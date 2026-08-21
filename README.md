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

`NEXT_PUBLIC_SITE_URL` — the canonical origin, used for canonical URLs,
`sitemap.xml`, the RSS feed and JSON-LD. Set it in the Vercel project settings
(e.g. `https://blog.copybit.org`). Defaults to `https://blog.copybit.org`.

Site identity and the category whitelist live in `src/lib/site.ts`; design
tokens in `src/app/globals.css`.
