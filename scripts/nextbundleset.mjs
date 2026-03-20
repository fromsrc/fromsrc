export const targets = [
  {
    manifest: ".next/server/app/page_client-reference-manifest.js",
    max: 80_000,
    maxgzip: 22_000,
    name: "home",
    route: "[project]/app/page",
  },
  {
    manifest:
      ".next/server/app/docs/[[...slug]]/page_client-reference-manifest.js",
    max: 420_000,
    maxgzip: 115_000,
    name: "docs",
    route: "[project]/app/docs/[[...slug]]/page",
  },
];
