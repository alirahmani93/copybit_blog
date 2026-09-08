"use client";

import { useEffect, useState } from "react";

/**
 * Tap-to-zoom for in-article figures. The data-viz SVGs are ~1200px wide and
 * become unreadable when scaled to a ~390px phone — 82% of readers. Rather than
 * regenerate every chart, we let any `.prose` image open full size in a
 * scrollable overlay: on mobile the image renders wider than the viewport so its
 * labels stay legible and the reader pans; on desktop it shows at full detail.
 *
 * Uses event delegation so it also covers images injected via dangerouslySet-
 * InnerHTML. The article cover lives outside `.prose`, so it is left alone.
 */
export default function Lightbox() {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (t instanceof HTMLImageElement && t.closest(".prose")) {
        e.preventDefault();
        setImg({ src: t.currentSrc || t.src, alt: t.alt || "" });
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setImg(null);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = img ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [img]);

  if (!img) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setImg(null)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lightbox__img" src={img.src} alt={img.alt} />
      <button type="button" className="lightbox__close" aria-label="بستن" onClick={() => setImg(null)}>
        ×
      </button>
    </div>
  );
}
