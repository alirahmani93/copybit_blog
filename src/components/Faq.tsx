"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./Icons";
import type { Faq as FaqItem } from "@/lib/posts";
import { track } from "@/lib/analytics";

/**
 * The FAQ accordion. The first entry starts open — it is the one AI search and
 * featured snippets are most likely to lift. FAQPage JSON-LD is emitted by the
 * post page itself, not here, so the markup and the schema cannot drift apart.
 */
export default function Faq({
  items,
  heading,
  slug,
}: {
  items: FaqItem[];
  heading: string;
  slug?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  if (items.length === 0) return null;

  return (
    <>
      <h2 id="faq">{heading}</h2>
      <div className="faq">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div className="faq__item" key={item.q} data-open={isOpen}>
              <h3 style={{ margin: 0 }}>
                <button
                  type="button"
                  className="faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => {
                    setOpen(isOpen ? null : i);
                    if (!isOpen) track("faq-open", { question: item.q, slug, position: i + 1 });
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDownIcon />
                </button>
              </h3>
              {isOpen && (
                <p className="faq__a" id={`faq-a-${i}`}>
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
