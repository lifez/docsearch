import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const apolloServerCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove sidebar navigation
  $(".sidebar-container").remove();
  // Remove header (footer/nav already removed by built-in cleanHtmlFilter)
  $("header").remove();
  // Remove "Edit on GitHub" links
  $("a[href*='github.com']")
    .filter((_i, el) => $(el).text().toLowerCase().includes("edit"))
    .remove();
  // Remove version dropdown
  $("#menu-button").closest(".relative").remove();
  // Remove breadcrumb navigation
  $("[class*='breadcrumb']").remove();
};

export const apolloServerConfig4: ScraperConfig = {
  name: "apollo-server/4",
  version: "4.x",
  baseUrl: "https://www.apollographql.com/docs/apollo-server",
  container: "article",
  skip: [
    "v2/",
    "v3/",
    "previous-versions",
  ],
  concurrency: 5,
  customFilters: [apolloServerCleanHtml],
};
