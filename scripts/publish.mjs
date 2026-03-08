import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"

function parse(version) {
	return version.split(".").map((part) => Number.parseInt(part, 10) || 0)
}

function compare(left, right) {
	const a = parse(left)
	const b = parse(right)
	const size = Math.max(a.length, b.length)
	for (let index = 0; index < size; index++) {
		const avalue = a[index] ?? 0
		const bvalue = b[index] ?? 0
		if (avalue > bvalue) return 1
		if (avalue < bvalue) return -1
	}
	return 0
}

function readpackage(dir) {
	const file = join(dir, "package.json")
	return JSON.parse(readFileSync(file, "utf8"))
}

function view(name) {
	try {
		return execFileSync("npm", ["view", name, "version"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim()
	} catch (error) {
		const stderr = String(error.stderr ?? "")
		if (stderr.includes("E404")) return null
		throw error
	}
}

function publish(dir) {
	const env = { ...process.env }
	if (process.env.NPM_TOKEN) {
		env.NODE_AUTH_TOKEN = process.env.NPM_TOKEN
	}
	execFileSync("npm", ["publish", "--provenance"], {
		cwd: dir,
		env,
		stdio: "inherit",
	})
}

const target = process.argv[2]
if (!target) {
	throw new Error("missing package directory")
}

const dir = resolve(process.cwd(), target)
const manifest = readpackage(dir)
const name = manifest.name
const local = manifest.version

if (typeof name !== "string" || typeof local !== "string") {
	throw new Error("invalid package manifest")
}

const remote = view(name)

if (remote && compare(local, remote) < 0) {
	throw new Error(`${name} local version ${local} is behind published version ${remote}`)
}

if (remote === local) {
	console.log(`o ${name}@${local} already published`)
	process.exit(0)
}

console.log(`o publishing ${name}@${local}`)
publish(dir)
