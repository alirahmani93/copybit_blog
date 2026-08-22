import Script from "next/script";

/**
 * Umami analytics — self-hosted at stats.copybit.org.
 *
 * `data-domains` pins collection to the production host, so preview
 * deployments and localhost load the script but report nothing. Env vars
 * override every value; setting NEXT_PUBLIC_UMAMI_WEBSITE_ID to an empty
 * string is not enough to disable it, use NEXT_PUBLIC_UMAMI_DISABLED=1.
 *
 * Umami hooks the History API itself, so App Router client navigations are
 * counted as pageviews with no extra wiring.
 */
export default function Analytics() {
  if (process.env.NEXT_PUBLIC_UMAMI_DISABLED) return null;

  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "5ff9255f-efc6-4cd7-9dc9-f175620c1096";
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://stats.copybit.org/script.js";
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
