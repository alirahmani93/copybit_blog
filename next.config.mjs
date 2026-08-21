/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Anything read from disk at request time has to be force-included. Next's
  // file tracing follows imports, not runtime path strings, and both of these
  // are read by path: the OG renderer loads Vazirmatn, and lib/posts reads the
  // markdown. Locally the whole repo is on disk so both work and the gap is
  // invisible; in a serverless bundle the font 500s the route and the missing
  // markdown silently renders every banner as the generic fallback.
  outputFileTracingIncludes: {
    "/**": ["./src/app/_fonts/**", "./content/**"],
  },
};

export default nextConfig;
