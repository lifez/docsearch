import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCache, saveCache, type ScrapeCache } from "./cache.ts";

const TEST_DIR = join(import.meta.dir, "__test_cache__");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("loadCache", () => {
  test("returns empty object when cache file does not exist", () => {
    const cache = loadCache(TEST_DIR + "/nonexistent");
    expect(cache).toEqual({});
  });

  test("returns empty object when cache file is corrupt JSON", () => {
    writeFileSync(join(TEST_DIR, ".scraped-cache.json"), "not valid json{{{");
    const cache = loadCache(TEST_DIR);
    expect(cache).toEqual({});
  });

  test("returns parsed cache when file is valid JSON", () => {
    const data: ScrapeCache = {
      "https://example.com/page": {
        etag: '"abc123"',
        lastModified: "Wed, 05 Mar 2026 10:00:00 GMT",
        discoveredUrls: ["https://example.com/other"],
      },
    };
    writeFileSync(
      join(TEST_DIR, ".scraped-cache.json"),
      JSON.stringify(data)
    );
    const cache = loadCache(TEST_DIR);
    expect(cache).toEqual(data);
  });
});

describe("saveCache", () => {
  test("writes cache to .scraped-cache.json", () => {
    const data: ScrapeCache = {
      "https://example.com/page": {
        etag: '"xyz"',
        discoveredUrls: ["https://example.com/a", "https://example.com/b"],
      },
    };
    saveCache(TEST_DIR, data);
    const raw = readFileSync(join(TEST_DIR, ".scraped-cache.json"), "utf-8");
    expect(JSON.parse(raw)).toEqual(data);
  });

  test("creates directory if it does not exist", () => {
    const nestedDir = join(TEST_DIR, "nested", "dir");
    saveCache(nestedDir, { "https://example.com": {} });
    const raw = readFileSync(join(nestedDir, ".scraped-cache.json"), "utf-8");
    expect(JSON.parse(raw)).toEqual({ "https://example.com": {} });
  });
});
