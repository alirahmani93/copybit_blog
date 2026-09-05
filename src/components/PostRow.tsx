import Link from "next/link";
import CoverArt from "./CoverArt";
import { formatDate, readingTimeShort } from "@/lib/dates";
import type { Post } from "@/lib/posts";

export default function PostRow({ post, place = "rows" }: { post: Post; place?: string }) {
  const en = post.lang === "en";
  return (
    <article className="post-row" dir={en ? "ltr" : undefined}>
      <Link
        href={`/${post.slug}`}
        className="post-row__art"
        tabIndex={-1}
        aria-hidden
        data-umami-event="post-click"
        data-umami-event-slug={post.slug}
        data-umami-event-place={place}
      >
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <CoverArt kind={post.art} height={120} />
        )}
      </Link>
      <div className="post-row__body">
        <div className="meta-row">
          {post.pillar && (
            <Link
              href={post.pillar.href}
              className="badge badge--sm"
              data-umami-event="badge-click"
              data-umami-event-pillar={post.pillar.name}
            >
              {post.pillar.name}
            </Link>
          )}
          <span className="tnum">
            {formatDate(post.date, post.lang)} · {readingTimeShort(post.readingMinutes, post.lang)}
          </span>
        </div>
        <h3 className="post-row__title">
          <Link
            href={`/${post.slug}`}
            data-umami-event="post-click"
            data-umami-event-slug={post.slug}
            data-umami-event-place={place}
          >
            {post.title}
          </Link>
        </h3>
        <p className="post-row__dek">{post.description}</p>
      </div>
    </article>
  );
}
