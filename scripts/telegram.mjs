#!/usr/bin/env node
/**
 * Announce posts to the Telegram channel.
 *
 *   npm run post:tg -- <slug> [<slug>…] [--dry-run] [--force]
 *
 * Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the environment. The bot
 * must be an administrator of the channel. SITE_URL overrides the origin.
 *
 * The banner is not built here: it is the post page's own og:image, read off
 * the deployed HTML, so the picture in the channel is always the one the site
 * itself hands to Telegram. That fetch doubles as the "is it live yet" check.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

loadEnvLocal();

const ROOT = process.cwd();
const POSTS = path.join(ROOT, "content", "posts");
const SITE = (process.env.SITE_URL || "https://blog.copybit.org").replace(/\/$/, "");
const API = "https://api.telegram.org";
const CAPTION_LIMIT = 1024;

/** Read TELEGRAM_* out of a gitignored .env.local so a local run needs no exports. */
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const kv = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!kv || process.env[kv[1]] !== undefined) continue;
    process.env[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, "$1");
  }
}

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const flags = {};
  const slugs = [];
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [key, inline] = a.slice(2).split("=");
      flags[key] = inline === undefined ? true : inline;
    } else {
      slugs.push(a.replace(/^content\/posts\//, "").replace(/\.md$/, ""));
    }
  }
  return { flags, slugs };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function hashtag(label) {
  const tag = String(label).trim().replace(/[\s‌]+/g, "_").replace(/[^\p{L}\p{N}_]/gu, "");
  return tag ? `#${tag}` : "";
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function caption(post) {
  const { data, slug } = post;
  const url = `${SITE}/${slug}`;
  const labels = Array.isArray(data.labels) ? data.labels : [];

  const head = `<b>${escapeHtml(data.title)}</b>`;
  const tags = labels.map(hashtag).filter(Boolean).slice(0, 5).join(" ");
  const link = `<a href="${url}">خواندن مقاله</a>`;
  const room = CAPTION_LIMIT - [head, tags, link].filter(Boolean).join("\n\n").length - 2;
  const dek = data.description ? truncate(escapeHtml(String(data.description)), room) : "";

  return [head, dek, tags, link].filter(Boolean).join("\n\n");
}

async function ogImage(url, { attempts = 20, delayMs = 15000 } = {}) {
  let lastError = "no attempt made";
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "copybit-blog-telegram" } });
      if (res.ok) {
        const html = await res.text();
        const hit = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (hit) return hit[1].replace(/&amp;/g, "&");
        lastError = "page is live but has no og:image meta tag";
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
    if (i < attempts) {
      console.log(`  … ${url} not ready (${lastError}) — retry ${i}/${attempts - 1}`);
      await sleep(delayMs);
    }
  }
  throw new Error(`could not read og:image from ${url}: ${lastError}`);
}

async function callTelegram(token, method, payload) {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok === false) {
    throw new Error(`${method} failed: ${body.description || `HTTP ${res.status}`}`);
  }
  return body.result;
}

function readFrontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  let list = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && list) {
      out[list].push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rest] = kv;
    if (rest.trim() === "") {
      list = key;
      out[key] = [];
      continue;
    }
    list = null;
    const value = unquote(rest.trim());
    out[key] = value === "true" ? true : value === "false" ? false : value;
  }
  return out;
}

function unquote(value) {
  return String(value).trim().replace(/^["'](.*)["']$/s, "$1");
}

function readPost(slug) {
  const file = path.join(POSTS, `${slug}.md`);
  if (!fs.existsSync(file)) die(`no such post: content/posts/${slug}.md`);
  const data = readFrontmatter(file);
  if (!data.title) die(`${slug}: frontmatter has no title`);
  return { slug, data };
}

async function main() {
  const { flags, slugs } = parseArgs(process.argv.slice(2));
  if (!slugs.length) die("usage: npm run post:tg -- <slug> [<slug>…] [--dry-run] [--force]");

  const dryRun = Boolean(flags["dry-run"]);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!dryRun && (!token || !chatId)) die("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set");

  const attempts = flags["no-wait"] ? 1 : Number(flags["attempts"] || 20);
  let sent = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const post = readPost(slug);
    const hidden = post.data.draft === true || post.data.unlisted === true;
    if (hidden && !flags.force) {
      console.log(`↷ ${slug}: draft/unlisted — skipped (use --force to send anyway)`);
      skipped++;
      continue;
    }

    const url = `${SITE}/${slug}`;
    const text = caption(post);

    if (dryRun) {
      console.log(`— ${slug} → ${chatId || "(no chat id)"}\n${text}\n`);
      sent++;
      continue;
    }

    const photo = await ogImage(url, { attempts });
    await callTelegram(token, "sendPhoto", {
      chat_id: chatId,
      photo,
      caption: text,
      parse_mode: "HTML",
    });
    console.log(`✓ ${slug} announced`);
    sent++;
  }

  console.log(`\n${dryRun ? "would send" : "sent"} ${sent}${skipped ? `, skipped ${skipped}` : ""}`);
}

main().catch((err) => die(err.message));
