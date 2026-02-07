export type CliCommand = {
	name: string
	description: string
	run: (args: string[]) => Promise<void>
}

export type CliConfig = {
	name: string
	version: string
	commands: CliCommand[]
}

type ParsedArgs = { command: string; flags: Record<string, string | boolean>; args: string[] }

export function parseArgs(argv: string[]): ParsedArgs {
	const flags: Record<string, string | boolean> = {}
	const args: string[] = []
	let command = ""

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!
		if (arg.startsWith("--")) {
			const eq = arg.indexOf("=")
			if (eq !== -1) {
				flags[arg.slice(2, eq)] = arg.slice(eq + 1)
			} else {
				const next = argv[i + 1]
				if (next && !next.startsWith("-")) {
					flags[arg.slice(2)] = next
					i++
				} else {
					flags[arg.slice(2)] = true
				}
			}
		} else if (arg.startsWith("-") && arg.length === 2) {
			const next = argv[i + 1]
			if (next && !next.startsWith("-")) {
				flags[arg.slice(1)] = next
				i++
			} else {
				flags[arg.slice(1)] = true
			}
		} else if (!command) {
			command = arg
		} else {
			args.push(arg)
		}
	}
	return { command, flags, args }
}

export function formatHelp(config: CliConfig): string {
	const lines = [`${config.name} v${config.version}`, "", "commands:"]
	const pad = Math.max(...config.commands.map((c) => c.name.length)) + 2
	for (const cmd of config.commands) {
		lines.push(`  ${cmd.name.padEnd(pad)}${cmd.description}`)
	}
	return lines.join("\n")
}

export function spinner(message: string) {
	const frames = ["-", "\\", "|", "/"]
	let frame = 0
	let timer: ReturnType<typeof setInterval> | null = null

	return {
		start() {
			process.stdout.write(`  ${frames[0]} ${message}`)
			timer = setInterval(() => {
				frame = (frame + 1) % frames.length
				process.stdout.write(`\r  ${frames[frame]} ${message}`)
			}, 80)
		},
		stop(final?: string) {
			if (timer) clearInterval(timer)
			process.stdout.write(`\r  ${final ?? message}\n`)
		},
	}
}

export function createCli(config: CliConfig) {
	return async function run(argv: string[]) {
		const parsed = parseArgs(argv)
		const cmd = config.commands.find((c) => c.name === parsed.command)
		if (!cmd || parsed.command === "help") {
			console.log(formatHelp(config))
			return
		}
		await cmd.run(parsed.args)
	}
}
