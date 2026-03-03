import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const rustBookCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove sidebar toggle button
  $(".sidebar-toggle").remove();
  // Remove prev/next navigation buttons
  $(".nav-chapters, .mobile-nav-chapters").remove();
  // Remove search elements
  $("#searchresults, #search-wrapper").remove();
};

const rustStdCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove sidebar
  $(".sidebar").remove();
  // Remove source links
  $(".srclink, [id='source']").remove();
  // Convert code-header elements to preformatted text
  $("h3.code-header, h4.code-header").each((_i, el) => {
    const $el = $(el);
    $el.replaceWith($("<pre>").text($el.text()));
  });
};

export const rustBookConfig: ScraperConfig = {
  name: "rust-book/1",
  version: "1.x",
  baseUrl: "https://doc.rust-lang.org/book/",
  container: "#content",
  skip: ["print.html"],
  concurrency: 5,
  customFilters: [rustBookCleanHtml],
};

export const rustStdConfig: ScraperConfig = {
  name: "rust-std/1",
  version: "1.x",
  baseUrl: "https://doc.rust-lang.org/std/",
  container: "#main-content",
  skip: ["print.html"],
  concurrency: 5,
  customFilters: [rustStdCleanHtml],
};
