import { generate } from "./generate"
import { ask, close, select } from "./prompt"
import type { Framework } from "./templates"

const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"] as const

async function main() {
	console.log("\n  fromsrc\n")

	const name = await ask("  project name", "my-docs")
	const framework = await select<Framework>("  framework", frameworks, 0)

	close()

	console.log()
	generate({ name, framework })

	console.log(`  created ${name}`)
	console.log(`\n  cd ${name}`)
	console.log("  bun install")
	console.log("  bun dev\n")
}

main()
