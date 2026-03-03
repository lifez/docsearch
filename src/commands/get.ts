import { getDoc } from "../indexer/qmd.ts";

export async function getCommand(docid: string): Promise<void> {
  await getDoc(docid);
}
