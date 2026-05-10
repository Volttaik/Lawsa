const store = new Map<string, { value: any; exp: number }>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.exp) { store.delete(key); return null; }
    return entry.value as T;
  },
  set<T>(key: string, value: T, ttlSeconds = 60): void {
    store.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
  },
  invalidate(prefix: string): void {
    for (const key of store.keys()) { if (key.startsWith(prefix)) store.delete(key); }
  },
  del(key: string): void { store.delete(key); },
};
