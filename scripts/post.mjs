#!/usr/bin/env node
/**
 * Post management CLI.
 *
 *   npm run post:new   -- --title "…" [--slug …] [--category …] [--labels a,b]
 *                         [--description "…"] [--date YYYY-MM-DD] [--lang fa|en]
 *                         [--featured] [--unlisted] [--draft] [--body-file path]
 *   npm run post:list  [-- --json]
 *   npm run post:rm    -- <slug> [--force]
 *   npm run post:check
 *
 * Everything is a markdown file in content/posts/. Creating, editing and
 * deleting a post is creating, editing and deleting a file — so a Claude Code
 * session or a scheduled cloud agent can do all three with the normal file
 * tools and a git commit. This CLI exists so the frontmatter is always well
 * formed; it is not the only supported path.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const POSTS = path.join(ROOT, "content", "posts");

const PILLARS = ["آموزش پایه", "تحلیل", "استراتژی", "بازار", "محصول", "راهنما"];
const ART = ["bars", "line-up", "line-down", "cards", "mark"];

/* ── argv ─────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [key, inline] = a.slice(2).split("=");
      if (inline !== undefined) flags[key] = inline;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) flags[key] = argv[++i];
      else flags[key] = true;
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

/* ── helpers ──────────────────────────────────────────────────────────── */

/** Slugify Persian or Latin titles into a URL-safe ASCII-ish slug. */
function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[‌‏‎]/g, "-")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function randomSuffix() {
  return Math.random().toString(16).slice(2, 8);
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readFrontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim().replace(/^"(.*)"$/, "$1");
    out[kv[1]] = value;
  }
  return out;
}

function listFiles() {
  if (!fs.existsSync(POSTS)) return [];
  return fs.readdirSync(POSTS).filter((f) => /\.mdx?$/.test(f)).sort();
}

/* ── commands ─────────────────────────────────────────────────────────── */

function cmdNew(flags) {
  const title = flags.title;
  if (!title || title === true) die('--title is required, e.g. --title "کارمزد فیوچرز"');

  const slug = String(
    flags.slug && flags.slug !== true ? flags.slug : `${slugify(title)}-${randomSuffix()}`
  );
  if (!/^[\p{L}\p{N}-]+$/u.test(slug)) die(`slug "${slug}" contains characters that do not belong in a URL`);

  const file = path.join(POSTS, `${slug}.md`);
  if (fs.existsSync(file) && !flags.force) die(`${slug}.md already exists — pass --force to overwrite`);

  const category = flags.category && flags.category !== true ? String(flags.category) : PILLARS[0];
  if (!PILLARS.includes(category)) {
    die(`--category must be one of: ${PILLARS.join(" · ")}`);
  }

  const extra =
    flags.labels && flags.labels !== true
      ? String(flags.labels).split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const labels = [category, ...extra.filter((l) => l !== category)];

  const art = flags.art && ART.includes(String(flags.art)) ? String(flags.art) : ART[0];
  const lang = flags.lang === "en" ? "en" : "fa";
  const date = flags.date && flags.date !== true ? String(flags.date) : today();
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) die("--date must be YYYY-MM-DD");

  const description =
    flags.description && flags.description !== true
      ? String(flags.description)
      : "یک خلاصه یک تا دو جمله‌ای که در کارت‌ها، نتایج جستجو و شبکه‌های اجتماعی دیده می‌شود.";

  const body =
    flags["body-file"] && flags["body-file"] !== true
      ? fs.readFileSync(String(flags["body-file"]), "utf8")
      : lang === "en"
        ? "> One-paragraph direct answer. This block is what AI search and featured snippets lift.\n\n## First section\n\nBody text.\n\n_Nothing here is investment advice._\n"
        : "> پاسخ کوتاه و مستقیم در یک پاراگراف. این بلوک همان چیزی است که جستجوی هوش مصنوعی برمی‌دارد.\n\n## اولین بخش\n\nمتن اصلی.\n\n_این مطلب توصیه سرمایه‌گذاری نیست._\n";

  const fm = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `date: ${date}`,
    `lang: ${lang}`,
    `author: ${yamlString(flags.author && flags.author !== true ? flags.author : "تیم کپی‌بیت")}`,
    "labels:",
    ...labels.map((l) => `  - ${yamlString(l)}`),
    `art: ${art}`,
    `featured: ${flags.featured ? "true" : "false"}`,
    ...(flags.unlisted ? ["unlisted: true"] : []),
    ...(flags.draft ? ["draft: true"] : []),
    "---",
    "",
  ].join("\n");

  fs.mkdirSync(POSTS, { recursive: true });
  fs.writeFileSync(file, `${fm}\n${body.trimEnd()}\n`, "utf8");
  console.log(`✓ created content/posts/${slug}.md`);
  console.log(`  url: /${slug}`);
}

