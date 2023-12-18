import { LRUCache } from "lru-cache";

import { DEFAULT_CACHE_MAX } from "./constants";
import { SessionStore, SessionStoreItem } from "./types";

export function getLRUCacheStore(
  options?: LRUCache.Options<string, SessionStoreItem, unknown>
): SessionStore {
  const data = new LRUCache<string, SessionStoreItem>(
    options ?? { max: DEFAULT_CACHE_MAX }
  );

  return {
    get(id) {
      return data.get(id);
    },
    set(id, item) {
      data.set(id, item);
    },
    del(id) {
      data.delete(id);
    },
  };
}
