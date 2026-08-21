import Script from "next/script";

/**
 * Umami analytics.
 *
 * Renders nothing unless NEXT_PUBLIC_UMAMI_WEBSITE_ID is set, so local dev and
 * any fork stay untracked. `data-domains` pins collection to the production
 * host — without it every preview deployment reports into the same dashboard
 * and inflates the numbers.
 *
 * Umami hooks the History API itself, so App Router client navigations are
 * counted as pageviews with no extra wiring.
 */
export default function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;

  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js";
  const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS || "blog.copybit.org";

  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-domains={domains}
      strategy="afterInteractive"
      defer
    />
  );
}
