import Link from "next/link";
import CoverArt from "./CoverArt";
import Byline from "./Byline";
import type { Post } from "@/lib/posts";

export default function FeaturedPost({ post, label }: { post: Post; label: string }) {
  const en = post.lang === "en";
  return (
    <section aria-label={label}>
      <div className="section-head">
        <span className="eyebrow">{label}</span>
        <span className="section-head__rule" />
      </div>

      <article className="featured" dir={en ? "ltr" : undefined}>
        <div className="featured__body">
          {post.pillar && (
            <Link
              href={post.pillar.href}
              className="badge"
              data-umami-event="badge-click"
              data-umami-event-pillar={post.pillar.name}
            >
              {post.pillar.name}
            </Link>
          )}
          <h2 className="featured__title" style={en ? { lineHeight: 1.2, letterSpacing: "-0.025em" } : undefined}>
            <Link
              href={`/${post.slug}`}
              data-umami-event="post-click"
              data-umami-event-slug={post.slug}
              data-umami-event-place="featured"
            >
              {post.title}
            </Link>
          </h2>
          <p className="featured__dek" style={en ? { lineHeight: 1.65, maxWidth: "46ch" } : undefined}>
            {post.description}
          </p>
          <Byline
            author={post.author}
            date={post.date}
            minutes={post.readingMinutes}
            lang={post.lang}
          />
        </div>
        <Link
          href={`/${post.slug}`}
          className="featured__art"
          tabIndex={-1}
          aria-hidden
          data-umami-event="post-click"
          data-umami-event-slug={post.slug}
          data-umami-event-place="featured"
        >
          {post.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover}
              alt=""
              style={{ width: "100%", height: "100%", minHeight: 348, objectFit: "cover" }}
            />
          ) : (
            <CoverArt kind={post.art} height={348} />
          )}
        </Link>
      </article>
    </section>
  );
}
