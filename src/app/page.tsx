import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import Chips from "@/components/Chips";
import JsonLd from "@/components/JsonLd";
import { featuredPost, listedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function HomePage() {
  const posts = listedPosts("fa");
  const featured = featuredPost("fa");
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <SiteHeader />
      <main>
        {featured && (
          <div className="wrap" style={{ paddingTop: 40 }}>
            <FeaturedPost post={featured} label="مطلب ویژه" />
          </div>
        )}

        <div className="wrap" style={{ paddingTop: featured ? 32 : 40 }}>
          <Chips />
        </div>

        <div className="wrap" style={{ paddingTop: 20, paddingBottom: 8 }}>
          {rest.length > 0 ? (
            <div className="grid-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            !featured && (
              <div className="empty card">
                <strong style={{ color: "var(--text)", fontSize: 16 }}>هنوز مطلبی منتشر نشده</strong>
                <span style={{ fontSize: 14 }}>
                  اولین پست را در <code>content/posts/</code> بسازید.
                </span>
              </div>
            )
          )}
        </div>

        {rest.length >= 9 && (
          <div className="wrap" style={{ padding: "20px 24px 48px", display: "flex", justifyContent: "center" }}>
            <Link href="/search" className="btn btn--ghost">
              مطالب قدیمی‌تر
            </Link>
          </div>
        )}

        <div style={{ height: 48 }} />
      </main>
      <SiteFooter />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.title,
          url: site.url,
          inLanguage: "fa-IR",
          description: site.description,
          potentialAction: {
            "@type": "SearchAction",
            target: `${site.url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          sameAs: [site.appUrl],
        }}
      />
    </>
  );
}
