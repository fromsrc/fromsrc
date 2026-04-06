import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";

/** Supported documentation framework sources for migration */
export type MigrateSource = "docusaurus" | "nextra" | "mintlify";

/** Configuration for migrating docs from another framework */
export interface MigrateConfig {
  source: MigrateSource;
  inputDir: string;
  outputDir: string;
}

/** Result of a migration operation */
export interface MigrateResult {
  files: number;
  warnings: string[];
}

/** Function that transforms content from a source framework format */
export type MigrateTransform = (content: string, filepath: string) => string;

function convertAdmonitions(content: string): string {
  const lines = content.split("\n");
  const stack: string[] = [];
  const result: string[] = [];

  for (const line of lines) {
    if (/^:::note\s*$/.test(line)) {
      stack.push("Note");
      result.push("<Note>");
    } else if (/^:::tip\s*$/.test(line)) {
      stack.push("Callout");
      result.push('<Callout type="tip">');
    } else if (/^:::warning\s*$/.test(line)) {
      stack.push("Callout");
      result.push('<Callout type="warning">');
    } else if (/^:::danger\s*$/.test(line)) {
      stack.push("Callout");
      result.push('<Callout type="danger">');
    } else if (/^:::\s*$/.test(line) && stack.length > 0) {
      const tag = stack.pop();
      if (!tag) {
        continue;
      }
      result.push(`</${tag}>`);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}

/** Transform Docusaurus-flavored markdown to fromsrc format */
export const migrateDocusaurus: MigrateTransform = (content, _filepath) => {
  let out = content;
  out = out.replaceAll(
    /^import\s+.*from\s+['"]@docusaurus\/.*['"];?\s*$/gm,
    ""
  );
  out = out.replaceAll(
    /<TabItem\s+value="([^"]*)"(?:\s+label="([^"]*)")?>/g,
    '<Tab value="$1" label="$2">'
  );
  out = out.replaceAll("</TabItem>", "</Tab>");
  out = out.replaceAll(/<CodeBlock(?:\s+language="([^"]*)")?\s*>/g, "```$1");
  out = out.replaceAll("</CodeBlock>", "```");
  out = convertAdmonitions(out);
  out = out.replaceAll(/^sidebar_position:\s*.*$/gm, "");
  out = out.replaceAll(/^sidebar_label:\s*.*$/gm, "");
  out = out.replaceAll(/\n{3,}/g, "\n\n");
  return `${out.trim()}\n`;
};

/** Transform Nextra-flavored markdown to fromsrc format */
export const migrateNextra: MigrateTransform = (content, _filepath) => {
  let out = content;
  out = out.replaceAll(
    /<Callout\s+type="([^"]*)"(?:\s+emoji="[^"]*")?>/g,
    '<Callout type="$1">'
  );
  out = out.replaceAll(/<Tabs\s+items=\{(\[.*?\])\}>/g, "<Tabs items={$1}>");
  out = out.replaceAll("<Tabs.Tab>", "<Tab>");
  out = out.replaceAll("</Tabs.Tab>", "</Tab>");
  return `${out.trim()}\n`;
};

/** Transform Mintlify-flavored markdown to fromsrc format */
export const migrateMintlify: MigrateTransform = (content, _filepath) => {
  let out = content;
  out = out.replaceAll(/<CardGroup(?:\s+cols=\{(\d+)\})?>/g, "<Cards>");
  out = out.replaceAll("</CardGroup>", "</Cards>");
  out = out.replaceAll(/^api:\s*.*$/gm, "");
  out = out.replaceAll(/^openapi:\s*.*$/gm, "");
  out = out.replaceAll(/^auth:\s*.*$/gm, "");
  out = out.replaceAll(/\n{3,}/g, "\n\n");
  return `${out.trim()}\n`;
};

const transforms: Record<MigrateSource, MigrateTransform> = {
  docusaurus: migrateDocusaurus,
  mintlify: migrateMintlify,
  nextra: migrateNextra,
};

async function collectFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(full)));
    } else if ([".md", ".mdx"].includes(extname(entry.name))) {
      results.push(full);
    }
  }

  return results;
}

/** Migrate docs from another framework to fromsrc format */
export async function migrate(config: MigrateConfig): Promise<MigrateResult> {
  const { source, inputDir, outputDir } = config;
  const transform = transforms[source];
  const warnings: string[] = [];
  const files = await collectFiles(inputDir);

  let count = 0;
  for (const filepath of files) {
    const rel = relative(inputDir, filepath);
    const dest = join(outputDir, rel);

    try {
      const content = await readFile(filepath, "utf8");
      const result = transform(content, filepath);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, result, "utf8");
      count++;
    } catch (error) {
      warnings.push(
        `${rel}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return { files: count, warnings };
}
