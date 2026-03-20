import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { external, list } from "./sizeset.mjs";

const root = await mkdtemp(join(process.cwd(), ".size-"));
let fail = false;

try {
  for (const item of list) {
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

    const { size } = out;
    const text = await out.text();
    const gzipsize = gzipSync(Buffer.from(text, "utf8")).byteLength;
    const line = `${item.name}: ${size}b gzip:${gzipsize}b (max ${item.max}b / ${item.maxgzip}b)`;
    if (size > item.max || gzipsize > item.maxgzip) {
      fail = true;
      console.error(`x ${line}`);
    } else {
      console.log(`o ${line}`);
    }
    if (item.block) {
      for (const token of item.block) {
        if (text.includes(token)) {
          fail = true;
          console.error(`x ${item.name}: leaked token "${token}"`);
        }
      }
    }
  }
} finally {
  await rm(root, { force: true, recursive: true });
}

if (fail) {
  process.exit(1);
}
