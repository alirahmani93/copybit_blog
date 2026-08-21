import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchView from "@/components/SearchView";
import { searchIndex } from "@/lib/posts";
import { site } from "@/lib/site";

/** Search pages get the visible trail but no JSON-LD — they are noindex. */
export const metadata: Metadata = {
  title: "جستجو",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const docs = searchIndex();

  return (
    <>
      <SiteHeader />
      <main>
        <div className="wrap" style={{ paddingTop: 22 }}>
          <Breadcrumbs
            crumbs={[
              { name: site.kicker, href: "/" },
              { name: q ? `جستجو: «${q}»` : "جستجو" },
            ]}
            jsonLd={false}
          />
        </div>

        <div className="wrap" style={{ paddingTop: 18, display: "flex", flexDirection: "column", gap: 22 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, lineHeight: 1.5 }}>جستجو</h1>
          <SearchView docs={docs} initialQuery={q} />
        </div>

        <div style={{ height: 56 }} />
      </main>
      <SiteFooter />
    </>
  );
}
