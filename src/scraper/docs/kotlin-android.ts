import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const kotlinAndroidCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove devsite navigation elements
  $("nav, .devsite-nav, .devsite-book-nav").remove();
  // Remove header/banner
  $("banner, .devsite-header, .devsite-top-banner").remove();
  // Remove breadcrumbs
  $(".devsite-breadcrumb-list, .breadcrumb").remove();
  // Remove table of contents sidebar
  $(".devsite-toc, .devsite-page-nav").remove();
  // Remove footer elements
  $(".devsite-footer-promos, .devsite-footer-linkboxes").remove();
  $(".devsite-footer-sites, .devsite-footer-utility-links").remove();
  // Remove "Was this helpful?" feedback widgets
  $(".devsite-thumbs, .devsite-feedback").remove();
  // Remove cookie consent and banners
  $(".devsite-snackbar, .devsite-banner").remove();
  // Remove all devsite custom web components (bookmark, collections, hats, etc.)
  $("[class*='devsite-collections'], [class*='devsite-dialog']").remove();
  $("devsite-bookmark, devsite-collections-dropdown, devsite-hats-survey").remove();
  $("devsite-content-footer, devsite-page-rating").remove();
  // Remove any remaining custom elements starting with "devsite-"
  $("*").filter(function () {
    const tagName = (this as any).tagName ?? "";
    return typeof tagName === "string" && tagName.startsWith("devsite-");
  }).remove();
};

export const kotlinAndroidConfig: ScraperConfig = {
  name: "kotlin-android/latest",
  version: "latest",
  baseUrl: "https://developer.android.com/kotlin",
  container: "article.devsite-article",
  skip: [
    "/stories",
    "/samples",
    "/reference/",
    "/images/",
    "/videos/",
    "developer.android.com/develop",
    "developer.android.com/studio",
    "developer.android.com/guide",
    "developer.android.com/training",
    "developer.android.com/games",
  ],
  concurrency: 3,
  customFilters: [kotlinAndroidCleanHtml],
};
