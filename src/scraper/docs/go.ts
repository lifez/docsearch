import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const goCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove breadcrumb navigation
  $(".Breadcrumb, nav[aria-label='Breadcrumb']").remove();
  // Remove jump-to navigation
  $(".Documentation-nav, .DocNav").remove();
  // Remove source links
  $("a[href*='/src/']").remove();
  // Remove "Jump to" sections
  $(".Documentation-index").remove();
};

export const goConfig: ScraperConfig = {
  name: "go/1",
  version: "1.x",
  baseUrl: "https://pkg.go.dev/std",
  container: "#main-content",
  skip: ["internal/", "vendor/"],
  concurrency: 3,
  customFilters: [goCleanHtml],
};
