import { existsSync } from "node:fs";
import { getDocDir } from "../config.ts";
import { DOCS } from "../scraper/docs/registry.ts";

export async function listCommand(): Promise<void> {
  for (const [name, { config, description }] of Object.entries(DOCS)) {
    const scraped = existsSync(getDocDir(name));
    const status = scraped ? "[scraped]" : "[not scraped]";
    process.stdout.write(`${name}  ${config.baseUrl}  ${description}  ${status}\n`);
  }
}
