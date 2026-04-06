import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/** Configuration for a git-based content source */
export interface GitSourceConfig {
  dir: string;
  branch?: string;
  tag?: string;
  glob?: string;
}

/** File retrieved from a git repository with content and metadata */
export interface GitFile {
  path: string;
  content: string;
  lastModified: Date;
  hash: string;
}

function ref(config: GitSourceConfig): string {
  return config.tag ?? config.branch ?? "HEAD";
}

/** Execute a git command and return trimmed stdout */
export async function gitExec(args: string[], cwd: string): Promise<string> {
  const { stdout } = await exec("git", args, { cwd });
  return stdout.trim();
}

/** List files in a git tree, optionally filtered by glob */
export async function listFiles(config: GitSourceConfig): Promise<string[]> {
  const output = await gitExec(
    ["ls-tree", "-r", "--name-only", ref(config)],
    config.dir
  );
  if (!output) {
    return [];
  }
  const files = output.split("\n");
  if (!config.glob) {
    return files;
  }
  const pattern = globToRegex(config.glob);
  return files.filter((f) => pattern.test(f));
}

/** Read a file from a git ref with content, hash, and last modified date */
export async function readFile(
  config: GitSourceConfig,
  path: string
): Promise<GitFile> {
  const r = ref(config);
  const content = await gitExec(["show", `${r}:${path}`], config.dir);
  const lastModified = await getLastModified(config.dir, path);
  const hash = await getFileHash(config.dir, path);
  return { content, hash, lastModified, path };
}

/** Get the last modified date of a file from git log */
export async function getLastModified(
  dir: string,
  path: string
): Promise<Date> {
  const output = await gitExec(["log", "-1", "--format=%aI", path], dir);
  return new Date(output);
}

/** Get the git object hash for a file */
export async function getFileHash(dir: string, path: string): Promise<string> {
  const output = await gitExec(["hash-object", path], dir);
  return output;
}

/** Create a content source backed by a local git repository */
export function createGitSource(config: GitSourceConfig) {
  return {
    get(path: string) {
      return readFile(config, path);
    },
    list() {
      return listFiles(config);
    },
  };
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replaceAll(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll('**', "\0")
    .replaceAll('*', "[^/]*")
    .replaceAll('\0', ".*")
    .replaceAll('?', "[^/]");
  return new RegExp(`^${escaped}$`);
}
