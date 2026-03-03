import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const reactCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove navigation, header, footer, sidebar
  $("nav, header, footer, aside").remove();
  // Remove sandpack iframes (interactive code editors)
  $("iframe").remove();
  // Remove "canary" badges
  $("[class*='canary'], [class*='Badge']").remove();
  // Remove "Edit this page" links
  $("a[href*='github.com']").filter((_i, el) => {
    return $(el).text().toLowerCase().includes("edit");
  }).remove();
};

const sharedReactConfig = {
  container: "article",
  skip: ["blog/", "community/", "versions"],
  concurrency: 5,
  customFilters: [reactCleanHtml],
} as const;

export const reactConfig19: ScraperConfig = {
  name: "react/19",
  version: "19",
  baseUrl: "https://react.dev/",
  ...sharedReactConfig,
};

export const reactConfig18: ScraperConfig = {
  name: "react/18",
  version: "18",
  baseUrl: "https://18.react.dev/",
  ...sharedReactConfig,
};
