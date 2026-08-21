import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ReadingProgress from "@/components/ReadingProgress";
import Breadcrumbs from "@/components/Breadcrumbs";
import Byline from "@/components/Byline";
import CoverArt from "@/components/CoverArt";
import Toc from "@/components/Toc";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import JsonLd from "@/components/JsonLd";
import PostCard from "@/components/PostCard";
import { LinkIcon, ShareIcon } from "@/components/Icons";

import { site } from "@/lib/site";
import { isoDate } from "@/lib/dates";
import {
  adjacentPosts,
  allPosts,
  pageBySlug,
  pageSlugs,
  postBySlug,
  relatedPosts,
  renderPost,
} from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...allPosts().map((p) => ({ slug: p.slug })),
    ...pageSlugs().map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);

  if (post) {
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/${post.slug}` },
      robots: post.unlisted
        ? { index: false, follow: false, nocache: true }
        : { index: true, follow: true },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url: `${site.url}/${post.slug}`,
        publishedTime: isoDate(post.date),
        modifiedTime: post.updated ? isoDate(post.updated) : undefined,
        authors: [post.author],
        tags: post.labels,
        images: post.cover ? [post.cover] : undefined,
        locale: post.lang === "en" ? "en_US" : site.locale,
      },
    };
  }

  const page = await pageBySlug(slug);
  if (page) {
    return {
      title: page.title,
      description: page.description,
      alternates: { canonical: `/${page.slug}` },
    };
  }
  return {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const raw = postBySlug(slug);

  if (!raw) {
    const page = await pageBySlug(slug);
    if (!page) notFound();
    return (
      <>
        <SiteHeader lang={page.lang} />
        <main>
          <div className="article-head">
            <Breadcrumbs
              crumbs={[{ name: site.kicker, href: "/" }, { name: page.title }]}
              currentPath={`/${page.slug}`}
            />
            <h1 className="article-title">{page.title}</h1>
          </div>
          <div className="article-body" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
            <div className="article-body__main" style={{ margin: "0 auto" }}>
              <div
                className="prose"
                dir={page.lang === "en" ? "ltr" : undefined}
                data-lang={page.lang}
                dangerouslySetInnerHTML={{ __html: page.html }}
              />
            </div>
          </div>
          <div style={{ height: 56 }} />
        </main>
        <SiteFooter lang={page.lang} />
      </>
    );
  }

  const post = await renderPost(raw);
  const { next } = adjacentPosts(slug);
  const related = relatedPosts(slug, 3);
  const en = post.lang === "en";
  const url = `${site.url}/${post.slug}`;
  const hasOwnDisclaimer = post.html.includes('class="disclaimer"');

  const crumbs = [
    { name: en ? site.kickerEn : site.kicker, href: en ? "/en" : "/" },
    ...(post.pillar ? [{ name: post.pillar.name, href: post.pillar.href }] : []),
    { name: post.title },
  ];

  return (
    <>
      <ReadingProgress />
      <SiteHeader lang={post.lang} />

      <main>
        <article dir={en ? "ltr" : undefined}>
          <div className="article-head">
            <Breadcrumbs crumbs={crumbs} jsonLd={!post.unlisted} currentPath={`/${post.slug}`} />

            {post.pillar && (
              <Link href={post.pillar.href} className="badge">
                {post.pillar.name}
              </Link>
            )}

            <h1 className="article-title" style={en ? { lineHeight: 1.2, letterSpacing: "-0.02em" } : undefined}>
              {post.title}
            </h1>
            <p className="article-dek" style={en ? { lineHeight: 1.6 } : undefined}>
              {post.description}
            </p>

            <div className="article-byline">
              <Byline
                author={post.author}
                date={post.updated ?? post.date}
                minutes={post.readingMinutes}
                words={post.words}
                lang={post.lang}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a
                  className="icon-btn"
                  href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={en ? "Share" : "هم‌رسانی"}
                >
                  <ShareIcon />
                </a>
                <a className="icon-btn" href={`#${post.toc[0]?.id ?? ""}`} aria-label={en ? "Permalink" : "پیوند"}>
                  <LinkIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="article-cover">
            <div className="article-cover__inner">
              {post.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover}
                  alt={post.coverAlt ?? ""}
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              ) : (
                <CoverArt kind={post.art} height={300} />
              )}
            </div>
          </div>

          <div className="article-body">
            <aside>
              <Toc items={post.toc} lang={post.lang} />
            </aside>

            <div className="article-body__main">
              <div
                className="prose"
                data-lang={post.lang}
                dangerouslySetInnerHTML={{ __html: post.html }}
              />

              {post.cta && (
                <Cta
                  title={post.cta.title}
                  dek={post.cta.dek}
                  label={post.cta.label ?? (en ? "Get started" : "شروع کنید")}
                  href={post.cta.href}
                />
              )}

              {post.faq.length > 0 && (
                <div className="prose" data-lang={post.lang}>
                  <Faq items={post.faq} heading={en ? "FAQ" : "پرسش‌های متداول"} />
                </div>
              )}

              {!hasOwnDisclaimer && (
                <div className="prose" data-lang={post.lang}>
                  <p className="disclaimer">
                    <em>
                      {en
                        ? "Leveraged trading carries the risk of losing your entire capital. Nothing in this article is investment advice."
                        : site.disclaimer}
                    </em>
                  </p>
                </div>
              )}

              {post.labels.length > 0 && (
                <div className="tag-list">
                  {post.labels.map((label) => (
                    <Link key={label} href={`/search?q=${encodeURIComponent(label)}`} className="tag">
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>

        {next && (
          <div className="wrap" style={{ paddingTop: 32 }}>
            <Link href={`/${next.slug}`} className="card next-post" style={{ color: "inherit" }}>
              <span className="next-post__art">
                <CoverArt kind={next.art} height={56} />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tertiary)" }}>
                  {en ? "Next article" : "مطلب بعدی"}
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.75 }}>{next.title}</span>
              </span>
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <section className="wrap" style={{ paddingTop: 44 }} aria-label={en ? "Related" : "مطالب مرتبط"}>
            <div className="section-head">
              <span className="eyebrow">{en ? "Related" : "مطالب مرتبط"}</span>
              <span className="section-head__rule" />
            </div>
            <div className="grid-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        <div style={{ height: 56 }} />
      </main>

      <SiteFooter lang={post.lang} />

      {!post.unlisted && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            inLanguage: en ? "en" : "fa-IR",
            datePublished: isoDate(post.date),
            dateModified: isoDate(post.updated ?? post.date),
            wordCount: post.words,
            keywords: post.labels.join(", "),
            articleSection: post.pillar?.name,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: post.author, url: site.url },
            publisher: { "@type": "Organization", name: site.name, url: site.url },
            ...(post.cover ? { image: [new URL(post.cover, site.url).toString()] } : {}),
          }}
        />
      )}

      {post.faq.length > 0 && !post.unlisted && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}
    </>
  );
}
