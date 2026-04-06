import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Framework } from "./frameworks";
import {
  docsLayout,
  docsPage,
  layout,
  metaJson,
  page,
  welcomeMdx,
} from "./pages";
import {
  astroConfig,
  astroIndex,
  astroEnv,
  astroPage,
  browserApp,
  browserEntry,
  gitignore,
  globalsCss,
  nextGlobalsCss,
  nextEnv,
  packageJson,
  nextConfig,
  postcssConfig,
  remixDocs,
  rawEnv,
  remixRootIndex,
  remixRoot,
  remixViteConfig,
  tailwindConfig,
  tsconfig,
  viteHtml,
} from "./templates";

interface Options {
  name: string;
  framework: Framework;
}

function validName(name: string): boolean {
  if (!name) {
    return false;
  }
  if (name === "." || name === "..") {
    return false;
  }
  if (name.includes("/") || name.includes("\\") || name.includes("\0")) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

function write(dir: string, file: string, content: string) {
  const filepath = join(dir, file);
  const parent = join(filepath, "..");
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
  writeFileSync(filepath, content);
}

export function generate(options: Options) {
  const { name, framework } = options;
  if (!validName(name)) {
    console.log(`\n  invalid project name "${name}"`);
    process.exit(1);
  }
  const target = join(process.cwd(), name);

  if (existsSync(target)) {
    console.log(`\n  directory "${name}" already exists`);
    process.exit(1);
  }

  mkdirSync(target, { recursive: true });
  write(target, "content/docs/index.mdx", welcomeMdx);

  write(target, "package.json", packageJson(name, framework));
  write(target, "tsconfig.json", tsconfig(framework));
  write(target, ".gitignore", gitignore);

  if (framework === "next.js") {
    write(target, "next.config.ts", nextConfig);
    write(target, "next-env.d.ts", nextEnv);
    write(target, "tailwind.config.ts", tailwindConfig);
    write(target, "postcss.config.mjs", postcssConfig);
    write(target, "app/globals.css", nextGlobalsCss);
    write(target, "app/layout.tsx", layout);
    write(target, "app/page.tsx", page);
    write(target, "app/docs/layout.tsx", docsLayout);
    write(target, "app/docs/[[...slug]]/page.tsx", docsPage);
    write(target, "content/docs/_meta.json", metaJson);
    return target;
  }

  if (framework === "astro") {
    write(target, "astro.config.mjs", astroConfig);
    write(target, "src/pages/index.astro", astroIndex);
    write(target, "src/pages/docs.astro", astroPage);
    write(target, "src/styles/global.css", globalsCss);
    write(target, "src/env.d.ts", astroEnv);
    return target;
  }

  if (framework === "remix") {
    write(target, "vite.config.ts", remixViteConfig);
    write(target, "env.d.ts", rawEnv);
    write(target, "app/root.tsx", remixRoot);
    write(target, "app/routes/_index.tsx", remixRootIndex);
    write(target, "app/routes/docs.tsx", remixDocs);
    return target;
  }

  write(target, "index.html", viteHtml);
  write(target, "src/env.d.ts", rawEnv);
  write(target, "src/main.tsx", browserEntry());
  write(target, "src/app.tsx", browserApp);
  write(target, "src/globals.css", globalsCss);

  return target;
}
