import type { CheerioAPI } from "cheerio";

export interface SplitConfig {
  splitAtLevels: readonly number[];
  minContentLength: number;
}

export interface ScraperConfig {
  name: string;
  version: string;
  baseUrl: string;
  container: string;
  skip: readonly string[];
  concurrency: number;
  customFilters?: readonly FilterFn[];
  splitConfig?: SplitConfig;
}

export interface FilterContext {
  url: string;
  baseUrl: string;
  config: ScraperConfig;
}

export interface FilterResult {
  internalUrls: Set<string>;
  markdown?: string;
}

export type FilterFn = (doc: CheerioAPI, ctx: FilterContext, result: FilterResult) => void;

export function runPipeline(
  doc: CheerioAPI,
  ctx: FilterContext,
  filters: FilterFn[]
): FilterResult {
  const result: FilterResult = {
    internalUrls: new Set<string>(),
  };

  for (const filter of filters) {
    filter(doc, ctx, result);
  }

  return result;
}
