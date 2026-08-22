import { site } from "@/lib/site";
import { ArrowIcon } from "./Icons";

export default function Cta({
  title,
  dek,
  label,
  href = site.appUrl,
}: {
  title: string;
  dek?: string;
  label?: string;
  href?: string;
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
      >
        <span>{label ?? "شروع کنید"}</span>
        <ArrowIcon size={15} className="arrow-rtl" />
      </a>
    </aside>
  );
}
