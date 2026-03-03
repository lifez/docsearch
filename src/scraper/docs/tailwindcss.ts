import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const tailwindCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove sticky headers and fixed-position elements
  $("[class*='sticky'], [class*='fixed']").remove();
  // Remove sidebar navigation
  $("nav, aside").remove();
  // Remove "on this page" table of contents
  $("[class*='TableOfContents'], [class*='toc']").remove();
};

const sharedTailwindConfig = {
  container: "article",
  skip: [
    "installation",
    "editor-setup",
    "browser-support",
    "upgrade-guide",
  ],
  concurrency: 5,
  customFilters: [tailwindCleanHtml],
} as const;

export const tailwindConfig4: ScraperConfig = {
  name: "tailwindcss/4",
  version: "4",
  baseUrl: "https://tailwindcss.com/docs/installation/using-vite",
  container: "#content-wrapper",
  skip: sharedTailwindConfig.skip,
  concurrency: sharedTailwindConfig.concurrency,
  customFilters: sharedTailwindConfig.customFilters,
};

export const tailwindConfig3: ScraperConfig = {
  name: "tailwindcss/3",
  version: "3",
  baseUrl: "https://v3.tailwindcss.com/docs",
  ...sharedTailwindConfig,
};
