import type { MetadataRoute } from "next";
import { listedPosts, pageSlugs } from "@/lib/posts";
import { pillars, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = listedPosts();
  const newest = posts[0]?.date ?? new Date().toISOString();

  return [
    { url: `${site.url}/`, lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/en`, lastModified: newest, changeFrequency: "weekly", priority: 0.5 },
    ...pillars.map((p) => ({
      url: `${site.url}/c/${p.slug}`,
      lastModified: newest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/${p.slug}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "monthly" as const,
      priority: p.featured ? 0.9 : 0.8,
    })),
    ...pageSlugs().map((slug) => ({
      url: `${site.url}/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
