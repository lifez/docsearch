import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "../config.ts";

export async function readCommand(filePath: string): Promise<void> {
  const fullPath = path.join(DATA_DIR, filePath);
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    listDir(fullPath);
  } else {
    const contents = await Bun.file(fullPath).text();
    process.stdout.write(contents);
  }
}

function listDir(dir: string): void {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const stat = statSync(dir + "/" + entry);
    if (stat.isDirectory()) {
      process.stdout.write(entry + "/\n");
    } else if (entry.endsWith(".md")) {
      process.stdout.write(entry + "\n");
    }
  }
}
