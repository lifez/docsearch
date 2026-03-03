import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const dockerCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove reading time indicators
  $("[class*='reading-time'], [class*='readingTime']").remove();
  // Remove anchor link icons (inline permalink elements)
  $("a.anchor, a[aria-label='anchor'], a[aria-label='link']").remove();
  // Remove empty columns/divs left by nav removal
  $("nav, aside").remove();
  // Remove feedback/rating sections
  $("[class*='feedback'], [class*='rating']").remove();
};

export const dockerConfig: ScraperConfig = {
  name: "docker/latest",
  version: "latest",
  baseUrl: "https://docs.docker.com/",
  container: "main",
  skip: [
    "release-notes/",
    "desktop/",
    "billing/",
    "subscription/",
    "admin/",
  ],
  concurrency: 3,
  customFilters: [dockerCleanHtml],
};
