import Link from "next/link";
import CoverArt from "./CoverArt";
import { formatDate, readingTimeShort } from "@/lib/dates";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  const en = post.lang === "en";
  return (
    <article className="post-card" dir={en ? "ltr" : undefined}>
      <Link href={`/${post.slug}`} className="post-card__art" tabIndex={-1} aria-hidden>
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt=""
            style={{ width: "100%", height: 150, objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <CoverArt kind={post.art} height={150} />
        )}
      </Link>
      <div className="post-card__body">
        {post.pillar && (
          <Link href={post.pillar.href} className="badge badge--sm">
            {post.pillar.name}
          </Link>
        )}
        <h3 className="post-card__title" style={en ? { lineHeight: 1.35 } : undefined}>
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="post-card__dek" style={en ? { lineHeight: 1.55 } : undefined}>
          {post.description}
        </p>
        <div className="meta-row post-card__meta">
          <span className="tnum">{formatDate(post.date, post.lang)}</span>
          <span className="dot-sep" />
          <span className="tnum">{readingTimeShort(post.readingMinutes, post.lang)}</span>
        </div>
      </div>
    </article>
  );
}
