import Link from "next/link";
import { pillars, site } from "@/lib/site";
import { LogoMark } from "./Icons";

export default function SiteFooter({ lang = "fa" }: { lang?: "fa" | "en" }) {
  const en = lang === "en";
  const year = new Date().getUTCFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap site-footer__cols">
        <div className="site-footer__col">
          <div className="brand" style={{ marginBottom: 3 }}>
            <span
              className="brand__mark"
              style={{ width: 26, height: 26, borderRadius: 9, color: "#fff" }}
            >
              <LogoMark size={17} />
            </span>
            <span className="brand__name" style={{ fontSize: 16 }}>
              {site.name}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.95,
              color: "var(--secondary)",
              maxWidth: "38ch",
            }}
          >
            {en
              ? "Perps and spot on Hyperliquid, in your own language. Your keys never leave your hands."
              : "معاملات فیوچرز و اسپات روی هایپرلیکوئید، به زبان خودتان. کلید خصوصی همیشه پیش خودتان می‌ماند."}
          </p>
        </div>

        <div className="site-footer__col">
          <h2>{en ? "Blog" : "وبلاگ"}</h2>
          {pillars.slice(0, 3).map((p) => (
            <Link
              key={p.slug}
              href={`/c/${p.slug}`}
              data-umami-event="nav-pillar"
              data-umami-event-pillar={p.slug}
              data-umami-event-placement="footer"
            >
              {p.name}
            </Link>
          ))}
        </div>

        <div className="site-footer__col">
          <h2>{en ? "Product" : "محصول"}</h2>
          <a
            href={site.appUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="cta-footer-trade"
            data-umami-event-placement="footer"
            data-umami-event-lang={lang}
          >
            {en ? "Trade" : "معامله"}
          </a>
          <a
            href={site.appUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="cta-footer-copy"
            data-umami-event-placement="footer"
            data-umami-event-lang={lang}
          >
            {en ? "Copy trading" : "کپی معامله"}
          </a>
          <Link href="/c/product" data-umami-event="footer-fees">
            {en ? "Fees" : "کارمزدها"}
          </Link>
        </div>

        <div className="site-footer__col">
          <h2>{en ? "More" : "بیشتر"}</h2>
          <Link href="/" data-umami-event="lang-switch" data-umami-event-to="fa">
            فارسی
          </Link>
          <Link href="/en" className="lat" data-umami-event="lang-switch" data-umami-event-to="en">
            English
          </Link>
          <Link href="/feed.xml" className="lat" data-umami-event="rss-click">
            RSS
          </Link>
        </div>
      </div>

      <div className="site-footer__legal">
        <div className="wrap site-footer__legal-inner">
          <span className="lat">© {year} {site.name}</span>
          <span>{en ? "Leveraged trading carries the risk of total loss. Nothing here is investment advice." : site.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
