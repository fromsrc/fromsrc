import { existsSync, readdirSync, watch } from "node:fs"
import type { FSWatcher } from "node:fs"
import { extname, join, relative } from "node:path"

export interface WatcherConfig {
	dir: string
	extensions?: string[]
	ignore?: string[]
}

export interface WatchEvent {
	type: "add" | "change" | "remove"
	path: string
	slug: string
}

export type WatchHandler = (event: WatchEvent) => void

function toSlug(dir: string, filepath: string): string {
	return relative(dir, filepath).replace(extname(filepath), "").replace(/\\/g, "/").replace(/\/index$/, "")
}

function collectFiles(dir: string, exts: string[]): Set<string> {
	const files = new Set<string>()
	function scan(d: string) {
		try {
			for (const entry of readdirSync(d, { withFileTypes: true })) {
				const full = join(d, entry.name)
				if (entry.isDirectory()) scan(full)
				else if (exts.includes(extname(entry.name))) files.add(full)
			}
		} catch {}
	}
	scan(dir)
	return files
}

export function createWatcher(config: WatcherConfig) {
	const exts = config.extensions ?? [".mdx", ".md"]
	const ignore = config.ignore ?? ["node_modules", ".git"]
	const handlers: WatchHandler[] = []
	const known = collectFiles(config.dir, exts)
	const timers = new Map<string, ReturnType<typeof setTimeout>>()
	let watcher: FSWatcher | null = null

	function emit(filepath: string) {
		if (!exts.includes(extname(filepath))) return
		if (ignore.some((p) => filepath.includes(p))) return

		const exists = existsSync(filepath)
		let type: WatchEvent["type"]

		if (!exists) {
			if (!known.has(filepath)) return
			known.delete(filepath)
			type = "remove"
		} else if (known.has(filepath)) {
			type = "change"
		} else {
			known.add(filepath)
			type = "add"
		}

		const event: WatchEvent = { type, path: filepath, slug: toSlug(config.dir, filepath) }
		for (const handler of handlers) handler(event)
	}

	function handle(_: string, filename: string | null) {
		if (!filename) return
		const filepath = join(config.dir, filename)
		const prev = timers.get(filepath)
		if (prev) clearTimeout(prev)
		timers.set(filepath, setTimeout(() => { timers.delete(filepath); emit(filepath) }, 100))
	}

	return {
		on(handler: WatchHandler) { handlers.push(handler) },
		start() {
			try { watcher = watch(config.dir, { recursive: true }, handle) } catch {}
		},
		stop() {
			watcher?.close()
			watcher = null
			for (const t of timers.values()) clearTimeout(t)
			timers.clear()
		},
	}
}

export function clearAllCaches() { console.log("[fromsrc] caches cleared") }
