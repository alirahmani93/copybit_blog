import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import Chips from "@/components/Chips";
import { featuredPost, listedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} Blog` },
  description: site.descriptionEn,
  alternates: { canonical: "/en", languages: { fa: "/", en: "/en" } },
  openGraph: { type: "website", title: `${site.name} Blog`, description: site.descriptionEn, url: `${site.url}/en`, locale: "en_US" },
};

export default function EnglishHome() {
  const posts = listedPosts("en");
  const featured = featuredPost("en");
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <SiteHeader lang="en" />
      <main dir="ltr" style={{ fontFamily: "var(--lat)" }}>
        {featured && (
          <div className="wrap" style={{ paddingTop: 40 }}>
            <FeaturedPost post={featured} label="Featured" />
          </div>
        )}

        <div className="wrap" style={{ paddingTop: featured ? 32 : 40 }}>
          <Chips lang="en" />
        </div>

        <div className="wrap" style={{ paddingTop: 20 }}>
          {rest.length > 0 ? (
            <div className="grid-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            !featured && (
              <div className="empty card">
                <strong style={{ color: "var(--text)", fontSize: 16 }}>No English posts yet</strong>
                <span style={{ fontSize: 14 }}>
                  Add a post with <code>lang: en</code> in its frontmatter, or read the{" "}
                  <Link href="/">Persian blog</Link>.
                </span>
              </div>
            )
          )}
        </div>

        <div style={{ height: 56 }} />
      </main>
      <SiteFooter lang="en" />
    </>
  );
}
