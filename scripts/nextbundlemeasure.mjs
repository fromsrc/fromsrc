import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { targets } from "./nextbundleset.mjs";

const root = process.cwd();

function parsemanifest(text) {
  const index = text.indexOf("= {");
  if (index === -1) {
    throw new Error("manifest payload missing");
  }
  return JSON.parse(text.slice(index + 2).trim());
}

export async function measure(target) {
  const text = await readFile(join(root, target.manifest), "utf8");
  const manifest = parsemanifest(text);
  const map = manifest.entryJSFiles ?? {};
  const files = map[target.route];
  if (!Array.isArray(files)) {
    throw new TypeError(`route chunks missing (${target.route})`);
  }
  const unique = [...new Set(files)];
  let raw = 0;
  let gzip = 0;
  for (const file of unique) {
    const output = await readFile(join(root, ".next", file));
    raw += output.byteLength;
    gzip += gzipSync(output).byteLength;
  }
  return { gzip, size: raw };
}

export async function measureall() {
  const next = {};
  for (const target of targets) {
    next[target.name] = await measure(target);
  }
  return next;
}
