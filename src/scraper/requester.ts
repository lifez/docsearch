import pLimit from "p-limit";
import type { CacheEntry } from "./cache.ts";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchResult {
  html: string;
  etag?: string;
  lastModified?: string;
}

export function createRequester(concurrency: number = 10) {
  const limit = pLimit(concurrency);

  async function fetchWithRetry(
    url: string,
    cacheEntry?: CacheEntry
  ): Promise<FetchResult | null> {
    const delays = [1000, 2000, 4000];
    let lastError: unknown;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const headers: Record<string, string> = {};
        if (cacheEntry?.etag) {
          headers["If-None-Match"] = cacheEntry.etag;
        }
        if (cacheEntry?.lastModified) {
          headers["If-Modified-Since"] = cacheEntry.lastModified;
        }

        const response = await fetch(url, { headers });

        if (response.status === 304) {
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        return {
          html: await response.text(),
          etag: response.headers.get("etag") ?? undefined,
          lastModified: response.headers.get("last-modified") ?? undefined,
        };
      } catch (error) {
        lastError = error;
        if (attempt < delays.length) {
          await sleep(delays[attempt]!);
        }
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Failed to fetch ${url}: ${message}`);
  }

  return (url: string, cacheEntry?: CacheEntry): Promise<FetchResult | null> =>
    limit(() => fetchWithRetry(url, cacheEntry));
}
