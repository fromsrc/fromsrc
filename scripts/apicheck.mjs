import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const rules = [
  {
    file: "app/api/docs/route.ts",
    name: "api-docs-list",
    patterns: ['from "@/app/api/_lib/json"', "sendJson(", "const cache ="],
  },
  {
    file: "app/api/manifest/route.ts",
    name: "api-manifest",
    patterns: ['from "@/app/api/_lib/json"', "sendJson(", "const cache ="],
  },
  {
    file: "app/api/stats/route.ts",
    name: "api-stats",
    patterns: ['from "@/app/api/_lib/json"', "sendJson(", "const cache ="],
  },
  {
    file: "app/api/search/route.ts",
    name: "api-search",
    patterns: [
      'from "@/app/api/_lib/json"',
      "sendJsonWithHeaders(",
      "const cacheControl =",
    ],
  },
  {
    file: "app/api/search-index/route.ts",
    name: "api-search-index",
    patterns: [
      'from "@/app/api/_lib/json"',
      "sendJsonWithHeaders(",
      "const cacheControl =",
    ],
  },
  {
    file: "app/api/mcp/route.ts",
    name: "api-mcp",
    patterns: [
      'from "@/app/api/_lib/json"',
      "sendJson(",
      "const cacheControl =",
    ],
  },
  {
    file: "app/api/health/route.ts",
    name: "api-health",
    patterns: [
      'from "@/app/api/_lib/json"',
      "sendJson(",
      'const cache = "no-store"',
    ],
  },
];

const issues = [];

for (const rule of rules) {
  const path = join(root, rule.file);
  let text = "";
  try {
    text = await readFile(path, "utf8");
  } catch {
    issues.push(`${rule.name} missing file: ${rule.file}`);
    continue;
  }
  for (const pattern of rule.patterns) {
    if (!text.includes(pattern)) {
      issues.push(`${rule.name} missing pattern: ${pattern}`);
    }
  }
}

if (issues.length > 0) {
  console.error("x api contract validation failed");
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(`o api contract validation passed (${rules.length} routes)`);
