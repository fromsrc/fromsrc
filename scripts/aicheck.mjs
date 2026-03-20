import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const rules = [
  {
    file: "app/llms.txt/route.ts",
    name: "llms-index",
    patterns: ['from "@/app/api/_lib/text"', "return send("],
  },
  {
    file: "app/llms-full.txt/route.ts",
    name: "llms-full",
    patterns: ['from "@/app/api/_lib/text"', "return send("],
  },
  {
    file: "app/api/raw/[...slug]/route.ts",
    name: "raw-markdown",
    patterns: ['from "@/app/api/_lib/text"', "return send("],
  },
  {
    file: "app/api/raw/route.ts",
    name: "raw-root",
    patterns: ['from "@/app/api/_lib/text"', "return send("],
  },
  {
    file: "app/api/llms/route.ts",
    name: "llms-root",
    patterns: ['from "@/app/api/_lib/text"', "return send("],
  },
  {
    file: "app/api/docs/[...slug]/route.ts",
    name: "docs-markdown",
    patterns: ['from "@/app/api/_lib/text"', "return sendmarkdown("],
  },
  {
    file: "app/api/mcp/route.ts",
    name: "mcp-route",
    patterns: ['from "@/app/api/_lib/json"', "sendjson("],
  },
  {
    file: "app/.well-known/llms.txt/route.ts",
    name: "well-known-llms",
    patterns: ['redirect("/llms.txt")'],
  },
  {
    file: "app/.well-known/llms-full.txt/route.ts",
    name: "well-known-llms-full",
    patterns: ['redirect("/llms-full.txt")'],
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
  console.error("x ai endpoint contract validation failed");
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(
  `o ai endpoint contract validation passed (${rules.length} routes)`
);
