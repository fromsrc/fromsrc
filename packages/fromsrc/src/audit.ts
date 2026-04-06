import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

/** Configuration for the docs quality audit */
export interface AuditConfig {
  docsDir: string;
  maxAge?: number;
  requiredFields?: string[];
}

/** Single issue found during a docs audit */
export interface AuditIssue {
  file: string;
  type:
    | "stale"
    | "missing-field"
    | "empty"
    | "short"
    | "no-headings"
    | "orphan";
  message: string;
}

/** Audit results with total files, issues, and quality score */
export interface AuditResult {
  total: number;
  issues: AuditIssue[];
  score: number;
}

function parseFrontmatter(raw: string): {
  fields: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { body: raw, fields: {} };
  }
  const full = match[0];
  const section = match[1];
  if (!full || section === undefined) {
    return { body: raw, fields: {} };
  }
  const body = raw.slice(full.length).trim();
  const fields: Record<string, string> = {};
  for (const line of section.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { body, fields };
}

async function gather(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await gather(full)));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/** Run a quality audit on all docs files in a directory */
export async function audit(config: AuditConfig): Promise<AuditResult> {
  const maxAge = config.maxAge ?? 90;
  const required = config.requiredFields ?? ["title", "description"];
  const files = await gather(config.docsDir);
  const issues: AuditIssue[] = [];
  const now = Date.now();
  const threshold = maxAge * 86_400_000;

  for (const filepath of files) {
    const rel = relative(config.docsDir, filepath);
    const [raw, info] = await Promise.all([
      readFile(filepath, "utf8"),
      stat(filepath),
    ]);

    if (now - info.mtimeMs > threshold) {
      issues.push({
        file: rel,
        message: `modified over ${maxAge} days ago`,
        type: "stale",
      });
    }

    const { fields, body } = parseFrontmatter(raw);

    for (const field of required) {
      if (!fields[field]) {
        issues.push({
          file: rel,
          message: `missing ${field}`,
          type: "missing-field",
        });
      }
    }

    if (body.length < 10) {
      issues.push({ file: rel, message: "content is empty", type: "empty" });
    }

    const words = body.split(/\s+/).filter(Boolean).length;
    if (words < 100) {
      issues.push({ file: rel, message: `only ${words} words`, type: "short" });
    }

    if (!/^##\s/m.test(body)) {
      issues.push({
        file: rel,
        message: "no headings found",
        type: "no-headings",
      });
    }
  }

  const total = files.length;
  const score =
    total === 0
      ? 100
      : Math.max(0, Math.min(100, 100 - (issues.length / total) * 100));

  return { issues, score: Math.round(score), total };
}

/** Format audit results as a human-readable string */
export function formatAudit(result: AuditResult): string {
  const lines = [
    `audit: ${result.total} files, score ${result.score}/100`,
    `issues: ${result.issues.length}`,
  ];
  for (const issue of result.issues) {
    lines.push(`  ${issue.type} ${issue.file}: ${issue.message}`);
  }
  return lines.join("\n");
}
