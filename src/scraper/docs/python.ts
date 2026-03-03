import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const pythonCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove Sphinx sidebar
  $(".sphinxsidebar").remove();
  // Remove toctree wrappers (table of contents)
  $(".toctree-wrapper").remove();
  // Remove permalink anchors
  $(".headerlink").remove();
  // Remove section numbering from headings (e.g. "1.2.3. Title" → "Title")
  $("h1, h2, h3, h4, h5, h6").each((_i, el) => {
    const $el = $(el);
    const text = $el.text().replace(/^\d+(\.\d+)*\.\s+/, "");
    $el.text(text);
  });
  // Remove footer navigation
  $(".footer, .related").remove();
};

const sharedPythonConfig = {
  container: "[role='main']",
  skip: [
    "whatsnew/",
    "installing/",
    "distributing/",
    "extending/",
    "c-api/",
    "contents.html",
    "genindex",
    "py-modindex",
    "search.html",
    "bugs.html",
    "about.html",
  ],
  concurrency: 5,
  customFilters: [pythonCleanHtml],
} as const;

export const pythonConfig313: ScraperConfig = {
  name: "python/3.13",
  version: "3.13",
  baseUrl: "https://docs.python.org/3.13/",
  ...sharedPythonConfig,
};

export const pythonConfig312: ScraperConfig = {
  name: "python/3.12",
  version: "3.12",
  baseUrl: "https://docs.python.org/3.12/",
  ...sharedPythonConfig,
};
