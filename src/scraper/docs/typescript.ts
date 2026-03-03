import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const typescriptCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove sidebar navigation
  $("nav, aside, .sidebar").remove();
  // Fix code block language classes: tsx → typescript
  $("code.tsx, pre code.tsx").each((_i, el) => {
    $(el).removeClass("tsx").addClass("typescript");
  });
  // Remove "on this page" nav
  $("[class*='toc'], [id*='toc']").remove();
};

export const typescriptConfig5: ScraperConfig = {
  name: "typescript/5",
  version: "5.x",
  baseUrl: "https://www.typescriptlang.org/docs/",
  container: "#handbook-content",
  skip: [
    "branding/",
    "community/",
    "tools/",
    "play/",
    "release-notes/",
    "download",
  ],
  concurrency: 5,
  customFilters: [typescriptCleanHtml],
};
