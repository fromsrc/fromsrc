import { generate } from "./generate"
import { ask, close, select } from "./prompt"
import type { Framework } from "./templates"

const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"] as const

function usage() {
	console.log("  usage: create-fromsrc [options]")
	console.log("  options:")
	console.log("    -n, --name <name>")
	console.log("    -f, --framework <framework>")
	console.log("    -y, --yes")
	console.log("    -h, --help")
	console.log(`  frameworks: ${frameworks.join(", ")}\n`)
}

function readflag(key: string, short: string): string | undefined {
	const args = process.argv.slice(2)
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
	return args.includes(`--${key}`) || args.includes(`-${short}`)
}

function parseframework(value: string | undefined): Framework | undefined {
	if (!value) {
		return undefined
	}
	const found = frameworks.find((item) => item === value)
	return found
}

async function main() {
	console.log("\n  fromsrc\n")

	if (hasflag("help", "h")) {
		close()
		usage()
		return
	}

	const yes = hasflag("yes", "y")
	const argname = readflag("name", "n")
	const argframework = parseframework(readflag("framework", "f"))
	const rawframework = readflag("framework", "f")

	if (rawframework && !argframework) {
		close()
		console.log(`  invalid framework: ${rawframework}`)
		console.log(`  valid: ${frameworks.join(", ")}\n`)
		process.exit(1)
	}

	const name = argname ?? (yes ? "my-docs" : await ask("  project name", "my-docs"))
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
