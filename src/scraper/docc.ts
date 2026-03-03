import { mkdirSync, rmSync } from "node:fs";
import { getDocDir } from "../config.ts";
import { log } from "../utils/logger.ts";
import { createRequester } from "./requester.ts";
import type { ScraperConfig } from "./pipeline.ts";

// --- DocC JSON types ---

interface DoccInline {
  type: string;
  text?: string;
  code?: string;
  identifier?: string;
  inlineContent?: DoccInline[];
}

interface DoccContent {
  type: string;
  inlineContent?: DoccInline[];
  code?: string[];
  syntax?: string;
  anchor?: string;
  level?: number;
  text?: string;
  content?: DoccContent[];
  items?: { content: DoccContent[] }[];
  name?: string;
  header?: string;
  rows?: DoccContent[][];
  extendedData?: DoccContent[][];
  cells?: DoccContent[];
}

interface DoccSection {
  kind: string;
  content?: DoccContent[];
}

interface DoccReference {
  title?: string;
  url?: string;
  type?: string;
  identifier?: string;
}

interface DoccPage {
  metadata?: { title?: string };
  primaryContentSections?: DoccSection[];
  topicSections?: { title: string; identifiers: string[] }[];
  references?: Record<string, DoccReference>;
  identifier?: { url?: string };
}

// --- Rendering ---

function renderInline(node: DoccInline, refs: Record<string, DoccReference>): string {
  switch (node.type) {
    case "text":
      return node.text ?? "";
    case "codeVoice":
      return `\`${node.code ?? ""}\``;
    case "emphasis":
      return `*${(node.inlineContent ?? []).map((n) => renderInline(n, refs)).join("")}*`;
    case "strong":
      return `**${(node.inlineContent ?? []).map((n) => renderInline(n, refs)).join("")}**`;
    case "reference": {
      const ref = node.identifier ? refs[node.identifier] : undefined;
      const title = ref?.title ?? node.identifier ?? "";
      return title;
    }
    case "newTerm":
      return `*${(node.inlineContent ?? []).map((n) => renderInline(n, refs)).join("")}*`;
    default:
      if (node.inlineContent) {
        return node.inlineContent.map((n) => renderInline(n, refs)).join("");
      }
      return node.text ?? "";
  }
}

function renderContent(block: DoccContent, refs: Record<string, DoccReference>): string {
  switch (block.type) {
    case "paragraph":
      return (block.inlineContent ?? []).map((n) => renderInline(n, refs)).join("") + "\n";
    case "codeListing": {
      const lang = block.syntax ?? "";
      const code = (block.code ?? []).join("\n");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }
    case "heading": {
      const prefix = "#".repeat(block.level ?? 2);
      return `${prefix} ${block.text ?? ""}\n`;
    }
    case "aside":
    case "note": {
      const label = block.name ?? "Note";
      const body = (block.content ?? []).map((c) => renderContent(c, refs)).join("\n");
      return `> **${label}:** ${body.trim()}\n`;
    }
    case "unorderedList":
      return (block.items ?? [])
        .map((item) => {
          const content = item.content.map((c) => renderContent(c, refs)).join("").trim();
          return `- ${content}`;
        })
        .join("\n") + "\n";
    case "orderedList":
      return (block.items ?? [])
        .map((item, i) => {
          const content = item.content.map((c) => renderContent(c, refs)).join("").trim();
          return `${i + 1}. ${content}`;
        })
        .join("\n") + "\n";
    case "table": {
      const rows = block.rows ?? block.extendedData ?? [];
      if (rows.length === 0) return "";
      return rows
        .map((row, ri) => {
          const cells = (row as unknown as DoccContent[]).map(
            (cell) => (cell.content ?? cell.cells ?? []).map((c) => renderContent(c, refs)).join("").trim()
          );
          const line = "| " + cells.join(" | ") + " |";
          if (ri === 0) {
            return line + "\n| " + cells.map(() => "---").join(" | ") + " |";
          }
          return line;
        })
        .join("\n") + "\n";
    }
    default:
      if (block.content) {
        return block.content.map((c) => renderContent(c, refs)).join("\n");
      }
      return "";
  }
}

