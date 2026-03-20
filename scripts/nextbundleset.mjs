export const targets = [
  {
    manifest: ".next/server/app/page_client-reference-manifest.js",
    max: 30_000,
    maxgzip: 9000,
    name: "home",
    route: "[project]/app/page",
  },
  {
    manifest:
      ".next/server/app/docs/[[...slug]]/page_client-reference-manifest.js",
    max: 380_000,
    maxgzip: 100_000,
    name: "docs",
    route: "[project]/app/docs/[[...slug]]/page",
  },
];
