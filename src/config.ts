import * as path from "node:path";
import * as os from "node:os";

const dataHome = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
export const DATA_DIR = path.join(dataHome, "docsearch", "docs");

export function getDocDir(name: string): string {
  return path.join(DATA_DIR, name);
}
