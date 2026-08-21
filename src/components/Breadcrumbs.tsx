import Link from "next/link";
import { ChevronIcon } from "./Icons";
import { site } from "@/lib/site";

export type Crumb = { name: string; href?: string };

/**
 * Visible trail plus BreadcrumbList JSON-LD.
 *
 * Per the canvas spec: the homepage gets no trail at all, the last level is not
 * a link but still carries an `item` in the structured data, and search pages
 * get the visible trail with no JSON-LD (they are noindex).
 */
export default function Breadcrumbs({
  crumbs,
  jsonLd = true,
  currentPath,
}: {
  crumbs: Crumb[];
  jsonLd?: boolean;
  currentPath?: string;
}) {
  if (crumbs.length === 0) return null;

  const ld = jsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${site.url}${c.href ?? currentPath ?? "/"}`,
        })),
      }
    : null;

  return (
    <>
      <nav className="crumbs" aria-label="مسیر راهنما">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={`${c.name}-${i}`} style={{ display: "contents" }}>
              {i > 0 && <ChevronIcon className="crumbs__sep" />}
              {c.href && !last ? (
                <Link href={c.href}>{c.name}</Link>
              ) : (
                <span className={last ? "crumbs__leaf" : undefined} aria-current={last ? "page" : undefined}>
                  {c.name}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}
    </>
  );
}
