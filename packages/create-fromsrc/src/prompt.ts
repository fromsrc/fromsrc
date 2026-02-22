import { createInterface } from "node:readline"

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.on("close", () => {
	process.exit(0)
})

export function ask(question: string, fallback: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(`${question} (${fallback}): `, (answer) => {
			resolve(answer.trim() || fallback)
		})
	})
}

export function select<T extends string>(
	question: string,
	options: readonly T[],
	fallback: number,
): Promise<T> {
	return new Promise((resolve) => {
		console.log(`\n${question}`)
		for (let i = 0; i < options.length; i++) {
			const marker = i === fallback ? ">" : " "
			console.log(`  ${marker} ${i + 1}. ${options[i]}`)
		}
		rl.question(`choose (${fallback + 1}): `, (answer) => {
			const index = Number.parseInt(answer.trim()) - 1
			if (index >= 0 && index < options.length) {
				resolve(options[index]!)
			} else {
				resolve(options[fallback]!)
			}
		})
	})
}

export function close() {
	rl.close()
}
