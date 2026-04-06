/** Single entry stored in the content cache */
export interface CacheEntry<T> {
  value: T;
  expires: number;
  key: string;
}
/** Configuration for the LRU content cache */
export interface CacheConfig {
  maxSize?: number;
  ttl?: number;
  onEvict?: (key: string) => void;
}
/** Cache performance statistics */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

/** Create an LRU cache with TTL expiration and size limits */
export function createCache<T>(config?: CacheConfig) {
  const maxSize = config?.maxSize ?? 1000;
  const defaultTtl = config?.ttl ?? 300_000;
  const onEvict = config?.onEvict;
  const store = new Map<string, CacheEntry<T>>();
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  function isExpired(entry: CacheEntry<T>) {
    return Date.now() > entry.expires;
  }

  function evictOldest() {
    const oldest = store.keys().next().value;
    if (!oldest) {
      return;
    }
    store.delete(oldest);
    evictions++;
    onEvict?.(oldest);
  }

  function get(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) {
      misses++;
      return undefined;
    }
    if (isExpired(entry)) {
      store.delete(key);
      misses++;
      return undefined;
    }
    hits++;
    store.delete(key);
    store.set(key, entry);
    return entry.value;
  }

  function set(key: string, value: T, ttl?: number): void {
    store.delete(key);
    if (store.size >= maxSize) {
      evictOldest();
    }
    store.set(key, { expires: Date.now() + (ttl ?? defaultTtl), key, value });
  }

  function has(key: string): boolean {
    const entry = store.get(key);
    if (!entry) {
      return false;
    }
    if (isExpired(entry)) {
      store.delete(key);
      return false;
    }
    return true;
  }

  function del(key: string): boolean {
    return store.delete(key);
  }

  function clear(): void {
    store.clear();
  }

  function stats(): CacheStats {
    return { evictions, hits, misses, size: store.size };
  }

  function keys(): string[] {
    return [...store.keys()];
  }

  function prune(): number {
    let count = 0;
    for (const [key, entry] of store) {
      if (isExpired(entry)) {
        store.delete(key);
        count++;
      }
    }
    return count;
  }

  return { clear, delete: del, get, has, keys, prune, set, stats };
}
