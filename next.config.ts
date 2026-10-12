import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The server-side Chrome (lib/renderBrowser.ts) loads its compressed browser files at run
  // time, which the build can't see — include them in the render functions explicitly.
  outputFileTracingIncludes: {
    '/api/render/**': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
};

export default nextConfig;
