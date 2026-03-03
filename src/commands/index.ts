import { indexDoc } from "../indexer/qmd.ts";
import { getDocDir } from "../config.ts";
import { DOCS, docNames } from "../scraper/docs/registry.ts";
import { log } from "../utils/logger.ts";

export async function indexCommand(docName: string): Promise<void> {
  const entry = DOCS[docName];

  if (!entry) {
    log.error(`Unknown doc: ${docName}. Available: ${docNames}`);
    process.exit(1);
  }

  await indexDoc(docName, getDocDir(docName), entry.description);
}
