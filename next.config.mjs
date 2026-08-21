/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The OG image renderer reads Vazirmatn from disk at request time. Next's
  // file tracing follows imports, not runtime path strings, so without this the
  // font is missing from the deployed bundle and every banner 500s — while
  // working perfectly in a local build, where the whole repo is on disk.
  outputFileTracingIncludes: {
    "/**": ["./src/app/_fonts/**"],
  },
};

export default nextConfig;
