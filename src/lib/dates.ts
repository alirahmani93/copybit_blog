/**
 * Date and number formatting.
 *
 * Persian dates come from the Gregorian timestamp in frontmatter and are
 * converted to Jalali at render time with the platform's own Persian calendar —
 * no dependency, and it stays correct across leap years.
 */

const faDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const faMonth = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const enDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string, lang: "fa" | "en" = "fa"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return lang === "en" ? enDate.format(d) : faDate.format(d);
}

export function formatMonth(iso: string, lang: "fa" | "en" = "fa"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return lang === "en"
    ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(d)
    : faMonth.format(d);
}

/** Machine-readable date for <time datetime> and JSON-LD. */
export function isoDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

const faNum = new Intl.NumberFormat("fa-IR");
const enNum = new Intl.NumberFormat("en-US");

export function formatNumber(n: number, lang: "fa" | "en" = "fa"): string {
  return lang === "en" ? enNum.format(n) : faNum.format(n);
}

export function readingTimeLabel(minutes: number, lang: "fa" | "en" = "fa"): string {
  return lang === "en"
    ? `${minutes} min read`
    : `${formatNumber(minutes)} دقیقه مطالعه`;
}

export function readingTimeShort(minutes: number, lang: "fa" | "en" = "fa"): string {
  return lang === "en" ? `${minutes} min` : `${formatNumber(minutes)} دقیقه`;
}

export function wordCountLabel(words: number, lang: "fa" | "en" = "fa"): string {
  return lang === "en" ? `${enNum.format(words)} words` : `${formatNumber(words)} کلمه`;
}

export function postCountLabel(n: number, lang: "fa" | "en" = "fa"): string {
  return lang === "en" ? `${n} post${n === 1 ? "" : "s"}` : `${formatNumber(n)} مطلب`;
}
