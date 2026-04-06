import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";
import { isRecord } from "./guard";

/** Single navigation entry with optional nested children */
export interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
  order?: number;
  icon?: string;
}
/** Configuration for filesystem-based navigation generation */
export interface NavConfig {
  dir: string;
  extensions?: string[];
  orderFile?: string;
  titleFromFile?: boolean;
}
/** Navigation tree with hierarchical and flattened views */
export interface NavTree {
  items: NavItem[];
  flat: NavItem[];
}
/** Sidebar-specific navigation item with href instead of path */
export interface SidebarItem {
  title: string;
  href: string;
  icon?: string;
  items?: SidebarItem[];
}

function titleize(s: string): string {
  return s.replaceAll(/[-_]/g, " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

interface MetaEntry {
  title?: string;
  order?: number;
  icon?: string;
}

function isMetaEntry(value: unknown): value is MetaEntry {
  if (!isRecord(value)) {
    return false;
  }
  const { title } = value;
  const { order } = value;
  const { icon } = value;
  if (title !== undefined && typeof title !== "string") {
    return false;
  }
  if (order !== undefined && typeof order !== "number") {
    return false;
  }
  if (icon !== undefined && typeof icon !== "string") {
    return false;
  }
  return true;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseMetaTs(raw: string): unknown {
  const match = raw.match(/export\s+default\s+({[\s\S]*})/);
  if (!match) {
    return null;
  }
  const body = match[1];
  return body ? parseJson(body) : null;
}

async function readMeta(
  dir: string
): Promise<Record<string, string | MetaEntry>> {
  for (const name of ["_meta.json", "_meta.ts"]) {
    try {
      const raw = await readFile(join(dir, name), "utf8");
      const parsed = name.endsWith(".json") ? parseJson(raw) : parseMetaTs(raw);
      if (!isRecord(parsed)) {
        return {};
      }
      const result: Record<string, string | MetaEntry> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string" || isMetaEntry(value)) {
          result[key] = value;
        }
      }
      return result;
    } catch {}
  }
  return {};
}

async function extractTitle(file: string): Promise<string | null> {
  try {
    const m = (await readFile(file, "utf8")).match(/^#\s+(.+)$/m);
    const title = m?.[1];
    return title ? title.trim() : null;
  } catch {
    return null;
  }
}

function resolveMeta(
  meta: Record<string, string | MetaEntry>,
  key: string,
  fallback: string
) {
  const e = meta[key];
  const title = typeof e === "string" ? e : (e?.title ?? fallback);
  const order = typeof e === "string" ? undefined : e?.order;
  const icon = typeof e === "string" ? undefined : e?.icon;
  return { icon, order, title };
}

async function scanDir(
  dir: string,
  root: string,
  exts: string[],
  h1: boolean
): Promise<NavItem[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const meta = await readMeta(dir);
  const items: NavItem[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) {
      continue;
    }
    const full = join(dir, entry.name);
    const rel = relative(root, full).replaceAll('\\', "/");
    if (entry.isDirectory()) {
      const children = await scanDir(full, root, exts, h1);
      const idx = children.find((c) => basename(c.path).startsWith("index"));
      const r = resolveMeta(
        meta,
        entry.name,
        idx?.title ?? titleize(entry.name)
      );
      items.push({
        ...r,
        children: children.filter((c) => !basename(c.path).startsWith("index")),
        path: "/" + rel,
      });
      continue;
    }
    const ext = extname(entry.name);
    if (!exts.includes(ext)) {
      continue;
    }
    const slug = rel.replace(new RegExp(`${ext}$`), "");
    const r = resolveMeta(
      meta,
      basename(entry.name, ext),
      titleize(basename(entry.name, ext))
    );
    if (h1) {
      const t = await extractTitle(full);
      if (t) {
        r.title = t;
      }
    }
    items.push({ ...r, path: "/" + slug });
  }
  return sortNav(items);
}

/** Generate navigation tree by scanning a directory of docs files */
export async function generateNav(config: NavConfig): Promise<NavTree> {
  const exts = config.extensions ?? [".mdx", ".md"];
  const items = await scanDir(
    config.dir,
    config.dir,
    exts,
    config.titleFromFile ?? false
  );
  return { flat: flattenNav(items), items };
}

/** Sort navigation items by order then title alphabetically */
export function sortNav(items: NavItem[]): NavItem[] {
  return [...items]
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title)
    )
    .map((i) => (i.children ? { ...i, children: sortNav(i.children) } : i));
}

/** Flatten a nested navigation tree into a single-level array */
export function flattenNav(items: NavItem[]): NavItem[] {
  const r: NavItem[] = [];
  for (const i of items) {
    r.push(i);
    if (i.children) {
      r.push(...flattenNav(i.children));
    }
  }
  return r;
}

/** Find a navigation item by path in a nested tree */
export function findNavItem(
  items: NavItem[],
  path: string
): NavItem | undefined {
  for (const i of items) {
    if (i.path === path) {
      return i;
    }
    if (i.children) {
      const f = findNavItem(i.children, path);
      if (f) {
        return f;
      }
    }
  }
  return undefined;
}

/** Convert navigation items to sidebar-compatible format */
export function navToSidebar(items: NavItem[]): SidebarItem[] {
  return items.map((i) => ({
    href: i.path,
    icon: i.icon,
    title: i.title,
    ...(i.children?.length ? { items: navToSidebar(i.children) } : {}),
  }));
}

/** Build breadcrumb trail from root to the given path */
export function breadcrumbFromPath(items: NavItem[], path: string): NavItem[] {
  function walk(cur: NavItem[], trail: NavItem[]): NavItem[] | null {
    for (const i of cur) {
      const next = [...trail, i];
      if (i.path === path) {
        return next;
      }
      if (i.children) {
        const f = walk(i.children, next);
        if (f) {
          return f;
        }
      }
    }
    return null;
  }
  return walk(items, []) ?? [];
}
