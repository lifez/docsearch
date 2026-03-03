import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const nextjsCleanHtml: FilterFn = ($, _ctx, _result) => {
  $("nav").remove();
  $("header").remove();
  $("footer").remove();
  $(".sticky").remove();
};

export const nextjsConfig14: ScraperConfig = {
  name: "nextjs/14",
  version: "14.x",
  baseUrl: "https://nextjs.org/docs/14/",
  container: "article",
  skip: [],
  concurrency: 5,
  customFilters: [nextjsCleanHtml],
};

export const nextjsConfig16: ScraperConfig = {
  name: "nextjs/16",
  version: "16.x",
  baseUrl: "https://nextjs.org/docs/",
  container: "article",
  skip: ["/docs/14/"],
  concurrency: 5,
  customFilters: [nextjsCleanHtml],
};
