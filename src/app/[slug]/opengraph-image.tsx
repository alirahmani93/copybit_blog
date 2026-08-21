import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { postBySlug, pageBySlug } from "@/lib/posts";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/dates";
import { visualRtl, wrapVisualRtl } from "@/lib/rtl";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.title;

const fontDir = path.join(process.cwd(), "src", "app", "_fonts");
const bold = fs.readFileSync(path.join(fontDir, "Vazirmatn-Bold.ttf"));
const regular = fs.readFileSync(path.join(fontDir, "Vazirmatn-Regular.ttf"));

/**
 * Social share banner, rendered per post at build time.
 *
 * Dark palette from the canvas: a dark card separates from a feed better than
 * the light page does. Vazirmatn is bundled in the repo because the renderer
 * has neither network access nor system fonts — an unbundled font degrades
 * silently to tofu. Persian lines go through wrapVisualRtl because Satori does
 * no bidi reordering of its own; see src/lib/rtl.ts.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  const page = post ? null : await pageBySlug(params.slug);

  const title = post?.title ?? page?.title ?? site.title;
  const kicker = post?.pillar?.name ?? site.kicker;
  const lang = post?.lang ?? page?.lang ?? "fa";
  const rtl = lang !== "en";
  const dateLabel = post ? formatDate(post.date, post.lang) : "";

  // Satori must never wrap a line itself: it would push the overflow word to
  // the next row, and because each line is pre-reversed that word is the one
  // that should have come first. So the estimate is deliberately conservative —
  // an extra line looks fine, a re-wrapped line reads backwards.
  const len = [...title].length;
  const fontSize = len > 70 ? 46 : len > 48 ? 52 : 60;
  const perLine = Math.floor(980 / (fontSize * 0.72));
  const lines = rtl ? wrapVisualRtl(title, perLine) : [title];
  const badge = rtl ? visualRtl(kicker) : kicker;
  const kickerLabel = rtl ? visualRtl(site.kicker) : site.kickerEn;
  const dateText = rtl ? visualRtl(dateLabel) : dateLabel;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0D0E12",
          padding: "60px 72px",
          fontFamily: "Vazirmatn",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 8, background: "#5B6EF5", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 17, background: "#5B6EF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={4.4}>
                <path d="M17.21 7.63 A 6.8 6.8 0 1 0 17.21 16.37" />
              </svg>
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#F0F2F8" }}>CopyBit</div>
            <div style={{ display: "flex", width: 2, height: 26, background: "#252836" }} />
            <div style={{ display: "flex", fontSize: 25, color: "#8891A8" }}>{kickerLabel}</div>
          </div>
          <div style={{ display: "flex", background: "#1E2347", color: "#7B8EFF", fontSize: 23, fontWeight: 700, padding: "10px 24px", borderRadius: 999 }}>
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: rtl ? "flex-end" : "flex-start", gap: 6 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", fontSize, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.4 }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #252836", paddingTop: 24, fontSize: 23, color: "#8891A8" }}>
          <div style={{ display: "flex", color: "#5B6EF5", fontWeight: 700 }}>blog.copybit.org</div>
          <div style={{ display: "flex" }}>{dateText}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Vazirmatn", data: bold, weight: 700, style: "normal" },
        { name: "Vazirmatn", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
