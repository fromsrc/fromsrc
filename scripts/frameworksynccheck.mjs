import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { adapterpaths, frameworks } from "./frameworkset.mjs";

const root = process.cwd();
const issues = [];

const files = [
  {
    expect: frameworks,
    path: "packages/create-fromsrc/src/frameworks.ts",
  },
  {
    expect: ['import { frameworks, parseframework } from "./frameworks"'],
    path: "packages/create-fromsrc/src/index.ts",
  },
  {
    expect: frameworks,
    path: "scripts/scaffoldcheck.mjs",
  },
  {
    expect: ['import { adapters } from "./frameworkset.mjs";'],
    path: "scripts/adaptercheck.mjs",
  },
  {
    expect: ['import { adapterpaths } from "./frameworkset.mjs";'],
    path: "scripts/entryset.mjs",
  },
  {
    expect: adapterpaths,
    path: "docs/frameworks.mdx",
  },
];

for (const file of files) {
  let text = "";
  try {
    text = await readFile(join(root, file.path), "utf8");
  } catch {
    issues.push(`missing ${file.path}`);
    continue;
  }
  for (const token of file.expect) {
    if (!text.includes(token)) {
      issues.push(`${file.path} missing ${token}`);
    }
  }
}

if (issues.length > 0) {
  console.error("x framework sync validation failed");
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(
  `o framework sync validation passed (${frameworks.length} frameworks)`
);
