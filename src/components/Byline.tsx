import { formatDate, isoDate, readingTimeLabel, readingTimeShort, wordCountLabel } from "@/lib/dates";
import { LogoMark } from "./Icons";
import type { Lang } from "@/lib/posts";

export default function Byline({
  author,
  date,
  minutes,
  words,
  lang = "fa",
  compact = false,
}: {
  author: string;
  date: string;
  minutes: number;
  words?: number;
  lang?: Lang;
  compact?: boolean;
}) {
  return (
    <div className="byline">
      <span className="byline__avatar" style={{ color: "var(--brand)" }}>
        <LogoMark size={compact ? 17 : 20} />
      </span>
      <span className="byline__name">{author}</span>
      <span className="dot-sep" />
      <time className="tnum" dateTime={isoDate(date)}>
        {formatDate(date, lang)}
      </time>
      <span className="dot-sep" />
      <span className="tnum">
        {compact ? readingTimeShort(minutes, lang) : readingTimeLabel(minutes, lang)}
      </span>
      {typeof words === "number" && words > 0 && !compact && (
        <>
          <span className="dot-sep" />
          <span className="tnum">{wordCountLabel(words, lang)}</span>
        </>
      )}
    </div>
  );
}
