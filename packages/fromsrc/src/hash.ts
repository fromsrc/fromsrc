import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

/** Hash entry for a single content file */
export interface ContentHash {
  path: string;
  hash: string;
  size: number;
}
/** Manifest of all content file hashes for change detection */
export interface HashManifest {
  generated: string;
  hashes: ContentHash[];
}
/** Detected changes between two hash manifests */
export interface Changes {
  added: string[];
  modified: string[];
  removed: string[];
}

function fnv1a(input: string): string {
  let h = 0x81_1C_9D_C5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01_00_01_93);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Compute an FNV-1a hash of a string */
export function hashContent(content: string): string {
  return fnv1a(content);
}

/** Hash a file and return its content hash and size */
export async function hashFile(filepath: string): Promise<ContentHash> {
  const [content, info] = await Promise.all([
    readFile(filepath, "utf8"),
    stat(filepath),
  ]);
  return { hash: fnv1a(content), path: filepath, size: info.size };
}

async function collectFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(full)));
    } else if (/\.mdx?$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/** Generate a hash manifest for all md/mdx files in a directory */
export async function generateHashManifest(dir: string): Promise<HashManifest> {
  const files = await collectFiles(dir);
  const hashes = await Promise.all(
    files.map(async (f) => {
      const h = await hashFile(f);
      return { ...h, path: relative(dir, f) };
    })
  );
  return { generated: new Date().toISOString(), hashes };
}

/** Diff two hash manifests to find added, modified, and removed files */
export function detectChanges(
  previous: HashManifest,
  current: HashManifest
): Changes {
  const prev = new Map(previous.hashes.map((h) => [h.path, h.hash]));
  const curr = new Map(current.hashes.map((h) => [h.path, h.hash]));
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];
  for (const [path, hash] of curr) {
    if (!prev.has(path)) {
      added.push(path);
    } else if (prev.get(path) !== hash) {
      modified.push(path);
    }
  }
  for (const path of prev.keys()) {
    if (!curr.has(path)) {
      removed.push(path);
    }
  }
  return { added, modified, removed };
}

/** Hash only the frontmatter section of a markdown file */
export function hashFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }
  const body = match[1];
  if (!body) {
    return null;
  }
  return fnv1a(body);
}
