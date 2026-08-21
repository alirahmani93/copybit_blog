/**
 * Visual RTL reordering for the OG image renderer.
 *
 * Satori shapes Arabic-script glyphs correctly — letters join — but performs no
 * bidi reordering: it lays tokens out left-to-right in source order, so a
 * Persian sentence renders backwards. It also treats ZWNJ as a token boundary,
 * which splits compounds like «کپی‌تریدینگ» and swaps the halves.
 *
 * Determined empirically by rendering four candidate transforms and reading the
 * output: reversing tokens split on BOTH spaces and ZWNJ, then rejoining with
 * the separators in place, is the transform that comes out correct.
 *
 * This is only for images. Never use it on HTML — browsers do real bidi, and
 * pre-reversed text would come out backwards there.
 */

const SEPARATORS = /([ ‌])/;

/** Reorder one line so Satori's left-to-right layout reads correctly in RTL. */
export function visualRtl(text: string): string {
  return text.split(SEPARATORS).filter(Boolean).reverse().join("");
}

/**
 * Greedy wrap, then reorder each line independently.
 *
 * Wrapping has to happen before reordering: if the whole string were reversed
 * first, Satori's own wrap would put the end of the sentence on the first line.
 * `maxChars` is a width estimate — Persian glyphs in Vazirmatn average roughly
 * half the font size in advance width.
 */
export function wrapVisualRtl(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if ([...candidate].length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  return lines.map(visualRtl);
}
