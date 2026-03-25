interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private store = new Map<string, CacheEntry<unknown>>();

    set<T>(key: string, data: T, ttlSeconds = 60): void {
        this.store.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds * 1000 });
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.store.delete(key);
            return null;
        }
        return entry.data;
    }

    invalidate(pattern: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(pattern)) this.store.delete(key);
        }
    }

    clear(): void {
        this.store.clear();
    }
}

export const cache = new MemoryCache();

export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 60
): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    cache.set(key, data, ttlSeconds);
    return data;
}
