import { site } from "@/lib/site";
import { ArrowIcon } from "./Icons";

export default function Cta({
  title,
  dek,
  label,
  href = site.appUrl,
  slug,
}: {
  title: string;
  dek?: string;
  label?: string;
  href?: string;
  slug?: string;
}) {
  return (
    <aside className="cta">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="cta__title">{title}</span>
        {dek && <span className="cta__dek">{dek}</span>}
      </div>
      <a
        className="btn cta__btn"
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        data-umami-event="cta-post"
        data-umami-event-cta={title}
        data-umami-event-slug={slug}
        data-umami-event-placement="in-article"
        data-umami-event-outbound={href.startsWith("http") ? "true" : "false"}
      >
        <span>{label ?? "شروع کنید"}</span>
        <ArrowIcon size={15} className="arrow-rtl" />
      </a>
    </aside>
  );
}
