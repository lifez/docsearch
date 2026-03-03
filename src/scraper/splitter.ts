import type { SplitConfig } from "./pipeline.ts";

export interface SplitEntry {
  title: string;
  anchor: string;
  content: string;
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const ANCHOR_LINK_RE = /\s*\[#\]\([^)]*#([^)]+)\)\s*$/;

function extractAnchor(headingText: string): string {
  const match = headingText.match(ANCHOR_LINK_RE);
  if (match) return match[1]!;
  // Fallback: slugify the title
  return headingText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanTitle(headingText: string): string {
  return headingText.replace(ANCHOR_LINK_RE, "").trim();
}

export function splitMarkdown(
  markdown: string,
  config: SplitConfig
): SplitEntry[] {
  const lines = markdown.split("\n");
  const entries: SplitEntry[] = [];

  let currentTitle = "";
  let currentAnchor = "";
  let currentLines: string[] = [];

  function flush() {
    const content = currentLines.join("\n").trim();
    if (currentTitle || content) {
      entries.push({
        title: currentTitle,
        anchor: currentAnchor,
        content,
      });
    }
  }

  for (const line of lines) {
    const match = line.match(HEADING_RE);
    if (!match) {
      currentLines.push(line);
      continue;
    }

    const level = match[1]!.length;
    const headingText = match[2]!;

    if (config.splitAtLevels.includes(level)) {
      flush();
      currentTitle = cleanTitle(headingText);
      currentAnchor = extractAnchor(headingText);
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  flush();

  // Fold entries that are too short into the previous entry
  if (config.minContentLength > 0) {
    const folded: SplitEntry[] = [];
    for (const entry of entries) {
      if (
        folded.length > 0 &&
        entry.title &&
        entry.content.length < config.minContentLength
      ) {
        folded[folded.length - 1]!.content += "\n\n" + entry.content;
      } else {
        folded.push(entry);
      }
    }
    return folded;
  }

  return entries;
}
