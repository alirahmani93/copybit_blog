import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { countWords, excerpt, readingMinutes, renderMarkdown, type TocEntry } from "./markdown";
import { resolvePillar, site } from "./site";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export type Lang = "fa" | "en";

export type Faq = { q: string; a: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  lang: Lang;
  labels: string[];
  pillar: { name: string; href: string } | null;
  author: string;
  cover?: string;
  coverAlt?: string;
  art: ArtKind;
  featured: boolean;
  unlisted: boolean;
  draft: boolean;
  readingMinutes: number;
  words: number;
  faq: Faq[];
  cta?: { title: string; dek?: string; label?: string; href?: string };
};

export type Post = PostMeta & { body: string };
export type RenderedPost = PostMeta & { html: string; toc: TocEntry[] };

export type PageDoc = {
  slug: string;
  title: string;
  description: string;
  lang: Lang;
  updated?: string;
  html: string;
  toc: TocEntry[];
};

/** Placeholder cover art styles, matching the artboards' generated SVGs. */
export const ART_KINDS = ["bars", "line-up", "line-down", "cards", "mark"] as const;
export type ArtKind = (typeof ART_KINDS)[number];

function readDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function pickArt(data: Record<string, unknown>, slug: string): ArtKind {
  const declared = typeof data.art === "string" ? data.art : "";
  if ((ART_KINDS as readonly string[]).includes(declared)) return declared as ArtKind;
  // Stable pseudo-random pick so a post keeps the same art across builds.
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ART_KINDS[h % ART_KINDS.length];
}

function parseFaq(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const q = String(rec.q ?? rec.question ?? "").trim();
      const a = String(rec.a ?? rec.answer ?? "").trim();
      return q && a ? { q, a } : null;
    })
    .filter((v): v is Faq => v !== null);
}

function parseCta(value: unknown): PostMeta["cta"] {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  const title = String(rec.title ?? "").trim();
  if (!title) return undefined;
  return {
    title,
    dek: rec.dek ? String(rec.dek) : undefined,
    label: rec.label ? String(rec.label) : undefined,
    href: rec.href ? String(rec.href) : undefined,
  };
}

function toPost(file: string, dir: string): Post | null {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data, content } = matter(raw);
  const slug = String(data.slug || file.replace(/\.mdx?$/, "")).trim();
  const title = String(data.title ?? "").trim();
  if (!slug || !title) return null;

  const date = data.date ? new Date(data.date).toISOString() : new Date(0).toISOString();
  const labels = asStringArray(data.labels ?? data.tags ?? data.category);
  const lang: Lang = data.lang === "en" ? "en" : "fa";

  return {
    slug,
    title,
    description: String(data.description ?? data.dek ?? excerpt(content)).trim(),
    date,
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    lang,
    labels,
    pillar: resolvePillar(labels),
    author: String(data.author ?? site.author),
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    art: pickArt(data as Record<string, unknown>, slug),
    featured: data.featured === true,
    unlisted: data.unlisted === true,
    draft: data.draft === true,
    readingMinutes: Number(data.readingMinutes) || readingMinutes(content),
    words: countWords(content),
    faq: parseFaq(data.faq),
    cta: parseCta(data.cta),
    body: content,
  };
}

let cache: Post[] | null = null;

function loadAll(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const posts = readDir(POSTS_DIR)
    .map((f) => toPost(f, POSTS_DIR))
    .filter((p): p is Post => p !== null)
    .filter((p) => !p.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = posts;
  return posts;
}

/** Every post, including unlisted ones — for routing and sitemap decisions. */
export function allPosts(): Post[] {
  return loadAll();
}

/** Posts that appear in listings. Unlisted posts are reachable by link only. */
export function listedPosts(lang?: Lang): Post[] {
  return loadAll().filter((p) => !p.unlisted && (!lang || p.lang === lang));
}

export function postBySlug(slug: string): Post | undefined {
  return loadAll().find((p) => p.slug === slug);
}

export function featuredPost(lang: Lang = "fa"): Post | undefined {
  const listed = listedPosts(lang);
  return listed.find((p) => p.featured) ?? listed[0];
}

export function postsByPillar(pillarName: string, lang?: Lang): Post[] {
  return listedPosts(lang).filter((p) => p.pillar?.name === pillarName);
}

export function postsByLabel(label: string, lang?: Lang): Post[] {
  const needle = label.trim().toLowerCase();
  return listedPosts(lang).filter((p) =>
    p.labels.some((l) => l.toLowerCase() === needle)
  );
}

/** Labels in use, most-used first — drives the chip row. */
export function activeLabels(lang?: Lang): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of listedPosts(lang)) {
    for (const label of post.labels) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fa"));
}

export function adjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const post = postBySlug(slug);
  if (!post) return {};
  const pool = listedPosts(post.lang);
  const i = pool.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { next: pool[i + 1], prev: pool[i - 1] };
}

export function relatedPosts(slug: string, limit = 3): Post[] {
  const post = postBySlug(slug);
  if (!post) return [];
  const labels = new Set(post.labels.map((l) => l.toLowerCase()));
  return listedPosts(post.lang)
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.labels.filter((l) => labels.has(l.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((r) => r.post);
}

export async function renderPost(post: Post): Promise<RenderedPost> {
  const { html, toc } = await renderMarkdown(post.body);
  const { body: _body, ...meta } = post;
  return { ...meta, html, toc };
}

/** Lightweight index shipped to the client for instant search. */
export type SearchDoc = {
  slug: string;
  title: string;
  description: string;
  labels: string[];
  lang: Lang;
  date: string;
  minutes: number;
  art: ArtKind;
  haystack: string;
};

export function searchIndex(): SearchDoc[] {
  return listedPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    labels: p.labels,
    lang: p.lang,
    date: p.date,
    minutes: p.readingMinutes,
    art: p.art,
    haystack: [p.title, p.description, p.labels.join(" ")].join(" ").toLowerCase(),
  }));
}

/* ── Static pages (about, terms, …) ──────────────────────────────────────── */

export function pageSlugs(): string[] {
  return readDir(PAGES_DIR).map((f) => f.replace(/\.mdx?$/, ""));
}

export async function pageBySlug(slug: string): Promise<PageDoc | null> {
  const file = [`${slug}.md`, `${slug}.mdx`].find((f) =>
    fs.existsSync(path.join(PAGES_DIR, f))
  );
  if (!file) return null;
  const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const { html, toc } = await renderMarkdown(content);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? excerpt(content)),
    lang: data.lang === "en" ? "en" : "fa",
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    html,
    toc,
  };
}
