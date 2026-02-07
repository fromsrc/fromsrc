export type CacheEntry<T> = { value: T; expires: number; key: string }
export type CacheConfig = { maxSize?: number; ttl?: number; onEvict?: (key: string) => void }
export type CacheStats = { hits: number; misses: number; size: number; evictions: number }

export function createCache<T>(config?: CacheConfig) {
	const maxSize = config?.maxSize ?? 1000
	const defaultTtl = config?.ttl ?? 300000
	const onEvict = config?.onEvict
	const store = new Map<string, CacheEntry<T>>()
	let hits = 0
	let misses = 0
	let evictions = 0

	function isExpired(entry: CacheEntry<T>) {
		return Date.now() > entry.expires
	}

	function evictOldest() {
		const oldest = store.keys().next().value!
		store.delete(oldest)
		evictions++
		onEvict?.(oldest)
	}

	function get(key: string): T | undefined {
		const entry = store.get(key)
		if (!entry) {
			misses++
			return undefined
		}
		if (isExpired(entry)) {
			store.delete(key)
			misses++
			return undefined
		}
		hits++
		store.delete(key)
		store.set(key, entry)
		return entry.value
	}

	function set(key: string, value: T, ttl?: number): void {
		store.delete(key)
		if (store.size >= maxSize) {
			evictOldest()
		}
		store.set(key, { value, expires: Date.now() + (ttl ?? defaultTtl), key })
	}

	function has(key: string): boolean {
		const entry = store.get(key)
		if (!entry) return false
		if (isExpired(entry)) {
			store.delete(key)
			return false
		}
		return true
	}

	function del(key: string): boolean {
		return store.delete(key)
	}

	function clear(): void {
		store.clear()
	}

	function stats(): CacheStats {
		return { hits, misses, size: store.size, evictions }
	}

	function keys(): string[] {
		return [...store.keys()]
	}

	function prune(): number {
		let count = 0
		for (const [key, entry] of store) {
			if (isExpired(entry)) {
				store.delete(key)
				count++
			}
		}
		return count
	}

	return { get, set, has, delete: del, clear, stats, keys, prune }
}