function doccToMarkdown(page: DoccPage): string {
  const refs = page.references ?? {};
  const parts: string[] = [];

  for (const section of page.primaryContentSections ?? []) {
    if (section.content) {
      for (const block of section.content) {
        parts.push(renderContent(block, refs));
      }
    }
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// --- Scraper ---

export interface DoccConfig {
  scraperConfig: ScraperConfig;
  indexUrl: string;
  dataBaseUrl: string;
  topicPrefix: string;
  /** When true, recursively discover subtopics from fetched pages */
  recursive?: boolean;
  /** Max depth for recursive crawling (0 = index only, default unlimited) */
  maxDepth?: number;
  /** Only follow topic identifiers containing this prefix */
  identifierFilter?: string;
}

function collectTopicIds(page: DoccPage): string[] {
  const ids: string[] = [];
  for (const section of page.topicSections ?? []) {
    for (const id of section.identifiers) {
      ids.push(id);
    }
  }
  return ids;
}

function shouldEnqueue(id: string, visited: Set<string>, identifierFilter?: string): boolean {
  if (visited.has(id)) return false;
  if (identifierFilter && !id.includes(identifierFilter)) return false;
  return true;
}

export async function scrapeDocc(doccConfig: DoccConfig): Promise<void> {
  const { scraperConfig, indexUrl, dataBaseUrl, topicPrefix, recursive, maxDepth, identifierFilter } = doccConfig;
  const requester = createRequester(scraperConfig.concurrency);
  const docDir = getDocDir(scraperConfig.name);
  rmSync(docDir, { recursive: true, force: true });
  mkdirSync(docDir, { recursive: true });

  // Fetch index to discover all topic URLs
  const indexJson = await requester(indexUrl);
  const index: DoccPage = JSON.parse(indexJson);

  const topicIds = collectTopicIds(index);
  log.info(`Discovered ${topicIds.length} topics`);

  // Queue entries track depth for recursive crawling
  const queue: { id: string; depth: number }[] = [];
  const visited = new Set<string>();

  for (const id of topicIds) {
    if (shouldEnqueue(id, visited, identifierFilter)) {
      visited.add(id);
      queue.push({ id, depth: 1 });
    }
  }

  let count = 0;

  while (queue.length > 0) {
    const batch = queue.splice(0, scraperConfig.concurrency);

    const results = await Promise.allSettled(
      batch.map(async (entry) => {
        // Extract the topic slug from after the topicPrefix
        const slug = entry.id.split(topicPrefix).pop()?.replace(/^\//, "") ?? "";
        if (!slug) return null;

        const lowerSlug = slug.toLowerCase();
        const jsonUrl = `${dataBaseUrl}/${lowerSlug}.json`;
        const json = await requester(jsonUrl);
        const page: DoccPage = JSON.parse(json);

        const title = page.metadata?.title ?? slug;
        const markdown = doccToMarkdown(page);
        const sourceUrl = `${scraperConfig.baseUrl}/${lowerSlug}`;

        // Collect subtopics for recursive crawling
        let subtopicIds: string[] = [];
        if (recursive && (maxDepth === undefined || entry.depth < maxDepth)) {
          subtopicIds = collectTopicIds(page);
        }

        return { lowerSlug, title, markdown, sourceUrl, subtopicIds, depth: entry.depth };
      })
    );

    for (const outcome of results) {
      if (outcome.status === "rejected") {
        log.error(`Fetch failed: ${outcome.reason}`);
        continue;
      }
      const result = outcome.value;
      if (!result || !result.markdown) continue;

      // Enqueue discovered subtopics
      if (recursive && result.subtopicIds.length > 0) {
        for (const id of result.subtopicIds) {
          if (shouldEnqueue(id, visited, identifierFilter)) {
            visited.add(id);
            queue.push({ id, depth: result.depth + 1 });
          }
        }
      }

      count++;
      const safeTitle = result.title.replace(/'/g, "''");
      const frontmatter =
        `---\n` +
        `title: '${safeTitle}'\n` +
        `source: ${result.sourceUrl}\n` +
        `doc: ${scraperConfig.name}\n` +
        `version: ${scraperConfig.version}\n` +
        `---`;

      const filePath = `${docDir}/${result.lowerSlug}.md`;
      const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
      mkdirSync(dirPath, { recursive: true });
      await Bun.write(filePath, frontmatter + "\n" + result.markdown);
      log.info(`[${count}] ${result.title}`);
    }
  }

  log.info(`Done: ${count} pages scraped`);
}
