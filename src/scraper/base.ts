import { mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";
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

export async function scrape(config: ScraperConfig): Promise<void> {
  const requester = createRequester(config.concurrency);

  const filters = [
    containerFilter,
    internalUrlsFilter,    // discover links before any elements are removed
    cleanHtmlFilter,
    normalizeUrlsFilter,
    ...(config.customFilters ?? []),
    toMarkdownFilter,
  ];

  const docDir = getDocDir(config.name);
  rmSync(docDir, { recursive: true, force: true });

  const seedUrl = config.baseUrl;
  const queue: string[] = [seedUrl];
  const visited = new Set<string>([normalizeForDedup(seedUrl)]);

  while (queue.length > 0) {
    const batch = queue.splice(0, config.concurrency);

    const results = await Promise.allSettled(
      batch.map((url) => requester(url).then((html) => ({ url, html })))
    );

    for (const outcome of results) {
      if (outcome.status === "rejected") {
        log.error(`Fetch failed: ${outcome.reason}`);
        continue;
      }

      const { url, html } = outcome.value;
      visited.add(normalizeForDedup(url));

      const $ = load(html);
      const ctx = { url, baseUrl: config.baseUrl, config };
      const result = runPipeline($, ctx, filters);

      const h1 = $("h1").first().text().trim();
      const titleTag = $("title").text().trim();
      const title = h1 || titleTag || url;
      const markdown = result.markdown ?? "";

      if (config.splitConfig && markdown) {
        // Split into per-entry files under docs/<name>/<module>/
        const baseFilename = urlToFilename(config.baseUrl, url).replace(
          /\.md$/,
          ""
        );
        const moduleDir = docDir + "/" + baseFilename;
        mkdirSync(moduleDir, { recursive: true });

        const entries = splitMarkdown(markdown, config.splitConfig);
        for (const entry of entries) {
          // Ensure filename has alphanumeric content (qmd requires it)
          const safeAnchor = entry.anchor && /[a-z0-9]/i.test(entry.anchor)
            ? entry.anchor
            : entry.anchor?.replace(/-/g, "dash") || "";
          const entryFilename = safeAnchor
            ? safeAnchor + ".md"
            : "index.md";
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

          await Bun.write(moduleDir + "/" + entryFilename, fm + "\n" + entry.content);
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

        const filePath = docDir + "/" + urlToFilename(config.baseUrl, url);
        mkdirSync(dirname(filePath), { recursive: true });
        await Bun.write(filePath, frontmatter + "\n" + markdown);

        log.info(`[${visited.size}] ${url}`);
      }

      for (const internalUrl of result.internalUrls) {
        const deduped = normalizeForDedup(internalUrl);
        if (!visited.has(deduped)) {
          visited.add(deduped);
          queue.push(internalUrl);
        }
      }
    }
  }
}
