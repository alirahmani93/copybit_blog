# Cover / hero image prompts

AI-image prompts for each post's hero image. The goal is a **cohesive, premium,
editorial look** across the whole blog — not 26 unrelated stock images.

## How to use

1. **Every prompt = the shared STYLE block + that post's SUBJECT line.** Paste the
   STYLE block first, then the subject. (Two fully-assembled examples are at the
   bottom.)
2. Generate **16:9 landscape**, at least **1600 px wide** (Midjourney: add
   `--ar 16:9 --style raw`; DALL·E 3: pick 1792×1024; others: 16:9 or 1.9:1).
3. Save as **`/public/images/cover-<slug>.jpg`** (or `.png`/`.webp`).
4. Add to the post's frontmatter:
   ```yaml
   cover: /images/cover-<slug>.jpg
   coverAlt: "یک توضیح کوتاه فارسی از تصویر"   # for accessibility + SEO
   ```
   `cover:` replaces the generated art; `coverAlt` is the alt text.

## STYLE block (prepend to every subject)

> Premium editorial 3D-rendered concept illustration for a crypto and finance
> analysis blog. Cinematic, dark, minimal and intelligent — calm, not hype.
> Deep near-black indigo background (hex 0d0e12) with a faint technical grid and
> soft volumetric haze. Main light is electric indigo-violet (hex 5b6ef5 glowing
> to 7b8eff). Clean geometry, soft depth of field, subtle rim light, matte
> surfaces with occasional translucent glass. Generous negative space. No text,
> letters, numbers, logos, watermarks or human faces; avoid cliché gold coins
> and rocket ships. 16:9 landscape, ultra-detailed, studio quality.

Each subject below also names a **secondary accent** — one extra color used
sparingly, so posts share the indigo base but stay distinguishable.

---

## Subjects (one per post)

**japan-fed-749416** — «ژاپن چطور دست فدرال رزرو را بسته است؟»
Subject: a colossal minimalist torii-gate silhouette casting a long shadow across
a Western neoclassical financial column and dome, quiet tension between two
monetary powers, a taut thread of light connecting them. Secondary accent: a
single deep red (Japan).

**anthropic-openai-ipo-f9389f** — «آنتروپیک و اوپن‌ای‌آی: بازار پیش از عرضه»
Subject: two towering abstract monoliths of light facing each other before a dim
stock-exchange horizon, a bright rising threshold of light building between them,
a sense of an imminent public debut. Secondary accent: cool white.

**rwa-tokenize-b8e4d2** — «توکنایز شدن دارایی‌ها (RWA)»
Subject: a solid bar of real-world value dissolving at one edge into a neat
lattice of glowing translucent cubes flowing onto a blockchain mesh, physical
collateral becoming digital tokens. Secondary accent: emerald.

**heatmap-liquidation-a3f1d7** — «هیت مپ لیکوئیدیشن»
Subject: a floating horizontal heat-map band over a dark price grid, soft bars
ranging from cool dim to hot bright, a few clusters glowing intensely like
thermal hotspots. Secondary accent: amber-to-red gradient.

**lead-trader-shodan-bb51a4** — «چطور لید تریدر شویم؟»
Subject: one bright leading node at the front emitting concentric signal rings,
many smaller follower nodes trailing in its wake and lighting up in sequence, a
broadcast-and-copy network. Secondary accent: teal.

**stop-loss-ejra-nashod-e3b1a7** — «چرا استاپ لاس اجرا نشد؟»
Subject: a thin protective gate-line meant to catch a fast downward stream of
particles, but the stream slips through a gap past it, a safety mechanism just
missing. Secondary accent: red.

**adl-kahesh-khodkar-595228** — «کاهش خودکار اهرم (ADL)»
Subject: a precise mechanical arm forcibly unplugging one bright position node
from a chain of connected nodes, an automated systemic deleveraging. Secondary
accent: amber.

**ekhtelaf-sood-copy-trade-c068eb** — «چرا سود کپی ترید من با لید تریدر فرق دارد؟»
Subject: two glowing trajectory lines starting from the exact same point then
gradually diverging into a widening gap, same origin, different outcomes.
Secondary accent: teal.

**token-scam-tashkhis-b7d219** — «توکن اسکم را چطور تشخیص دهیم؟»
Subject: a glossy coin-like token catching the light beautifully, but its core is
subtly hollow and faintly cracked, a warning aura around it, deceptive shine over
emptiness. Secondary accent: red.

**moamele-jofti-a4e1b7** — «معامله جفتی»
Subject: two correlated abstract asset-forms balanced on the two ends of a
minimalist spread/scale, one rising one falling, a market-neutral equilibrium.
Secondary accent: teal.

**risk-kol-hesab-53cdf5** — «ریسک کل حساب»
Subject: several glowing position nodes of different sizes all held inside one
translucent boundary sphere, total exposure contained in a single shell.
Secondary accent: indigo only.

**roe-futures-d48b30** — «ROE در فیوچرز»
Subject: a small modest amount of light passing through a magnifying lens and
projecting as a large glowing form on the far wall, leverage amplifying a figure.
Secondary accent: amber.

**naft-venezuela-8f31c4** — «قرارداد نفتی ونزوئلا چرا قیمت نفت را تکان نداد؟»
Subject: sculptural abstract oil-barrel forms in the foreground and a perfectly
flat, unmoving price line, while a dramatic event-flare glows but fades in the
far background, a big event that didn't move the market. Secondary accent: warm
amber.

