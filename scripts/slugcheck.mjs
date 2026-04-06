import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const rules = [
  {
    file: "app/api/docs/[...slug]/route.ts",
    name: "docs",
    patterns: [
      'from "@/app/api/_lib/slug"',
      "slugParamsMd.safeParse(",
      "normalizeSlug(",
    ],
  },
  {
    file: "app/api/raw/[...slug]/route.ts",
    name: "raw",
    patterns: ['from "@/app/api/_lib/slug"', "slugParams.safeParse("],
  },
  {
    file: "app/api/llms/[...slug]/route.ts",
    name: "llms",
    patterns: ['from "@/app/api/_lib/slug"', "slugParams.safeParse("],
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
  console.error("x slug contract validation failed");
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(`o slug contract validation passed (${rules.length} routes)`);
