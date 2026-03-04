import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const CACHE_FILENAME = ".scraped-cache.json";

export interface CacheEntry {
  etag?: string;
  lastModified?: string;
  discoveredUrls?: string[];
}

export type ScrapeCache = Record<string, CacheEntry>;

export function loadCache(docDir: string): ScrapeCache {
  try {
    const raw = readFileSync(join(docDir, CACHE_FILENAME), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveCache(docDir: string, cache: ScrapeCache): void {
  mkdirSync(docDir, { recursive: true });
  writeFileSync(join(docDir, CACHE_FILENAME), JSON.stringify(cache, null, 2));
}
