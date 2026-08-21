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

Site identity and the category whitelist live in `src/lib/site.ts`; design
tokens in `src/app/globals.css`.
