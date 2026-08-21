"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, ListIcon } from "./Icons";
import { formatNumber } from "@/lib/dates";
import type { TocEntry } from "@/lib/markdown";

/**
 * "در این مطلب" — sticky on desktop, a collapsed summary bar under 1024px.
 * The active entry follows the heading nearest the top of the viewport.
 */
export default function Toc({ items, lang = "fa" }: { items: TocEntry[]; lang?: "fa" | "en" }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const en = lang === "en";

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const list = (
    <ol className="toc__list">
      {items.map((item) => (
        <li key={item.id} data-depth={item.depth}>
          <a href={`#${item.id}`} data-active={active === item.id}>
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  const heading = en ? "In this article" : "در این مطلب";

  return (
    <>
      <nav className="toc" aria-label={heading}>
        <span className="toc__label">{heading}</span>
        {list}
      </nav>

      <details className="toc-mobile">
        <summary>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ListIcon className="toc-mobile__icon" />
            <span>{heading}</span>
            <span className="tnum" style={{ fontSize: 12, color: "var(--tertiary)", fontWeight: 400 }}>
              {en ? `${items.length} sections` : `${formatNumber(items.length)} بخش`}
            </span>
          </span>
          <ChevronDownIcon />
        </summary>
        <div className="toc-mobile__inner">{list}</div>
      </details>
    </>
  );
}
