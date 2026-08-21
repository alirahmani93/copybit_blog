import { notFound } from "next/navigation";
import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import Chips from "@/components/Chips";
import PostRow from "@/components/PostRow";
import JsonLd from "@/components/JsonLd";

import { pillarBySlug, pillars, site } from "@/lib/site";
import { postCountLabel } from "@/lib/dates";
import { postsByPillar } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return pillars.map((p) => ({ category: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const pillar = pillarBySlug(category);
  if (!pillar) return {};
  return {
    title: pillar.name,
    description: pillar.blurb,
    alternates: { canonical: `/c/${pillar.slug}` },
    openGraph: {
      type: "website",
      title: `${pillar.name} — ${site.title}`,
      description: pillar.blurb,
      url: `${site.url}/c/${pillar.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const pillar = pillarBySlug(category);
  if (!pillar) notFound();

  const posts = postsByPillar(pillar.name);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="wrap" style={{ paddingTop: 22 }}>
          <Breadcrumbs
            crumbs={[{ name: site.kicker, href: "/" }, { name: pillar.name }]}
            currentPath={`/c/${pillar.slug}`}
          />
        </div>

        <div className="wrap" style={{ paddingTop: 18, display: "flex", flexDirection: "column", gap: 22 }}>
          <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="eyebrow">ستون محتوایی</span>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, lineHeight: 1.5 }}>{pillar.name}</h1>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.95, color: "var(--secondary)", maxWidth: "62ch" }}>
                {pillar.blurb}
              </p>
            </div>
            <span className="tnum" style={{ fontSize: 13, color: "var(--tertiary)", paddingBottom: 6, whiteSpace: "nowrap" }}>
              {postCountLabel(posts.length)}
            </span>
          </header>

          <Chips active={pillar.slug} showEnglish={false} />
        </div>

        <div className="wrap" style={{ paddingTop: 24 }}>
          {posts.length > 0 ? (
            <div className="rows">
              {posts.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty card">
              <strong style={{ color: "var(--text)", fontSize: 16 }}>هنوز مطلبی در این ستون نیست</strong>
              <span style={{ fontSize: 14 }}>به‌زودی اینجا پر می‌شود.</span>
            </div>
          )}
        </div>

        <div style={{ height: 56 }} />
      </main>
      <SiteFooter />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pillar.name,
          description: pillar.blurb,
          url: `${site.url}/c/${pillar.slug}`,
          inLanguage: "fa-IR",
          isPartOf: { "@type": "WebSite", name: site.title, url: site.url },
        }}
      />
    </>
  );
}
