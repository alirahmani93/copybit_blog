import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root, Element, ElementContent } from "hast";

export type TocEntry = { id: string; text: string; depth: 2 | 3 };

/** The h2 whose following list gets the card treatment (Elements artboard). */
const KEYPOINTS_HEADINGS = ["نکات کلیدی", "key points", "خلاصه", "کلیدی‌ترین نکات"];

function textOf(node: ElementContent | Element): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((c) => textOf(c as ElementContent)).join("");
  }
  return "";
}

function hasClass(node: Element, name: string): boolean {
  const cls = node.properties?.className;
  return Array.isArray(cls) && cls.includes(name);
}

function addClass(node: Element, name: string): void {
  const cls = node.properties?.className;
  node.properties = node.properties ?? {};
  node.properties.className = Array.isArray(cls) ? [...cls, name] : [name];
}

/** Collect h2/h3 into a table of contents. */
function rehypeCollectToc(toc: TocEntry[]) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = typeof node.properties?.id === "string" ? node.properties.id : "";
      const text = textOf(node).trim();
      if (!id || !text) return;
      toc.push({ id, text, depth: node.tagName === "h2" ? 2 : 3 });
    });
  };
}

/**
 * Structural passes the template owns rather than the author:
 *  · tables get a scroll container so 4-column tables survive 390px
 *  · a <ul> right after a «نکات کلیدی» heading is wrapped in a card
 *  · the trailing all-italic paragraph becomes the disclaimer
 *  · outbound links open in a new tab
 */
function rehypeTemplateContract() {
  return (tree: Root) => {
    // Wrap tables.
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || typeof index !== "number") return;
      if ((parent as Element).tagName === "div" && hasClass(parent as Element, "table-wrap")) return;
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrap"] },
        children: [node],
      };
      (parent as Element).children[index] = wrapper;
    });

    // Key-points card + disclaimer, both top-level only.
    const top = tree.children.filter((c): c is Element => c.type === "element");
    top.forEach((node, i) => {
      if (node.tagName === "h2") {
        const label = textOf(node).trim().toLowerCase();
        if (!KEYPOINTS_HEADINGS.some((h) => label === h.toLowerCase())) return;
        const next = top[i + 1];
        if (next?.tagName === "ul") addClass(next, "keypoints");
      }
    });

    const last = top[top.length - 1];
    if (last?.tagName === "p") {
      const kids = last.children.filter(
        (c) => !(c.type === "text" && !c.value.trim())
      );
      if (kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "em") {
        addClass(last, "disclaimer");
      }
    }

    // Outbound links.
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return;
      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer"];
    });
  };
}

export type RenderedMarkdown = { html: string; toc: TocEntry[] };

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const toc: TocEntry[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeCollectToc, toc)
    .use(rehypeTemplateContract)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return { html: String(file), toc };
}

/** Strip markdown syntax down to prose, for word counts and meta descriptions. */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/^\s*\|.*\|\s*$/gm, (row) => row.replace(/\|/g, " "))
    .replace(/^\s*[-:| ]+\s*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(markdown: string): number {
  const text = toPlainText(markdown);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** ~230 wpm, floored at one minute — the same basis the design's byline uses. */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / 230));
}

export function excerpt(markdown: string, max = 180): string {
  const text = toPlainText(markdown);
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max) || max).trimEnd() + "…";
}
