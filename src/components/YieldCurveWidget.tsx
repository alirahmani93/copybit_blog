"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Live US Treasury yield-curve dashboard.
 *
 * Everything shown comes from the Treasury's own daily par-yield CSV, fetched in
 * the visitor's browser (the endpoint sends `access-control-allow-origin: *`).
 * No yield is hard-coded: if the fetch fails the widget says so rather than
 * showing stale numbers.
 *
 * Charts are drawn at the container's measured width, so text keeps its real
 * size on a 390px phone instead of being scaled down with a fixed viewBox.
 * Charts run left to right (short to long maturity, past to present) even on
 * this RTL page; market figures are Latin digits set LTR.
 */

const CSV = (year: number) =>
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;

const MATURITIES: { key: string; label: string; fa: string }[] = [
  { key: "1 Mo", label: "1M", fa: "۱ ماهه" },
  { key: "1.5 Month", label: "1.5M", fa: "۱٫۵ ماهه" },
  { key: "2 Mo", label: "2M", fa: "۲ ماهه" },
  { key: "3 Mo", label: "3M", fa: "۳ ماهه" },
  { key: "4 Mo", label: "4M", fa: "۴ ماهه" },
  { key: "6 Mo", label: "6M", fa: "۶ ماهه" },
  { key: "1 Yr", label: "1Y", fa: "۱ ساله" },
  { key: "2 Yr", label: "2Y", fa: "۲ ساله" },
  { key: "3 Yr", label: "3Y", fa: "۳ ساله" },
  { key: "5 Yr", label: "5Y", fa: "۵ ساله" },
  { key: "7 Yr", label: "7Y", fa: "۷ ساله" },
  { key: "10 Yr", label: "10Y", fa: "۱۰ ساله" },
  { key: "20 Yr", label: "20Y", fa: "۲۰ ساله" },
  { key: "30 Yr", label: "30Y", fa: "۳۰ ساله" },
];
const AXIS_LABELS_NARROW = new Set(["1M", "6M", "2Y", "5Y", "10Y", "30Y"]);

const FA_MONTHS = ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"];
const faDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
const faDate = (d: Date) => `${faDigits(d.getUTCDate())} ${FA_MONTHS[d.getUTCMonth()]} ${faDigits(d.getUTCFullYear())}`;
const faDateShort = (d: Date) => `${faDigits(d.getUTCDate())} ${FA_MONTHS[d.getUTCMonth()]}`;

type Row = { t: number; date: Date; v: Record<string, number | null> };

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const head = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const rows: Row[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.replace(/"/g, "").trim());
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(cells[0] ?? "");
    if (!m) continue;
    const date = new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2])));
    const v: Record<string, number | null> = {};
    head.forEach((h, i) => {
      if (i === 0) return;
      const n = Number.parseFloat(cells[i] ?? "");
      v[h] = Number.isFinite(n) ? n : null;
    });
    rows.push({ t: date.getTime(), date, v });
  }
  return rows.sort((a, b) => b.t - a.t);
}

const DAY = 86_400_000;
/** Newest row dated at or before `t`. Rows are newest-first. */
const rowAtOrBefore = (rows: Row[], t: number) => rows.find((r) => r.t <= t);

