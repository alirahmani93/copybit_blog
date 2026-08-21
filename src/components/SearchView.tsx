"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CoverArt from "./CoverArt";
import { CloseIcon, SearchIcon } from "./Icons";
import { formatDate, postCountLabel, readingTimeShort } from "@/lib/dates";
import type { SearchDoc } from "@/lib/posts";

/**
 * Client-side search over a prebuilt index. The corpus is small enough that a
 * substring match on title + description + labels beats shipping a search
 * library, and it works with no network round-trip.
 */
export default function SearchView({ docs, initialQuery = "" }: { docs: SearchDoc[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    const terms = q.split(/\s+/).filter(Boolean);
    return docs
      .map((doc) => {
        let score = 0;
        for (const term of terms) {
          if (!doc.haystack.includes(term)) return null;
          if (doc.title.toLowerCase().includes(term)) score += 3;
          if (doc.labels.some((l) => l.toLowerCase().includes(term))) score += 2;
          score += 1;
        }
        return { doc, score };
      })
      .filter((r): r is { doc: SearchDoc; score: number } => r !== null)
      .sort((a, b) => b.score - a.score || (a.doc.date < b.doc.date ? 1 : -1))
      .map((r) => r.doc);
  }, [docs, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="search-field">
        <span style={{ color: "var(--brand)", display: "flex" }}>
          <SearchIcon size={18} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در مطالب…"
          aria-label="جستجو در مطالب"
          autoFocus
        />
        {query && (
          <button type="button" className="search-field__clear" onClick={() => setQuery("")}>
            پاک کردن
            <CloseIcon />
          </button>
        )}
      </div>

      <p className="tnum" style={{ margin: 0, fontSize: 13, color: "var(--tertiary)" }}>
        {query.trim()
          ? `${postCountLabel(results.length)} برای «${query.trim()}»`
          : postCountLabel(results.length)}
      </p>

      {results.length === 0 ? (
        <div className="empty card">
          <strong style={{ color: "var(--text)", fontSize: 16 }}>چیزی پیدا نشد</strong>
          <span style={{ fontSize: 14 }}>
            یک کلمه کوتاه‌تر امتحان کنید، یا از <Link href="/">صفحه اصلی</Link> شروع کنید.
          </span>
        </div>
      ) : (
        <div className="rows">
          {results.map((doc) => (
            <article className="post-row" key={doc.slug} dir={doc.lang === "en" ? "ltr" : undefined}>
              <Link href={`/${doc.slug}`} className="post-row__art" tabIndex={-1} aria-hidden>
                <CoverArt kind={doc.art} height={120} />
              </Link>
              <div className="post-row__body">
                <div className="meta-row">
                  {doc.labels[0] && <span className="badge badge--sm">{doc.labels[0]}</span>}
                  <span className="tnum">
                    {formatDate(doc.date, doc.lang)} · {readingTimeShort(doc.minutes, doc.lang)}
                  </span>
                </div>
                <h2 className="post-row__title">
                  <Link href={`/${doc.slug}`}>{doc.title}</Link>
                </h2>
                <p className="post-row__dek">{doc.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
