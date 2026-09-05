"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

const MILESTONES = [25, 50, 75, 100] as const;

/**
 * The 3px rail above the header on post pages, and the source of the
 * scroll-depth events — it already owns the only scroll listener on the page,
 * so the milestones ride along instead of adding a second one.
 */
export default function ReadingProgress({ slug }: { slug?: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const sent = useRef<Set<number>>(new Set());

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.width = `${(pct * 100).toFixed(2)}%`;

      if (!slug) return;
      for (const m of MILESTONES) {
        if (pct * 100 >= m && !sent.current.has(m)) {
          sent.current.add(m);
          track(m === 100 ? "post-finished" : "scroll-depth", { slug, depth: m });
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [slug]);

  return (
    <div className="progress" aria-hidden>
      <div className="progress__bar" ref={bar} />
    </div>
  );
}
