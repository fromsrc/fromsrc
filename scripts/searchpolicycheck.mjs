import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = [
  {
    file: join(root, "packages", "fromsrc", "src", "searchpolicy.ts"),
    name: "policy",
    pattern: /export\s+const\s+searchMaxQuery\s*=\s*(\d+)/,
  },
  {
    file: join(root, "app", "api", "search", "route.ts"),
    name: "api-import",
    pattern: /from\s+["']fromsrc\/searchpolicy["']/,
  },
  {
    file: join(root, "app", "api", "search", "route.ts"),
    name: "api-usage",
    pattern: /\.max\(searchMaxQuery\)/,
  },
  {
    file: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
    name: "search-ui-import",
    pattern: /from\s+["']\.\.\/searchpolicy["']/,
  },
  {
    file: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
    name: "search-ui-usage",
    pattern: /trimQuery\(/,
  },
  {
    file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
    name: "search-fetcher-import",
    pattern: /from\s+["']\.\.\/searchpolicy["']/,
  },
  {
    file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
    name: "search-fetcher-usage-normalize",
    pattern: /normalizeQuery\(/,
  },
  {
    file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
    name: "search-fetcher-usage-trim",
    pattern: /trimQuery\(/,
  },
];

const values = [];
const issues = [];

for (const item of files) {
  try {
    const text = await readFile(item.file, "utf8");
    const match = text.match(item.pattern);
    if (!match) {
      issues.push(`${item.name} policy missing`);
      continue;
    }
    if (item.name === "policy") {
      const raw = match[1] ?? "";
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        issues.push("policy max query value invalid");
        continue;
      }
      values.push({ name: item.name, value });
    }
  } catch {
    issues.push(`${item.name} file missing`);
  }
}

if (issues.length > 0) {
  console.error("x search policy validation failed");
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

const value = values[0]?.value ?? 0;
console.log(`o search policy validation passed (max query ${value})`);
