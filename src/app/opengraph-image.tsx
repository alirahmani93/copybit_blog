import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { site, pillars } from "@/lib/site";
import { visualRtl } from "@/lib/rtl";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.title;

const fontDir = path.join(process.cwd(), "src", "app", "_fonts");
const bold = fs.readFileSync(path.join(fontDir, "Vazirmatn-Bold.ttf"));

/** Share banner for the blog itself. Same treatment as the per-post banners. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 34,
          background: "#0D0E12",
          fontFamily: "Vazirmatn",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 8, background: "#5B6EF5", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 82, height: 82, borderRadius: 26, background: "#5B6EF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={4.4}>
              <path d="M17.21 7.63 A 6.8 6.8 0 1 0 17.21 16.37" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: "#FFFFFF" }}>CopyBit</div>
          <div style={{ display: "flex", width: 2, height: 52, background: "#252836" }} />
          <div style={{ display: "flex", fontSize: 52, color: "#8891A8" }}>{visualRtl(site.kicker)}</div>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#8891A8" }}>
          {visualRtl("معاملات فیوچرز و اسپات روی هایپرلیکوئید، به زبان خودتان")}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[...pillars].reverse().map((p) => (
            <div
              key={p.slug}
              style={{
                display: "flex",
                background: "#13151C",
                border: "2px solid #252836",
                color: "#8891A8",
                fontSize: 22,
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              {visualRtl(p.name)}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#5B6EF5", fontWeight: 700, marginTop: 10 }}>blog.copybit.org</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Vazirmatn", data: bold, weight: 700, style: "normal" }] }
  );
}