function cmdList(flags) {
  const rows = listFiles().map((f) => {
    const fm = readFrontmatter(path.join(POSTS, f));
    return {
      slug: f.replace(/\.mdx?$/, ""),
      title: fm.title ?? "(no title)",
      date: fm.date ?? "",
      lang: fm.lang ?? "fa",
      featured: fm.featured === "true",
      unlisted: fm.unlisted === "true",
      draft: fm.draft === "true",
    };
  });
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));

  if (flags.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (rows.length === 0) {
    console.log("no posts yet — run: npm run post:new -- --title \"…\"");
    return;
  }
  for (const r of rows) {
    const tags = [
      r.draft && "draft",
      r.unlisted && "unlisted",
      r.featured && "featured",
      r.lang === "en" && "en",
    ]
      .filter(Boolean)
      .join(",");
    console.log(`${r.date}  ${r.slug}${tags ? `  [${tags}]` : ""}\n            ${r.title}`);
  }
  console.log(`\n${rows.length} post${rows.length === 1 ? "" : "s"}`);
}

function cmdRemove(positional, flags) {
  const slug = positional[0];
  if (!slug) die("usage: npm run post:rm -- <slug>");

  const file = [`${slug}.md`, `${slug}.mdx`]
    .map((f) => path.join(POSTS, f))
    .find((p) => fs.existsSync(p));
  if (!file) die(`no post with slug "${slug}"`);

  const fm = readFrontmatter(file);
  if (!flags.force) {
    console.log(`About to delete: ${path.relative(ROOT, file)}`);
    console.log(`  title: ${fm.title ?? "(no title)"}`);
    console.log(`  url:   /${slug}`);
    console.log("\nThis breaks any existing link to that URL. Re-run with --force to confirm.");
    console.log("To keep the URL alive but hide the post from listings, set `unlisted: true` instead.");
    process.exit(2);
  }
  fs.unlinkSync(file);
  console.log(`✓ deleted ${path.relative(ROOT, file)}`);
}

function cmdCheck() {
  const files = listFiles();
  const seen = new Map();
  let problems = 0;

  for (const f of files) {
    const full = path.join(POSTS, f);
    const fm = readFrontmatter(full);
    const slug = f.replace(/\.mdx?$/, "");
    const where = `content/posts/${f}`;

    if (!fm.title) {
      console.error(`✗ ${where}: missing title`);
      problems++;
    }
    if (!fm.description) {
      console.warn(`! ${where}: no description — cards and search results will look thin`);
    }
    if (!fm.date || !/^\d{4}-\d{2}-\d{2}/.test(fm.date)) {
      console.error(`✗ ${where}: date must be YYYY-MM-DD`);
      problems++;
    }
    const raw = fs.readFileSync(full, "utf8");
    if (!/^---/.test(raw)) {
      console.error(`✗ ${where}: file does not start with frontmatter`);
      problems++;
    }
    if (!/^labels:/m.test(raw)) {
      console.warn(`! ${where}: no labels — the post gets no category and no breadcrumb parent`);
    } else {
      const block = raw.split(/^labels:\s*$/m)[1]?.split(/^\w/m)[0] ?? "";
      const first = block.match(/^\s*-\s*"?(.+?)"?\s*$/m)?.[1];
      if (first && !PILLARS.includes(first)) {
        console.warn(
          `! ${where}: first label "${first}" is not a pillar — the post will not appear under any /c/ page.\n    pillars: ${PILLARS.join(" · ")}`
        );
      }
    }
    if (seen.has(slug)) {
      console.error(`✗ duplicate slug "${slug}"`);
      problems++;
    }
    seen.set(slug, true);
  }

  console.log(
    problems === 0
      ? `✓ ${files.length} post${files.length === 1 ? "" : "s"} look fine`
      : `\n${problems} problem${problems === 1 ? "" : "s"} found`
  );
  process.exit(problems === 0 ? 0 : 1);
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

const [, , command, ...rest] = process.argv;
const { flags, positional } = parseArgs(rest);

switch (command) {
  case "new":
    cmdNew(flags);
    break;
  case "list":
    cmdList(flags);
    break;
  case "rm":
  case "remove":
  case "delete":
    cmdRemove(positional, flags);
    break;
  case "check":
    cmdCheck();
    break;
  default:
    console.log(`usage:
  npm run post:new   -- --title "…" [--category "تحلیل"] [--labels a,b] [--slug …]
  npm run post:list  [-- --json]
  npm run post:rm    -- <slug> [--force]
  npm run post:check`);
    process.exit(command ? 1 : 0);
}
