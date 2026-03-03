import { searchDocs } from "../indexer/qmd.ts";

export async function searchCommand(query: string, collection?: string): Promise<void> {
  await searchDocs(query, collection);
}
