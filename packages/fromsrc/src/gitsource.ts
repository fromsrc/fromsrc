import { execFile } from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(execFile)

export interface GitSourceConfig {
	dir: string
	branch?: string
	tag?: string
	glob?: string
}

export interface GitFile {
	path: string
	content: string
	lastModified: Date
	hash: string
}

function ref(config: GitSourceConfig): string {
	return config.tag ?? config.branch ?? "HEAD"
}

export async function gitExec(args: string[], cwd: string): Promise<string> {
	const { stdout } = await exec("git", args, { cwd })
	return stdout.trim()
}

export async function listFiles(config: GitSourceConfig): Promise<string[]> {
	const output = await gitExec(["ls-tree", "-r", "--name-only", ref(config)], config.dir)
	if (!output) return []
	const files = output.split("\n")
	if (!config.glob) return files
	const pattern = globToRegex(config.glob)
	return files.filter((f) => pattern.test(f))
}

export async function readFile(config: GitSourceConfig, path: string): Promise<GitFile> {
	const r = ref(config)
	const content = await gitExec(["show", `${r}:${path}`], config.dir)
	const lastModified = await getLastModified(config.dir, path)
	const hash = await getFileHash(config.dir, path)
	return { path, content, lastModified, hash }
}

export async function getLastModified(dir: string, path: string): Promise<Date> {
	const output = await gitExec(["log", "-1", "--format=%aI", path], dir)
	return new Date(output)
}

export async function getFileHash(dir: string, path: string): Promise<string> {
	const output = await gitExec(["hash-object", path], dir)
	return output
}

export function createGitSource(config: GitSourceConfig) {
	return {
		async list() {
			return listFiles(config)
		},
		async get(path: string) {
			return readFile(config, path)
		},
	}
}

function globToRegex(glob: string): RegExp {
	const escaped = glob
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "\0")
		.replace(/\*/g, "[^/]*")
		.replace(/\0/g, ".*")
		.replace(/\?/g, "[^/]")
	return new RegExp(`^${escaped}$`)
}
