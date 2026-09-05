import Link from "next/link";
import { CloseIcon } from "./Icons";
import { pillars } from "@/lib/site";

/** The pillar chip row. One list drives this, the header nav and breadcrumbs. */
export default function Chips({
  active,
  showEnglish = true,
  lang = "fa",
}: {
  active?: string;
  showEnglish?: boolean;
  lang?: "fa" | "en";
}) {
  const en = lang === "en";
  return (
    <nav
      aria-label={en ? "Categories" : "دسته‌ها"}
      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
    >
      <Link
        href={en ? "/en" : "/"}
        className="pill"
        data-active={!active}
        data-umami-event="chip-click"
        data-umami-event-category="all"
      >
        {en ? "All" : "همه"}
      </Link>

      {pillars.map((p) => {
        const isActive = active === p.slug;
        return (
          <Link
            key={p.slug}
            href={isActive ? (en ? "/en" : "/") : `/c/${p.slug}`}
            className="pill"
            data-active={isActive}
            data-umami-event={isActive ? "chip-clear" : "chip-click"}
            data-umami-event-category={p.slug}
            style={isActive ? { background: "var(--brand)", borderColor: "var(--brand)", color: "#fff" } : undefined}
          >
            {p.name}
            {isActive && <CloseIcon />}
          </Link>
        );
      })}

      {showEnglish && (
        <Link
          href={en ? "/" : "/en"}
          className={`pill${en ? "" : " lat"}`}
          data-umami-event="lang-switch"
          data-umami-event-to={en ? "fa" : "en"}
        >
          {en ? "فارسی" : "English"}
        </Link>
      )}
    </nav>
  );
}