const fmt = (n: number | null | undefined, digits = 2) => (n == null ? "" : n.toFixed(digits));
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}`;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(min: number, max: number, count: number) {
  const span = Math.max(max - min, 0.1);
  const raw = span / count;
  const step = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2].find((s) => s >= raw) ?? 2;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(Number(v.toFixed(2)));
  return { lo, hi, ticks };
}

const Arrow = ({ dir }: { dir: "up" | "down" | "flat" }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ flex: "none" }}>
    {dir === "flat" ? (
      <path d="M2 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d={dir === "up" ? "M6 2l4 6H2z" : "M6 10l4-6H2z"} fill="currentColor" />
    )}
  </svg>
);

function Change({ now, then }: { now: number | null; then: number | null }) {
  if (now == null || then == null) return null;
  const d = Number((now - then).toFixed(2));
  return (
    <span className="yc-change">
      <Arrow dir={d > 0 ? "up" : d < 0 ? "down" : "flat"} />
      <span className="yc-num" dir="ltr">{signed(d)}</span>
      <span>نسبت به هفتهٔ پیش</span>
    </span>
  );
}

/* ── curve chart ─────────────────────────────────────────────────────────── */

type Series = { id: string; name: string; color: string; row: Row };

function CurveChart({ series }: { series: Series[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const narrow = width < 520;
  const H = narrow ? 260 : 320;
  const m = { l: 38, r: narrow ? 74 : 92, t: 14, b: 30 };
  const iw = Math.max(width - m.l - m.r, 10);
  const ih = H - m.t - m.b;

  const all = series.flatMap((s) => MATURITIES.map((k) => s.row.v[k.key])).filter((x): x is number => x != null);
  const { lo, hi, ticks } = niceTicks(Math.min(...all), Math.max(...all), 4);
  const X = (i: number) => m.l + (i / (MATURITIES.length - 1)) * iw;
  const Y = (v: number) => m.t + (1 - (v - lo) / (hi - lo || 1)) * ih;

  // direct end-labels, nudged apart so close curves don't stack their labels
  const ends = series
    .map((s) => {
      let i = MATURITIES.length - 1;
      while (i > 0 && s.row.v[MATURITIES[i].key] == null) i--;
      return { s, y: Y(s.row.v[MATURITIES[i].key] ?? lo) };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const i = Math.round(((x - m.l) / iw) * (MATURITIES.length - 1));
    setHover(Math.max(0, Math.min(MATURITIES.length - 1, i)));
  };

  const tipLeft = hover == null ? 0 : Math.max(4, Math.min(width - 168, X(hover) - 80));

  return (
    <div ref={ref} className="yc-chart" dir="ltr">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label="منحنی بازده اوراق خزانهٔ آمریکا: امروز، یک ماه پیش و یک سال پیش"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ touchAction: "pan-y", display: "block" }}
        >
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={m.l} x2={m.l + iw} y1={Y(tk)} y2={Y(tk)} className="yc-grid" />
              <text x={m.l - 8} y={Y(tk) + 4} textAnchor="end" className="yc-axis">{tk.toFixed(2)}</text>
            </g>
          ))}
          {MATURITIES.map((k, i) =>
            !narrow || AXIS_LABELS_NARROW.has(k.label) ? (
              <text key={k.key} x={X(i)} y={H - 8} textAnchor="middle" className="yc-axis">{k.label}</text>
            ) : null,
          )}
          {hover != null && <line x1={X(hover)} x2={X(hover)} y1={m.t} y2={m.t + ih} className="yc-cross" />}
          {[...series].reverse().map((s) => {
            const pts = MATURITIES.map((k, i) => ({ i, v: s.row.v[k.key] })).filter((p) => p.v != null);
            return (
              <g key={s.id}>
                <polyline
                  points={pts.map((p) => `${X(p.i)},${Y(p.v as number)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.id === "now" ? 2.5 : 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {hover != null && s.row.v[MATURITIES[hover].key] != null && (
                  <circle cx={X(hover)} cy={Y(s.row.v[MATURITIES[hover].key] as number)} r="5" fill={s.color} className="yc-dot" />
                )}
              </g>
            );
          })}
          {ends.map(({ s, y }) => (
            <g key={s.id}>
              <circle cx={m.l + iw + 10} cy={y} r="4" fill={s.color} />
              <text x={m.l + iw + 18} y={y + 4} className="yc-endlabel" direction="rtl" textAnchor="end">{s.name}</text>
            </g>
          ))}
        </svg>
      )}
      {hover != null && width > 0 && (
        <div className="yc-tip" style={{ left: tipLeft, top: 6 }} dir="rtl">
          <div className="yc-tip__head">سررسید {MATURITIES[hover].fa}</div>
          {series.map((s) => (
            <div className="yc-tip__row" key={s.id}>
              <span className="yc-key" style={{ background: s.color }} />
              <span>{s.name}</span>
              <span className="yc-num" dir="ltr">
                {s.row.v[MATURITIES[hover].key] == null ? "ندارد" : `${fmt(s.row.v[MATURITIES[hover].key])}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 10-year history ─────────────────────────────────────────────────────── */

function HistoryChart({ rows, color }: { rows: Row[]; color: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const narrow = width < 520;
  const H = narrow ? 220 : 260;
  const m = { l: 38, r: 14, t: 14, b: 28 };
  const iw = Math.max(width - m.l - m.r, 10);
  const ih = H - m.t - m.b;
  const pts = useMemo(() => [...rows].reverse().filter((r) => r.v["10 Yr"] != null), [rows]);
  if (pts.length < 2) return <div ref={ref} className="yc-chart" />;

  const vals = pts.map((p) => p.v["10 Yr"] as number);
  const { lo, hi, ticks } = niceTicks(Math.min(...vals), Math.max(...vals), 4);
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = (t: number) => m.l + ((t - t0) / (t1 - t0 || 1)) * iw;
  const Y = (v: number) => m.t + (1 - (v - lo) / (hi - lo || 1)) * ih;

  const months: Row[] = [];
  pts.forEach((p, i) => { if (i > 0 && p.date.getUTCMonth() !== pts[i - 1].date.getUTCMonth()) months.push(p); });
  const every = Math.max(1, Math.ceil(months.length / (narrow ? 4 : 7)));

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const t = t0 + ((e.clientX - box.left - m.l) / iw) * (t1 - t0);
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(p.t - t) < Math.abs(pts[best].t - t)) best = i; });
    setHover(best);
  };
  const h = hover != null ? pts[Math.min(hover, pts.length - 1)] : null;
  const tipLeft = h ? Math.max(4, Math.min(width - 150, X(h.t) - 70)) : 0;

  return (
    <div ref={ref} className="yc-chart" dir="ltr">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label="روند بازده اوراق ده‌سالهٔ آمریکا"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ touchAction: "pan-y", display: "block" }}
        >
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={m.l} x2={m.l + iw} y1={Y(tk)} y2={Y(tk)} className="yc-grid" />
              <text x={m.l - 8} y={Y(tk) + 4} textAnchor="end" className="yc-axis">{tk.toFixed(2)}</text>
            </g>
          ))}
          {months.filter((_, i) => i % every === 0).map((p) => (
            <text key={p.t} x={X(p.t)} y={H - 8} textAnchor="middle" className="yc-axis" direction="rtl">
              {FA_MONTHS[p.date.getUTCMonth()]}
            </text>
          ))}
          <polyline
            points={pts.map((p) => `${X(p.t)},${Y(p.v["10 Yr"] as number)}`).join(" ")}
            fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          />
          {h && (
            <>
              <line x1={X(h.t)} x2={X(h.t)} y1={m.t} y2={m.t + ih} className="yc-cross" />
              <circle cx={X(h.t)} cy={Y(h.v["10 Yr"] as number)} r="5" fill={color} className="yc-dot" />
            </>
          )}
        </svg>
      )}
      {h && width > 0 && (
        <div className="yc-tip" style={{ left: tipLeft, top: 6 }} dir="rtl">
          <div className="yc-tip__head">{faDate(h.date)}</div>
          <div className="yc-tip__row">
            <span className="yc-key" style={{ background: color }} />
            <span>ده‌ساله</span>
            <span className="yc-num" dir="ltr">{fmt(h.v["10 Yr"])}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── widget ──────────────────────────────────────────────────────────────── */

const RANGES = [
  { id: "3m", days: 92, label: "۳ ماه" },
  { id: "6m", days: 183, label: "۶ ماه" },
  { id: "1y", days: 366, label: "۱ سال" },
] as const;

export default function YieldCurveWidget() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("6m");

  const load = useCallback(async () => {
    setFailed(false);
    setRows(null);
    try {
      const y = new Date().getUTCFullYear();
      const texts = await Promise.all(
        [y, y - 1].map(async (year) => {
          const res = await fetch(CSV(year), { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          return res.text();
        }),
      );
      const parsed = texts.flatMap(parseCsv).sort((a, b) => b.t - a.t);
      if (parsed.length < 30 || parsed[0].v["10 Yr"] == null) throw new Error("empty");
      setRows(parsed);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (failed) {
    return (
      <section className="yc" aria-live="polite">
        <div className="yc-msg">
          <p>دریافت داده از خزانه‌داری آمریکا ممکن نشد. برای اینکه عدد قدیمی نشان ندهیم، داشبورد خالی می‌ماند.</p>
          <button type="button" className="yc-btn" onClick={() => void load()}>تلاش دوباره</button>
        </div>
      </section>
    );
  }
  if (!rows) {
    return (
      <section className="yc" aria-busy="true">
        <div className="yc-msg"><p>در حال دریافت آخرین داده‌های خزانه‌داری آمریکا</p></div>
      </section>
    );
  }

  const now = rows[0];
  const week = rowAtOrBefore(rows, now.t - 7 * DAY);
  const month = rowAtOrBefore(rows, now.t - 30 * DAY);
  const year = rowAtOrBefore(rows, now.t - 365 * DAY);

  const spreadOf = (r?: Row) => (r && r.v["10 Yr"] != null && r.v["2 Yr"] != null ? Number((r.v["10 Yr"]! - r.v["2 Yr"]!).toFixed(2)) : null);
  const spread = spreadOf(now);
  const inverted = spread != null && spread < 0;

  const series: Series[] = [
    { id: "now", name: "امروز", color: "var(--yc-a)", row: now },
    ...(month ? [{ id: "month", name: "۱ ماه پیش", color: "var(--yc-b)", row: month }] : []),
    ...(year ? [{ id: "year", name: "۱ سال پیش", color: "var(--yc-c)", row: year }] : []),
  ];
  const days = RANGES.find((r) => r.id === range)!.days;
  const history = rows.filter((r) => r.t >= now.t - days * DAY);

  return (
    <section className="yc" aria-label="داشبورد زندهٔ منحنی بازده اوراق خزانهٔ آمریکا">
      <div className="yc-tiles">
        <div className="yc-tile yc-tile--lead">
          <span className="yc-tile__label">بازده ده‌ساله</span>
          <span className="yc-tile__value yc-num" dir="ltr">{fmt(now.v["10 Yr"])}%</span>
          <Change now={now.v["10 Yr"]} then={week?.v["10 Yr"] ?? null} />
        </div>
        <div className="yc-tile">
          <span className="yc-tile__label">بازده دوساله</span>
          <span className="yc-tile__value yc-num" dir="ltr">{fmt(now.v["2 Yr"])}%</span>
          <Change now={now.v["2 Yr"]} then={week?.v["2 Yr"] ?? null} />
        </div>
        <div className="yc-tile">
          <span className="yc-tile__label">فاصلهٔ ده‌ساله و دوساله</span>
          <span className="yc-tile__value yc-num" dir="ltr">{spread == null ? "" : signed(spread)}</span>
          <span className="yc-status">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: "none" }}>
              {inverted ? (
                <path d="M7 1.5l6 10.5H1z M7 5.5v3 M7 10.4v.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              ) : (
                <path d="M2 9.5l3-3 2.5 2L12 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
              )}
            </svg>
            <span>{inverted ? "منحنی معکوس" : "منحنی عادی"}</span>
          </span>
          <Change now={spread} then={spreadOf(week)} />
        </div>
      </div>

      <div className="yc-card">
        <div className="yc-card__head">
          <h3 className="yc-h">منحنی بازده در همهٔ سررسیدها</h3>
          <ul className="yc-legend">
            {series.map((s) => (
              <li key={s.id}>
                <span className="yc-key" style={{ background: s.color }} />
                <span>{s.name} ({faDate(s.row.date)})</span>
              </li>
            ))}
          </ul>
        </div>
        <CurveChart series={series} />
        <details className="yc-details" onToggle={(e) => (e.currentTarget.open ? track("yield-table-open", {}) : undefined)}>
          <summary>جدول اعداد</summary>
          <div className="yc-tablewrap">
            <table className="yc-table">
              <thead>
                <tr>
                  <th>سررسید</th>
                  {series.map((s) => <th key={s.id}>{s.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {MATURITIES.map((k) => (
                  <tr key={k.key}>
                    <td>{k.fa}</td>
                    {series.map((s) => (
                      <td key={s.id} className="yc-num" dir="ltr">{s.row.v[k.key] == null ? "" : `${fmt(s.row.v[k.key])}%`}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="yc-card">
        <div className="yc-card__head">
          <h3 className="yc-h">بازده ده‌ساله در طول زمان</h3>
          <div className="yc-ranges" role="group" aria-label="بازهٔ زمانی">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                className="yc-range"
                aria-pressed={range === r.id}
                onClick={() => { setRange(r.id); track("yield-range", { range: r.id }); }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <HistoryChart rows={history} color="var(--yc-a)" />
      </div>

      <p className="yc-source">
        آخرین دادهٔ منتشرشده: {faDate(now.date)}. مقایسهٔ هفتگی با {week ? faDateShort(week.date) : "هفتهٔ پیش"}. منبع: خزانه‌داری آمریکا، نرخ‌های روزانهٔ منحنی بازده؛ پس از پایان هر روز معاملاتی آمریکا به‌روز می‌شود.
      </p>
    </section>
  );
}
