import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="wrap" style={{ padding: "80px 24px" }}>
          <div className="empty card">
            <span className="tnum" style={{ fontSize: 34, fontWeight: 700, color: "var(--text)" }}>
              ۴۰۴
            </span>
            <strong style={{ color: "var(--text)", fontSize: 17 }}>این صفحه پیدا نشد</strong>
            <span style={{ fontSize: 14, lineHeight: 2 }}>
              شاید آدرس عوض شده باشد. از <Link href="/">صفحه اصلی</Link> یا{" "}
              <Link href="/search">جستجو</Link> ادامه بدهید.
            </span>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
