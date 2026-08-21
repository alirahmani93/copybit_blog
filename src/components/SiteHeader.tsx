"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, pillars } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";
import { ArrowIcon, GlobeIcon, LogoMark, MenuIcon, SearchIcon } from "./Icons";

const NAV = pillars.slice(0, 4);

export default function SiteHeader({ lang = "fa" }: { lang?: "fa" | "en" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const en = lang === "en";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <div className="site-header__start">
          <Link href={en ? "/en" : "/"} className="brand">
            <span className="brand__mark" style={{ color: "#fff" }}>
              <LogoMark />
            </span>
            <span className="brand__name">{site.name}</span>
            <span className="brand__rule" />
            <span className="brand__kicker">{en ? site.kickerEn : site.kicker}</span>
          </Link>

          <nav className="site-nav" aria-label={en ? "Sections" : "بخش‌ها"}>
            {NAV.map((p) => (
              <Link
                key={p.slug}
                href={`/c/${p.slug}`}
                aria-current={pathname === `/c/${p.slug}` ? "page" : undefined}
              >
                {p.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-header__end">
          <Link
            href="/search"
            className="icon-btn icon-btn--search"
            aria-label={en ? "Search" : "جستجو"}
          >
            <SearchIcon />
          </Link>

          <Link href={en ? "/" : "/en"} className="lang-btn" hrefLang={en ? "fa" : "en"}>
            <GlobeIcon />
            <span className={en ? undefined : "lat"}>{en ? "FA" : "EN"}</span>
          </Link>

          <ThemeToggle label={en ? "Toggle theme" : "تغییر پوسته"} />

          <a
            href={site.appUrl}
            className="btn btn--cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{en ? site.ctaLabelEn : site.ctaLabel}</span>
            <ArrowIcon className="arrow-rtl" />
          </a>

          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={en ? "Menu" : "منو"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className="mobile-nav"
        data-open={open}
        aria-label={en ? "Sections" : "بخش‌ها"}
      >
        {pillars.map((p) => (
          <Link key={p.slug} href={`/c/${p.slug}`}>
            {p.name}
          </Link>
        ))}
        <Link href="/search">{en ? "Search" : "جستجو"}</Link>
        <a href={site.appUrl} target="_blank" rel="noopener noreferrer">
          {en ? site.ctaLabelEn : site.ctaLabel}
        </a>
      </nav>
    </header>
  );
}
