import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const expressCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove mobile menu, overlay, navigation
  $("#mobile-menu, #overlay, #nav-button").remove();
  // Remove language switcher
  $(".desktop-lang-switcher").remove();
  // Remove header (footer/nav already removed by built-in cleanHtmlFilter)
  $("header").remove();
  // Remove table of contents sidebar
  $(".toc-container").remove();
};

const sharedExpressConfig = {
  container: ".content",
  skip: [
    "blog/",
    "support",
    "resources/community.html",
    "resources/contributing.html",
    "changelog/",
  ],
  concurrency: 5,
  customFilters: [expressCleanHtml],
} as const;

export const expressConfig5: ScraperConfig = {
  name: "express/5",
  version: "5.x",
  baseUrl: "https://expressjs.com/en/5x/api.html",
  ...sharedExpressConfig,
};

export const expressConfig4: ScraperConfig = {
  name: "express/4",
  version: "4.x",
  baseUrl: "https://expressjs.com/en/4x/api.html",
  ...sharedExpressConfig,
};
