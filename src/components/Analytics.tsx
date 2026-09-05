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
 *
 * `data-before-send` names a global function Umami calls with every payload.
 * It stamps the language and pillar of the current page onto every custom
 * event, so any event can be broken down by section without each call site
 * passing it. Pageviews are left alone — their URL already says which post it
 * was, and stamping them would write an event_data row per view.
 */
const beforeSend = `window.__umamiBeforeSend=function(type,payload){
try{
if(type!=='event')return payload;
var meta=function(n){var m=document.querySelector('meta[name="'+n+'"]');return m&&m.content||''};
payload.data=Object.assign({},payload.data,{lang:meta('x-lang')||'fa'});
var p=meta('x-pillar');if(p)payload.data.pillar=p;
}catch(e){}
return payload;
}`;

export default function Analytics() {
  if (process.env.NEXT_PUBLIC_UMAMI_DISABLED) return null;

  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "5ff9255f-efc6-4cd7-9dc9-f175620c1096";
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://stats.copybit.org/script.js";
  const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS || "blog.copybit.org";
  const tag = process.env.NEXT_PUBLIC_UMAMI_TAG;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: beforeSend }} />
      <Script
        src={src}
        data-website-id={websiteId}
        data-domains={domains}
        data-before-send="__umamiBeforeSend"
        data-exclude-hash="true"
        data-tag={tag}
        strategy="afterInteractive"
        defer
      />
    </>
  );
}
