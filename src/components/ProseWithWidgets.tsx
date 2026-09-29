import YieldCurveWidget from "./YieldCurveWidget";

/**
 * Renders a post's HTML, mounting a live widget wherever the markdown carries a
 * `<div data-widget="name"></div>` marker. Markdown passes raw HTML through but
 * never executes scripts, so interactive pieces are real components placed at
 * the marker rather than script tags or iframes.
 */
const WIDGETS: Record<string, () => React.ReactNode> = {
  "yield-curve": () => <YieldCurveWidget />,
};

const MARKER = /<div data-widget="([a-z0-9-]+)"><\/div>/g;

export default function ProseWithWidgets({ html, lang }: { html: string; lang: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of html.matchAll(MARKER)) {
    const before = html.slice(last, m.index);
    if (before.trim()) {
      parts.push(<div key={i++} className="prose" data-lang={lang} dangerouslySetInnerHTML={{ __html: before }} />);
    }
    const render = WIDGETS[m[1]];
    if (render) parts.push(<div key={i++}>{render()}</div>);
    last = (m.index ?? 0) + m[0].length;
  }
  const rest = html.slice(last);
  if (rest.trim() || parts.length === 0) {
    parts.push(<div key={i++} className="prose" data-lang={lang} dangerouslySetInnerHTML={{ __html: rest }} />);
  }
  return <>{parts}</>;
}
