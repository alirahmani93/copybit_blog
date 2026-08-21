/**
 * Single source of truth for site identity and the pillar whitelist.
 *
 * The canvas note on the Breadcrumb artboard is explicit about this: one list
 * drives the breadcrumb parent, the header nav and the home chips. Adding a
 * new pillar means editing one array.
 */

export const site = {
  name: "CopyBit",
  kicker: "وبلاگ",
  kickerEn: "Blog",
  title: "وبلاگ کوپی‌بیت",
  description:
    "معاملات فیوچرز و اسپات روی هایپرلیکوئید، به زبان خودتان. تحلیل، آموزش و راهنمای کاربردی.",
  descriptionEn:
    "Perps and spot on Hyperliquid, explained. Analysis, education and practical guides.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://blog.copybit.org",
  appUrl: "https://copybit.org/fa",
  ctaLabel: "ورود به کوپی‌بیت",
  ctaLabelEn: "Open App",
  locale: "fa_IR",
  author: "تیم کوپی‌بیت",
  disclaimer:
    "معاملات اهرمی ریسک از دست دادن کل سرمایه را دارد. محتوای این وبلاگ توصیه سرمایه‌گذاری نیست.",
} as const;

/** Pillar categories. `slug` is the URL segment, `name` the display label. */
export const pillars = [
  { slug: "amoozesh", name: "آموزش پایه", blurb: "مکانیزم فیوچرز، لوریج، فاندینگ و کپی معامله — نوشته‌شده برای کسی که تازه شروع کرده." },
  { slug: "tahlil", name: "تحلیل", blurb: "تحلیل بنیادی و تکنیکال بازارها، کوین‌ها و کالاها — با عدد و منبع." },
  { slug: "strategy", name: "استراتژی", blurb: "مدیریت ریسک، سایز پوزیشن و ساختن یک برنامه معاملاتی که بشود به آن پایبند ماند." },
  { slug: "market", name: "بازار", blurb: "اتفاق‌های بازار، فاندینگ، نقدینگی و آنچه پشت حرکت قیمت‌ها می‌گذرد." },
  { slug: "product", name: "محصول", blurb: "قابلیت‌های کوپی‌بیت، کارمزدها و تغییرات محصول." },
  { slug: "rahnama", name: "راهنما", blurb: "ابزارها و راهنماهای گام‌به‌گام برای کارهایی که هر روز انجام می‌دهید." },
] as const;

export type Pillar = (typeof pillars)[number];

export const pillarNames: readonly string[] = pillars.map((p) => p.name);

export function pillarBySlug(slug: string): Pillar | undefined {
  return pillars.find((p) => p.slug === slug);
}

export function pillarByName(name: string): Pillar | undefined {
  return pillars.find((p) => p.name === name);
}

/**
 * Resolve a post's parent pillar from its flat label list: the first label that
 * appears in the whitelist wins; everything else stays a plain tag. If none
 * match, the first label is used as-is.
 */
export function resolvePillar(labels: readonly string[]): { name: string; href: string } | null {
  for (const label of labels) {
    const hit = pillarByName(label);
    if (hit) return { name: hit.name, href: `/c/${hit.slug}` };
  }
  const first = labels[0];
  if (!first) return null;
  return { name: first, href: `/search?q=${encodeURIComponent(first)}` };
}
