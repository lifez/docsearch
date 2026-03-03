#!/usr/bin/env bun
import { scrapeCommand } from "./commands/scrape.ts";
import { indexCommand } from "./commands/index.ts";
import { searchCommand } from "./commands/search.ts";
import { listCommand } from "./commands/list.ts";
import { readCommand } from "./commands/read.ts";
import { getCommand } from "./commands/get.ts";

const USAGE = `Usage:
  docsearch scrape <doc>         Scrape docs to markdown (e.g. node/22, nextjs/14)
  docsearch index <doc>          Index with qmd (e.g. node/22, bun/1)
  docsearch search <query>       Search indexed docs (-c node/22)
  docsearch get <docid>          Get full document by docid
  docsearch list                 List available docs and versions
  docsearch read <path>          Read a scraped doc (e.g. node/22, node/22/fs)
`;

const args = Bun.argv.slice(2);
const command = args[0];

switch (command) {
  case "scrape": {
    const doc = args[1];
    if (!doc) {
      process.stderr.write("Error: missing <doc> argument\n");
      process.exit(1);
    }
    await scrapeCommand(doc);
    break;
  }

  case "index": {
    const doc = args[1];
    if (!doc) {
      process.stderr.write("Error: missing <doc> argument\n");
      process.exit(1);
    }
    await indexCommand(doc);
    break;
  }

  case "search": {
    const query = args[1];
    if (!query) {
      process.stderr.write("Error: missing <query> argument\n");
      process.exit(1);
    }
    const remaining = args.slice(2);
    let collection: string | undefined;
    const flagIndex = remaining.indexOf("-c");
    if (flagIndex !== -1 && remaining[flagIndex + 1] !== undefined) {
      collection = remaining[flagIndex + 1];
    }
    await searchCommand(query, collection);
    break;
  }

  case "get": {
    const docid = args[1];
    if (!docid) {
      process.stderr.write("Error: missing <docid> argument\n");
      process.exit(1);
    }
    await getCommand(docid);
    break;
  }

  case "list": {
    await listCommand();
    break;
  }

  case "read": {
    const filePath = args[1];
    if (!filePath) {
      process.stderr.write("Error: missing <path> argument\n");
      process.exit(1);
    }
    await readCommand(filePath);
    break;
  }

  default: {
    process.stdout.write(USAGE);
    if (command !== undefined) {
      process.exit(1);
    }
    break;
  }
}
