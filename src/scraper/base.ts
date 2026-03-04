import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { load } from "cheerio";
import { getDocDir } from "../config.ts";
import { normalizeForDedup, urlToFilename } from "../utils/url.ts";
import { log } from "../utils/logger.ts";
import { createRequester } from "./requester.ts";
import { runPipeline, type ScraperConfig } from "./pipeline.ts";
import { containerFilter } from "./filters/container.ts";
import { cleanHtmlFilter } from "./filters/clean-html.ts";
import { normalizeUrlsFilter } from "./filters/normalize-urls.ts";
import { internalUrlsFilter } from "./filters/internal-urls.ts";
import { toMarkdownFilter } from "./filters/to-markdown.ts";
import { splitMarkdown } from "./splitter.ts";
import { loadCache, saveCache, type ScrapeCache } from "./cache.ts";

export interface ScrapeOptions {
  force?: boolean;
}

export async function scrape(
  config: ScraperConfig,
  options: ScrapeOptions = {}
): Promise<void> {
  const requester = createRequester(config.concurrency);

  const filters = [
    containerFilter,
    internalUrlsFilter, // discover links before any elements are removed
    cleanHtmlFilter,
    normalizeUrlsFilter,
    ...(config.customFilters ?? []),
    toMarkdownFilter,
  ];

  const docDir = getDocDir(config.name);

  // Load cache for incremental scraping, or start fresh on --force
  let cache: ScrapeCache = {};

  if (options.force) {
    rmSync(docDir, { recursive: true, force: true });
    log.info("Force mode: full re-scrape");
  } else if (existsSync(docDir)) {
    cache = loadCache(docDir);
    const cacheSize = Object.keys(cache).length;
    if (cacheSize > 0) {
      log.info(`Incremental scrape: ${cacheSize} cached pages (use --force for full re-scrape)`);
    }
  }

  const seedUrl = config.baseUrl;
  const queue: string[] = [seedUrl];
  const visited = new Set<string>([normalizeForDedup(seedUrl)]);
  const newCache: ScrapeCache = {};
  let skipped = 0;

  while (queue.length > 0) {
    const batch = queue.splice(0, config.concurrency);

    const results = await Promise.allSettled(
      batch.map((url) => {
        const cacheEntry = cache[url];
        return requester(url, cacheEntry).then((fetchResult) => ({
          url,
          fetchResult,
        }));
      })
    );

    for (const outcome of results) {
      if (outcome.status === "rejected") {
        log.error(`Fetch failed: ${outcome.reason}`);
        continue;
      }

      const { url, fetchResult } = outcome.value;
      visited.add(normalizeForDedup(url));

      // 304 Not Modified — skip processing, replay discovered URLs from cache
      if (fetchResult === null) {
        const cached = cache[url];
        if (cached) {
          // Safety check: if the output file was deleted, re-fetch without cache
          const filename = urlToFilename(config.baseUrl, url);
          const fileExists = config.splitConfig
            ? existsSync(join(docDir, filename.replace(/\.md$/, "")))
            : existsSync(join(docDir, filename));

          if (!fileExists) {
            // File was deleted — re-fetch without conditional headers
            log.info(`[cache miss] ${url} (file missing, re-fetching)`);
            queue.push(url);
            visited.delete(normalizeForDedup(url));
            delete cache[url];
            continue;
          }

          // Carry forward cache entry
          newCache[url] = cached;

          // Seed queue with previously discovered URLs
          if (cached.discoveredUrls) {
            for (const discoveredUrl of cached.discoveredUrls) {
              const deduped = normalizeForDedup(discoveredUrl);
              if (!visited.has(deduped)) {
                visited.add(deduped);
                queue.push(discoveredUrl);
              }
            }
          }

          skipped++;
          log.info(`[304] ${url}`);
        } else {
          log.warn(`[304 orphan] ${url} (no cache entry, skipping)`);
        }
        continue;
      }

      // 200 — process normally
      const { html, etag, lastModified } = fetchResult;
      const $ = load(html);
      const ctx = { url, baseUrl: config.baseUrl, config };
      const result = runPipeline($, ctx, filters);

      const h1 = $("h1").first().text().trim();
      const titleTag = $("title").text().trim();
      const title = h1 || titleTag || url;
      const markdown = result.markdown ?? "";

      if (config.splitConfig && markdown) {
        const baseFilename = urlToFilename(config.baseUrl, url).replace(/\.md$/, "");
        const moduleDir = join(docDir, baseFilename);
        mkdirSync(moduleDir, { recursive: true });

        const entries = splitMarkdown(markdown, config.splitConfig);
        for (const entry of entries) {
          const safeAnchor =
            entry.anchor && /[a-z0-9]/i.test(entry.anchor)
              ? entry.anchor
              : entry.anchor?.replace(/-/g, "dash") || "";
          const entryFilename = safeAnchor ? safeAnchor + ".md" : "index.md";
          const entryTitle = entry.title || title;
          const source = entry.anchor ? `${url}#${entry.anchor}` : url;

          const safeTitle = entryTitle.replace(/'/g, "''");
          const fm =
            `---\n` +
            `title: '${safeTitle}'\n` +
            `source: ${source}\n` +
            `doc: ${config.name}\n` +
            `version: ${config.version}\n` +
            `---`;

          await Bun.write(join(moduleDir, entryFilename), fm + "\n" + entry.content);
        }

        log.info(`[${visited.size}] ${url} → ${entries.length} entries`);
      } else {
        const safeTitle = title.replace(/'/g, "''");
        const frontmatter =
          `---\n` +
          `title: '${safeTitle}'\n` +
          `source: ${url}\n` +
          `doc: ${config.name}\n` +
          `version: ${config.version}\n` +
          `---`;

        const filePath = join(docDir, urlToFilename(config.baseUrl, url));
        mkdirSync(dirname(filePath), { recursive: true });
        await Bun.write(filePath, frontmatter + "\n" + markdown);

        log.info(`[${visited.size}] ${url}`);
      }

      // Update cache with new headers and discovered URLs — single pass over internalUrls
      const discoveredUrls: string[] = [];
      for (const internalUrl of result.internalUrls) {
        discoveredUrls.push(internalUrl);
        const deduped = normalizeForDedup(internalUrl);
        if (!visited.has(deduped)) {
          visited.add(deduped);
          queue.push(internalUrl);
        }
      }
      newCache[url] = { etag, lastModified, discoveredUrls };
    }
  }

  // Save cache for next incremental run
  saveCache(docDir, newCache);

  if (skipped > 0) {
    log.info(`Skipped ${skipped} unchanged pages (304)`);
  }
}
