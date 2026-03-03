import * as path from "node:path";

export const DATA_DIR = path.join(import.meta.dir, "..", "docs");

export function getDocDir(name: string): string {
  return path.join(DATA_DIR, name);
}
