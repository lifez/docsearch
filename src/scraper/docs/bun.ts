import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const bunCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove prev/next navigation links at the bottom of each page
  $(".prev-next").remove();
  // Remove the breadcrumb nav
  $("nav[aria-label='breadcrumb']").remove();
};

export const bunConfig: ScraperConfig = {
  name: "bun/1",
  version: "1.x",
  baseUrl: "https://bun.sh/docs",
  container: "article",
  skip: [],
  concurrency: 5,
  customFilters: [bunCleanHtml],
};

export default bunConfig;
