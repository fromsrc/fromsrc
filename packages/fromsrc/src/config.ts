import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface FromsrcConfig {
  title: string;
  description?: string;
  baseUrl?: string;
  docsDir?: string;
  outDir?: string;
  theme?: string;
  search?: { provider?: string; options?: Record<string, unknown> };
  sidebar?: { defaultOpen?: boolean; collapsible?: boolean };
  toc?: { minDepth?: number; maxDepth?: number };
  i18n?: { defaultLocale?: string; locales?: string[] };
  editUrl?: string;
  lastUpdated?: boolean;
  draft?: boolean;
}

export type ResolvedConfig = Required<
  Pick<
    FromsrcConfig,
    "title" | "docsDir" | "outDir" | "theme" | "lastUpdated" | "draft"
  >
> & {
  description: string;
  baseUrl: string;
  search: { provider: string; options: Record<string, unknown> };
  sidebar: { defaultOpen: boolean; collapsible: boolean };
  toc: { minDepth: number; maxDepth: number };
  i18n: { defaultLocale: string; locales: string[] };
  editUrl: string;
};

const defaults: Omit<ResolvedConfig, "title"> = {
  baseUrl: "/",
  description: "",
  docsDir: "docs",
  draft: false,
  editUrl: "",
  i18n: { defaultLocale: "en", locales: ["en"] },
  lastUpdated: false,
  outDir: ".fromsrc",
  search: { options: {}, provider: "local" },
  sidebar: { collapsible: true, defaultOpen: true },
  theme: "default",
  toc: { maxDepth: 3, minDepth: 2 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isstring(value: unknown): value is string {
  return typeof value === "string";
}

function isboolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function parseconfig(value: unknown): FromsrcConfig | null {
  if (!isRecord(value)) {
    return null;
  }
  const { title } = value;
  if (!isstring(title)) {
    return null;
  }
  const config: FromsrcConfig = { title };
  if (isstring(value.description)) {
    config.description = value.description;
  }
  if (isstring(value.baseUrl)) {
    config.baseUrl = value.baseUrl;
  }
  if (isstring(value.docsDir)) {
    config.docsDir = value.docsDir;
  }
  if (isstring(value.outDir)) {
    config.outDir = value.outDir;
  }
  if (isstring(value.theme)) {
    config.theme = value.theme;
  }
  if (isstring(value.editUrl)) {
    config.editUrl = value.editUrl;
  }
  if (isboolean(value.lastUpdated)) {
    config.lastUpdated = value.lastUpdated;
  }
  if (isboolean(value.draft)) {
    config.draft = value.draft;
  }
  if (isRecord(value.search)) {
    const provider = isstring(value.search.provider)
      ? value.search.provider
      : undefined;
    const options = isRecord(value.search.options)
      ? value.search.options
      : undefined;
    config.search = { options, provider };
  }
  if (isRecord(value.sidebar)) {
    const defaultOpen = isboolean(value.sidebar.defaultOpen)
      ? value.sidebar.defaultOpen
      : undefined;
    const collapsible = isboolean(value.sidebar.collapsible)
      ? value.sidebar.collapsible
      : undefined;
    config.sidebar = { collapsible, defaultOpen };
  }
  if (isRecord(value.toc)) {
    const minDepth =
      typeof value.toc.minDepth === "number" ? value.toc.minDepth : undefined;
    const maxDepth =
      typeof value.toc.maxDepth === "number" ? value.toc.maxDepth : undefined;
    config.toc = { maxDepth, minDepth };
  }
  if (isRecord(value.i18n)) {
    const defaultLocale = isstring(value.i18n.defaultLocale)
      ? value.i18n.defaultLocale
      : undefined;
    const locales =
      Array.isArray(value.i18n.locales) &&
      value.i18n.locales.every((entry) => isstring(entry))
        ? value.i18n.locales
        : undefined;
    config.i18n = { defaultLocale, locales };
  }
  return config;
}

export function defineConfig(config: FromsrcConfig): FromsrcConfig {
  return config;
}

export function resolveConfig(config: FromsrcConfig): ResolvedConfig {
  const base: Record<string, unknown> = { ...defaults };
  const over: Record<string, unknown> = { ...config };
  return mergeConfig(base, over) as ResolvedConfig;
}

export async function loadConfig(dir: string): Promise<FromsrcConfig> {
  for (const name of ["fromsrc.config.ts", "fromsrc.config.js"]) {
    try {
      const mod = await import(join(dir, name));
      const parsed = parseconfig(mod.default ?? mod);
      if (parsed) {
        return parsed;
      }
    } catch {}
  }
  try {
    const raw = await readFile(join(dir, "fromsrc.config.json"), "utf8");
    const parsed = parseconfig(JSON.parse(raw));
    if (parsed) {
      return parsed;
    }
  } catch {}
  throw new Error("no config found");
}

export function mergeConfig(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    const b = base[key];
    const o = overrides[key];
    if (
      b &&
      o &&
      typeof b === "object" &&
      typeof o === "object" &&
      !Array.isArray(o)
    ) {
      result[key] = mergeConfig(
        b as Record<string, unknown>,
        o as Record<string, unknown>
      );
    } else if (o !== undefined) {
      result[key] = o;
    }
  }
  return result;
}
