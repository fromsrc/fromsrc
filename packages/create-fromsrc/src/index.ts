import { generate } from "./generate"
import { ask, close, select } from "./prompt"
import type { Framework } from "./templates"

const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"] as const
const aliases = {
	next: "next.js",
	nextjs: "next.js",
	rr: "react-router",
	router: "react-router",
	reactrouter: "react-router",
	ts: "tanstack",
	tanstackstart: "tanstack",
} as const

function usage() {
	console.log("  usage: create-fromsrc [options]")
	console.log("  options:")
	console.log("    -n, --name <name>")
	console.log("    -f, --framework <framework>")
	console.log("    -l, --list")
	console.log("    -y, --yes")
	console.log("    -h, --help")
	console.log(`  frameworks: ${frameworks.join(", ")}\n`)
}

function readflag(key: string, short: string): string | undefined {
	const args = process.argv.slice(2)
	const long = `--${key}=`
	for (const value of args) {
		if (value.startsWith(long)) {
			const inline = value.slice(long.length)
			return inline.length > 0 ? inline : undefined
		}
	}
	const full = args.indexOf(`--${key}`)
	if (full !== -1) {
		const value = args[full + 1]
		return value && !value.startsWith("-") ? value : undefined
	}
	const mini = args.indexOf(`-${short}`)
	if (mini !== -1) {
		const value = args[mini + 1]
		return value && !value.startsWith("-") ? value : undefined
	}
	return undefined
}

function hasflag(key: string, short: string): boolean {
	const args = process.argv.slice(2)
	return args.includes(`--${key}`) || args.includes(`-${short}`) || args.some((item) => item.startsWith(`--${key}=`))
}

function missingvalue(key: string, short: string): boolean {
	const args = process.argv.slice(2)
	const long = `--${key}=`
	for (const value of args) {
		if (value.startsWith(long)) {
			return value.slice(long.length).length === 0
		}
	}
	const full = args.indexOf(`--${key}`)
	if (full !== -1) {
		const value = args[full + 1]
		return !value || value.startsWith("-")
	}
	const mini = args.indexOf(`-${short}`)
	if (mini !== -1) {
		const value = args[mini + 1]
		return !value || value.startsWith("-")
	}
	return false
}

function unknownflags(): string[] {
	const args = process.argv.slice(2)
	const known = new Set(["--name", "-n", "--framework", "-f", "--yes", "-y", "--help", "-h", "--list", "-l"])
	const inline = ["--name=", "--framework="]
	const out: string[] = []
	for (let i = 0; i < args.length; i++) {
		const value = args[i]
		if (!value || !value.startsWith("-")) {
			continue
		}
		if (inline.some((item) => value.startsWith(item))) {
			continue
		}
		if (known.has(value)) {
			if (value === "--name" || value === "-n" || value === "--framework" || value === "-f") {
				i += 1
			}
			continue
		}
		out.push(value)
	}
	return out
}

function positional(): string | undefined {
	const args = process.argv.slice(2)
	for (let i = 0; i < args.length; i++) {
		const value = args[i]
		if (!value || value.startsWith("-")) {
			continue
		}
		const prev = i > 0 ? args[i - 1] : undefined
		if (prev === "--name" || prev === "-n" || prev === "--framework" || prev === "-f") {
			continue
		}
		return value
	}
	return undefined
}

function parseframework(value: string | undefined): Framework | undefined {
	if (!value) {
		return undefined
	}
	const key = value.toLowerCase().replaceAll("_", "").replaceAll("-", "").replaceAll(".", "")
	const mapped = (aliases as Record<string, Framework | undefined>)[key]
	const target = mapped ?? value.toLowerCase()
	const found = frameworks.find((item) => item.toLowerCase() === target)
	return found
}

async function main() {
	console.log("\n  fromsrc\n")

	if (hasflag("help", "h")) {
		close()
		usage()
		return
	}
	if (hasflag("list", "l")) {
		close()
		console.log(`  ${frameworks.join("\n  ")}\n`)
		return
	}

	const yes = hasflag("yes", "y")
	const unknown = unknownflags()
	if (unknown.length > 0) {
		close()
		console.log(`  unknown option: ${unknown[0]}\n`)
		process.exit(1)
	}
	if (missingvalue("name", "n")) {
		close()
		console.log("  missing value for --name\n")
		process.exit(1)
	}
	if (missingvalue("framework", "f")) {
		close()
		console.log("  missing value for --framework\n")
		process.exit(1)
	}
	const argname = readflag("name", "n")
	const positionalname = positional()
	const argframework = parseframework(readflag("framework", "f"))
	const rawframework = readflag("framework", "f")

	if (rawframework && !argframework) {
		close()
		console.log(`  invalid framework: ${rawframework}`)
		console.log(`  valid: ${frameworks.join(", ")}\n`)
		process.exit(1)
	}

	const name = argname ?? positionalname ?? (yes ? "my-docs" : await ask("  project name", "my-docs"))
	const framework = argframework ?? (yes ? frameworks[0] : await select<Framework>("  framework", frameworks, 0))

	close()

	console.log()
	generate({ name, framework })

	console.log(`  created ${name}`)
	console.log(`\n  cd ${name}`)
	console.log("  bun install")
	console.log("  bun dev\n")
}

main()