**hoosh-masnooi-poshte-cab48c** — «سرمایه‌گذاری روی هوش مصنوعی: چهار طبقه»
Subject: four stacked glowing strata forming a clean layered pyramid of AI
infrastructure, a fine neural mesh threading through the layers. Secondary accent:
violet.

**copy-trading-onchain-09cf7d** — «کپی تریدینگ آنچین»
Subject: a transparent chain of linked trade-blocks mirroring one lead position
outward into several follower wallet-nodes, an open on-chain copy network.
Secondary accent: emerald.

**chargesh-naghdinegi-480088** — «چرخش نقدینگی»
Subject: a luminous current of liquidity flowing and rotating between several
distinct asset basins arranged in a ring, capital rotating from one sector to the
next. Secondary accent: teal.

**saat-moamelat-crypto-9f8d83** — «ساعت معاملات ارز دیجیتال»
Subject: a 24-hour circular ring of market depth, some segments deep and brightly
lit, others thin and dim, the uneven rhythm of global trading sessions. Secondary
accent: indigo only.

**btc-tahlil-0757e6** — «تحلیل بیت‌کوین»
Subject: a monumental faceted geometric monolith standing at a crossroads on a
dark data terrain under soft light, an asset at a decision point — abstract, not a
literal gold coin. Secondary accent: restrained amber.

**mark-price-liquidation-0cecc0** — «قیمت مارک چیست»
Subject: two price traces side by side — one calm smooth "mark" line and one
jagged spiky "last" line — the calm line quietly crossing a liquidation threshold.
Secondary accent: red.

**hazine-pozision-futures-90f240** — «هزینه نگه‌داشتن پوزیشن فیوچرز»
Subject: a bright position node slowly leaking fine particles along a horizontal
time axis, its glow dimming as it drifts, the steady drain of funding cost.
Secondary accent: amber.

**basis-trade-18fd5d** — «بیسیس ترید»
Subject: two parallel lines — spot and futures — with a glowing measured gap
between them that narrows and converges over time, a harvested spread. Secondary
accent: teal.

**stoploss-risk-4f00d3** — «مدیریت ریسک: استاپ لاس و سایز پوزیشن»
Subject: a clean protective bracket around a position, with a measuring ruler
setting its distance and deriving the position's size, disciplined risk geometry.
Secondary accent: emerald.

**entekhab-lead-trader-8d688f** — «انتخاب لید تریدر»
Subject: several candidate track-record curves glowing side by side, a spotlight
selecting and lifting one of them forward for inspection, evaluation and choice.
Secondary accent: indigo only.

**coinlegs-6d2fe0** — «آموزش کوین‌لگز»
Subject: a sweeping radar scan-line passing over a wide field of scattered market
signals, catching and highlighting a few emerging patterns. Secondary accent:
teal.

**hype-tahlil-bonyadi-340d86** — «تحلیل بنیادی کامل هایپ (HYPE)»
Subject: an abstract asset-form opened into transparent cross-section layers,
revealing an inner glowing mechanism of revenue and flow, a fundamental x-ray.
Secondary accent: violet.

**copper-tahlil-c7a2c6** — «تحلیل کامل مس»
Subject: gleaming abstract copper-metallic ingots and industrial supply-demand
lattice forms on a dark editorial ground, warm metal against cool indigo, a
commodity study. Secondary accent: warm copper-orange.

---

## Template for future posts

> [STYLE block above] Subject: [one concrete visual metaphor for the post's core
> idea — an object/mechanism, not a scene with people]. Secondary accent:
> [one color].

Rules that keep the set cohesive:
- One **central metaphor**, lots of empty space, shot like a studio product render.
- Keep the **indigo base**; change only the **secondary accent** and the subject.
- **Never** bake in text/numbers — the title and social banner add text separately.
- Prefer **mechanism over cliché** (no gold coins, bulls/bears, rockets, hoodie hackers).

## Two fully-assembled examples (copy-paste ready)

**japan-fed-749416:**
> Premium editorial 3D-rendered concept illustration for a crypto and finance analysis blog. Cinematic, dark, minimal and intelligent — calm, not hype. Deep near-black indigo background (hex 0d0e12) with a faint technical grid and soft volumetric haze. Main light is electric indigo-violet (hex 5b6ef5 glowing to 7b8eff). Clean geometry, soft depth of field, subtle rim light, matte surfaces with occasional translucent glass. Generous negative space. No text, letters, numbers, logos, watermarks or human faces; avoid cliché gold coins and rocket ships. 16:9 landscape, ultra-detailed, studio quality. Subject: a colossal minimalist torii-gate silhouette casting a long shadow across a Western neoclassical financial column and dome, quiet tension between two monetary powers, a taut thread of light connecting them. Secondary accent: a single deep red. --ar 16:9 --style raw

**rwa-tokenize-b8e4d2:**
> Premium editorial 3D-rendered concept illustration for a crypto and finance analysis blog. Cinematic, dark, minimal and intelligent — calm, not hype. Deep near-black indigo background (hex 0d0e12) with a faint technical grid and soft volumetric haze. Main light is electric indigo-violet (hex 5b6ef5 glowing to 7b8eff). Clean geometry, soft depth of field, subtle rim light, matte surfaces with occasional translucent glass. Generous negative space. No text, letters, numbers, logos, watermarks or human faces; avoid cliché gold coins and rocket ships. 16:9 landscape, ultra-detailed, studio quality. Subject: a solid bar of real-world value dissolving at one edge into a neat lattice of glowing translucent cubes flowing onto a blockchain mesh, physical collateral becoming digital tokens. Secondary accent: emerald. --ar 16:9 --style raw
