import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const djangoCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove Sphinx navigation elements
  $(".sphinxsidebar, .related").remove();
  // Remove console-block labels (e.g. "...\n" prefixes)
  $(".console-block .console-input-label").remove();
  // Remove permalink anchors
  $(".headerlink").remove();
  // Remove footer
  $(".footer").remove();
};

const sharedDjangoConfig = {
  container: "[role='main']",
  skip: [
    "contents/",
    "genindex/",
    "py-modindex/",
    "glossary/",
    "search/",
    "faq/",
    "internals/",
    "misc/",
    "releases/",
  ],
  concurrency: 5,
  customFilters: [djangoCleanHtml],
} as const;

export const djangoConfig52: ScraperConfig = {
  name: "django/5.2",
  version: "5.2",
  baseUrl: "https://docs.djangoproject.com/en/5.2/",
  ...sharedDjangoConfig,
};

export const djangoConfig51: ScraperConfig = {
  name: "django/5.1",
  version: "5.1",
  baseUrl: "https://docs.djangoproject.com/en/5.1/",
  ...sharedDjangoConfig,
};
