export const frameworks = [
  "next.js",
  "react-router",
  "vite",
  "tanstack",
  "remix",
  "astro",
];

export const adapterpaths = [
  "fromsrc/next",
  "fromsrc/react-router",
  "fromsrc/vite",
  "fromsrc/tanstack",
  "fromsrc/remix",
  "fromsrc/astro",
];

export const adapters = [
  { file: "next.ts", key: "next", name: "nextAdapter", path: "fromsrc/next" },
  {
    file: "reactrouter.ts",
    key: "react-router",
    name: "reactRouterAdapter",
    path: "fromsrc/react-router",
  },
  { file: "vite.ts", key: "vite", name: "viteAdapter", path: "fromsrc/vite" },
  {
    file: "tanstack.ts",
    key: "tanstack",
    name: "tanstackAdapter",
    path: "fromsrc/tanstack",
  },
  {
    file: "remix.ts",
    key: "remix",
    name: "remixAdapter",
    path: "fromsrc/remix",
  },
  {
    file: "astro.ts",
    key: "astro",
    name: "astroAdapter",
    path: "fromsrc/astro",
  },
];

export const manuals = [
  {
    card: 'title="next.js"',
    file: "docs/manual/next.mdx",
    href: 'href="/docs/manual/next"',
    install: "bun add fromsrc",
    name: "next.js",
    tokens: ["fromsrc/next", "AdapterProvider", "nextAdapter"],
  },
  {
    card: 'title="react router"',
    file: "docs/manual/react-router.mdx",
    href: 'href="/docs/manual/react-router"',
    install: "bun add fromsrc react-router",
    name: "react router",
    tokens: ["fromsrc/react-router", "AdapterProvider", "reactRouterAdapter"],
  },
  {
    card: 'title="vite"',
    file: "docs/manual/vite.mdx",
    href: 'href="/docs/manual/vite"',
    install: "bun add fromsrc react-router",
    name: "vite",
    tokens: ["fromsrc/vite", "AdapterProvider", "viteAdapter", "createAdapter"],
  },
  {
    card: 'title="tanstack start"',
    file: "docs/manual/tanstack.mdx",
    href: 'href="/docs/manual/tanstack"',
    install: "bun add fromsrc @tanstack/react-router",
    name: "tanstack start",
    tokens: ["fromsrc/tanstack", "AdapterProvider", "tanstackAdapter"],
  },
  {
    card: 'title="remix"',
    file: "docs/manual/remix.mdx",
    href: 'href="/docs/manual/remix"',
    install: "bun add fromsrc @remix-run/react",
    name: "remix",
    tokens: ["fromsrc/remix", "AdapterProvider", "remixAdapter"],
  },
  {
    card: 'title="astro"',
    file: "docs/manual/astro.mdx",
    href: 'href="/docs/manual/astro"',
    install: "bun add fromsrc",
    name: "astro",
    tokens: ["fromsrc/astro", "AdapterProvider", "astroAdapter"],
  },
];
