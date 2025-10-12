import { useSWRConfig } from "swr";

type SWRCacheControl<T = unknown> = {
  /** Get cached data for the given key */
  getCache: (key: string) => T | undefined;

  /** Manually store data in the cache */
  setCache: (key: string, data: T) => void;

  /** Remove cached data for the given key */
  resetCache: (key: string) => void;
};

/**
 * Universal SWR cache hook.
 * Allows manual get/set/reset of cached data for any key,
 * using the existing SWR provider.
 */
export function useSWRCache<T = unknown>(): SWRCacheControl<T> {
  const { cache, mutate } = useSWRConfig();

  const getCache = (key: string) => {
    return cache.get(key)?.data as T | undefined;
  };

  const setCache = (key: string, data: T) => {
    mutate(key, data, { revalidate: false, populateCache: true });
  };

  const resetCache = (key: string) => {
    cache.delete(key);
  };

  return {
    getCache,
    setCache,
    resetCache,
  };
}
