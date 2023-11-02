import type { CacheEntry, CachifiedOptions } from "cachified";

import { cachified as baseCachified, lruCacheAdapter } from "cachified";
import { LRUCache } from "lru-cache";
const lru = new LRUCache<string, CacheEntry>({ max: 1000 });
export function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, "cache">
) {
  return baseCachified({
    cache: lruCacheAdapter(lru),
    ...options
  });
}
