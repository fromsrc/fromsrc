import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { external, list } from "./sizeset.mjs";

const raw = await readFile(
  new URL("sizebaseline.json", import.meta.url),
  "utf8"
);
const base = JSON.parse(raw);
const root = await mkdtemp(join(process.cwd(), ".sizeexact-"));
let fail = false;

try {
  for (const item of list) {
    const mark = base[item.name];
    if (!mark) {
      console.error(`x missing baseline: ${item.name}`);
      fail = true;
      continue;
    }
    const file = join(root, `${item.name}.ts`);
    await writeFile(file, item.code, "utf8");
    const res = await Bun.build({
      entrypoints: [file],
      external,
      format: "esm",
      minify: true,
      root: process.cwd(),
      target: "browser",
      treeShaking: true,
      write: false,
    });
    if (!res.success) {
      for (const log of res.logs) {
        console.error(log.message);
      }
      throw new Error(`bundle failed: ${item.name}`);
    }
    const out = res.outputs.find((entry) => entry.path.endsWith(".js"));
    if (!out) {
      throw new Error(`missing output: ${item.name}`);
    }
    const text = await out.text();
    const { size } = out;
    const gzip = gzipSync(Buffer.from(text, "utf8")).byteLength;
    if (size !== mark.size || gzip !== mark.gzip) {
      fail = true;
      console.error(
        `x ${item.name}: expected ${mark.size}b/${mark.gzip}b got ${size}b/${gzip}b (run check:sizebaseline:update)`
      );
    } else {
      console.log(`o ${item.name}: matches ${size}b/${gzip}b`);
    }
  }
} finally {
  await rm(root, { force: true, recursive: true });
}

if (fail) {
  process.exit(1);
}
